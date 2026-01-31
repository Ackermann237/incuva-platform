# backend/app/routes/payroll.py
import json

from flask import Blueprint, jsonify, request, session
from firebase_admin import firestore
import datetime
import logging
import uuid
from functools import wraps

from .contracts import generate_first_payslip
from ..ai.payroll_ia import PayrollAIManager
from ..firebase.init_firebase import db
from ..ai.manage import get_ai_manager, HFChatClient

logger = logging.getLogger(__name__)
payroll_bp = Blueprint('payroll', __name__, url_prefix='/api/payroll')


def company_required(f):
    """Décorateur pour vérifier que l'utilisateur est une entreprise"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'uid' not in session or session.get('account_type') != 'company':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        return f(*args, **kwargs)

    return decorated_function


@payroll_bp.route('/ai/analyze_payroll', methods=['POST'])
@company_required
def analyze_payroll_ai():
    try:
        payload = request.get_json() or {}
        payroll_data = payload.get('payroll_data')

        if not payroll_data:
            return jsonify({'success': False, 'error': 'Données de paie manquantes'}), 400

        payroll_ai = get_ai_manager("payroll")
        result = payroll_ai.analyze_payroll_trends(payroll_data)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Erreur IA Paie: {str(e)}")
        return jsonify({'success': False, 'error': 'Erreur lors de l’analyse IA'}), 500



@payroll_bp.route('/employees', methods=['GET'])
@company_required
def get_employees_for_payroll():
    """Récupérer les employés pour la paie"""
    try:
        company_id = session['uid']

        # Récupérer tous les employés actifs
        employees_ref = db.collection('employees') \
            .where('company_id', '==', company_id) \
            .where('status', 'in', ['active', 'on_leave'])

        employees = []
        for doc in employees_ref.stream():
            data = doc.to_dict()
            data['id'] = doc.id

            # Récupérer les infos du candidat
            if 'candidate_id' in data:
                candidate_doc = db.collection('users').document(data['candidate_id']).get()
                if candidate_doc.exists:
                    candidate_data = candidate_doc.to_dict()
                    data['email'] = candidate_data.get('email', '')
                    data['phone'] = candidate_data.get('phone', '')
                    data['profile_image_url'] = candidate_data.get('profileImageUrl', '')

            # Récupérer le dernier bulletin si existant
            payslip_ref = db.collection('payslips') \
                .where('employee_id', '==', doc.id) \
                .order_by('period_end', direction=firestore.Query.DESCENDING) \
                .limit(1)

            last_payslip = None
            for payslip in payslip_ref.stream():
                last_payslip = payslip.to_dict()
                last_payslip['id'] = payslip.id

            data['last_payslip'] = last_payslip
            employees.append(data)

        return jsonify({
            'success': True,
            'employees': employees
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des employés: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/payslips', methods=['GET'])
@company_required
def get_payslips():
    """Récupérer les bulletins de paie"""
    try:
        company_id = session['uid']

        # Paramètres de filtrage
        employee_id = request.args.get('employee_id')
        period_start = request.args.get('period_start')
        period_end = request.args.get('period_end')
        status = request.args.get('status')

        # Construire la requête
        query = db.collection('payslips').where('company_id', '==', company_id)

        if employee_id and employee_id != 'all':
            query = query.where('employee_id', '==', employee_id)

        if period_start and period_end:
            query = query.where('period_start', '>=', period_start) \
                .where('period_end', '<=', period_end)

        if status and status != 'all':
            query = query.where('status', '==', status)

        # Trier par période (plus récent en premier)
        query = query.order_by('period_end', direction=firestore.Query.DESCENDING)

        payslips = []
        for doc in query.stream():
            data = doc.to_dict()
            data['id'] = doc.id

            # Récupérer les infos de l'employé
            if 'employee_id' in data:
                employee_doc = db.collection('employees').document(data['employee_id']).get()
                if employee_doc.exists:
                    emp_data = employee_doc.to_dict()
                    data['employee_name'] = emp_data.get('candidate_name', 'Inconnu')
                    data['position'] = emp_data.get('position', 'Non spécifié')

                    # Récupérer les infos du candidat
                    if 'candidate_id' in emp_data:
                        candidate_doc = db.collection('users').document(emp_data['candidate_id']).get()
                        if candidate_doc.exists:
                            candidate_data = candidate_doc.to_dict()
                            data['employee_email'] = candidate_data.get('email', '')

            payslips.append(data)

        return jsonify({
            'success': True,
            'payslips': payslips
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des bulletins: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/payslip/<payslip_id>', methods=['GET'])
@company_required
def get_payslip_detail(payslip_id):
    """Récupérer les détails d'un bulletin de paie"""
    try:
        company_id = session['uid']

        # Récupérer le bulletin
        payslip_doc = db.collection('payslips').document(payslip_id).get()
        if not payslip_doc.exists:
            return jsonify({'success': False, 'error': 'Bulletin non trouvé'}), 404

        payslip_data = payslip_doc.to_dict()

        # Vérifier que le bulletin appartient à l'entreprise
        if payslip_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Récupérer les infos de l'employé
        employee_id = payslip_data.get('employee_id')
        employee_doc = db.collection('employees').document(employee_id).get()
        if employee_doc.exists:
            emp_data = employee_doc.to_dict()
            payslip_data['employee_info'] = {
                'name': emp_data.get('candidate_name', 'Inconnu'),
                'position': emp_data.get('position', 'Non spécifié'),
                'contract_type': emp_data.get('contract_type', 'CDI'),
                'bank_details': emp_data.get('bank_details', {})
            }

            # Récupérer les infos du candidat
            if 'candidate_id' in emp_data:
                candidate_doc = db.collection('users').document(emp_data['candidate_id']).get()
                if candidate_doc.exists:
                    candidate_data = candidate_doc.to_dict()
                    payslip_data['employee_info']['email'] = candidate_data.get('email', '')
                    payslip_data['employee_info']['address'] = candidate_data.get('address', {})

        return jsonify({
            'success': True,
            'payslip': payslip_data
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération du bulletin: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/generate', methods=['POST'])
@company_required
def generate_payslip():
    """Générer un nouveau bulletin de paie"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Validation des données
        required_fields = ['employee_id', 'period_start', 'period_end', 'gross_salary']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Champ manquant: {field}'}), 400

        # Vérifier que l'employé appartient à l'entreprise
        employee_doc = db.collection('employees').document(data['employee_id']).get()
        if not employee_doc.exists:
            return jsonify({'success': False, 'error': 'Employé non trouvé'}), 404

        employee_data = employee_doc.to_dict()
        if employee_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Calculer les cotisations (simplifié)
        gross_salary = float(data['gross_salary'])

        # Cotisations salariales (environ 23%)
        employee_contributions = {
            'social_security': round(gross_salary * 0.068, 2),
            'health_insurance': round(gross_salary * 0.077, 2),
            'pension': round(gross_salary * 0.083, 2),
            'unemployment': round(gross_salary * 0.024, 2)
        }

        # Cotisations patronales (environ 42%)
        employer_contributions = {
            'social_security': round(gross_salary * 0.13, 2),
            'health_insurance': round(gross_salary * 0.128, 2),
            'pension': round(gross_salary * 0.162, 2)
        }

        total_employee_contributions = sum(employee_contributions.values())
        total_employer_contributions = sum(employer_contributions.values())

        # Impôt sur le revenu (estimation)
        income_tax = round(gross_salary * 0.15, 2)

        # Salaire net
        net_salary = round(gross_salary - total_employee_contributions - income_tax, 2)

        # Coût total pour l'employeur
        total_cost = round(gross_salary + total_employer_contributions, 2)

        # Créer le bulletin
        payslip_data = {
            'company_id': company_id,
            'employee_id': data['employee_id'],
            'period_start': data['period_start'],
            'period_end': data['period_end'],
            'gross_salary': gross_salary,
            'net_salary': net_salary,
            'employee_contributions': employee_contributions,
            'total_employee_contributions': total_employee_contributions,
            'employer_contributions': employer_contributions,
            'total_employer_contributions': total_employer_contributions,
            'income_tax': income_tax,
            'total_cost': total_cost,
            'hours_worked': data.get('hours_worked', 151.67),  # Moyenne mensuelle
            'hourly_rate': round(gross_salary / 151.67, 2),
            'overtime_hours': data.get('overtime_hours', 0),
            'overtime_pay': data.get('overtime_pay', 0),
            'bonuses': data.get('bonuses', 0),
            'deductions': data.get('deductions', 0),
            'status': 'draft',
            'payment_method': data.get('payment_method', 'bank_transfer'),
            'payment_date': data.get('payment_date'),
            'notes': data.get('notes', ''),
            'generated_at': datetime.datetime.now(),
            'payslip_number': f"PAY-{datetime.datetime.now().strftime('%Y%m')}-{str(uuid.uuid4())[:8]}"
        }

        # Sauvegarder dans Firestore
        doc_ref = db.collection('payslips').add(payslip_data)

        return jsonify({
            'success': True,
            'message': 'Bulletin généré avec succès',
            'payslip_id': doc_ref[1].id,
            'payslip_number': payslip_data['payslip_number']
        })

    except Exception as e:
        logger.error(f"Erreur lors de la génération du bulletin: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/payslip/<payslip_id>', methods=['PUT'])
@company_required
def update_payslip(payslip_id):
    """Mettre à jour un bulletin de paie"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Vérifier que le bulletin appartient à l'entreprise
        payslip_doc = db.collection('payslips').document(payslip_id).get()
        if not payslip_doc.exists:
            return jsonify({'success': False, 'error': 'Bulletin non trouvé'}), 404

        payslip_data = payslip_doc.to_dict()
        if payslip_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Champs pouvant être mis à jour
        updatable_fields = [
            'gross_salary', 'hours_worked', 'overtime_hours', 'overtime_pay',
            'bonuses', 'deductions', 'payment_method', 'payment_date',
            'notes', 'status'
        ]

        update_data = {
            'updated_at': datetime.datetime.now()
        }

        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]

        # Recalculer si le salaire brut change
        if 'gross_salary' in data:
            gross_salary = float(data['gross_salary'])

            # Recalculer les cotisations
            employee_contributions = {
                'social_security': round(gross_salary * 0.068, 2),
                'health_insurance': round(gross_salary * 0.077, 2),
                'pension': round(gross_salary * 0.083, 2),
                'unemployment': round(gross_salary * 0.024, 2)
            }

            employer_contributions = {
                'social_security': round(gross_salary * 0.13, 2),
                'health_insurance': round(gross_salary * 0.128, 2),
                'pension': round(gross_salary * 0.162, 2)
            }

            total_employee_contributions = sum(employee_contributions.values())
            total_employer_contributions = sum(employer_contributions.values())
            income_tax = round(gross_salary * 0.15, 2)
            net_salary = round(gross_salary - total_employee_contributions - income_tax, 2)
            total_cost = round(gross_salary + total_employer_contributions, 2)

            update_data.update({
                'employee_contributions': employee_contributions,
                'total_employee_contributions': total_employee_contributions,
                'employer_contributions': employer_contributions,
                'total_employer_contributions': total_employer_contributions,
                'income_tax': income_tax,
                'net_salary': net_salary,
                'total_cost': total_cost,
                'hourly_rate': round(gross_salary / 151.67, 2)
            })

        # Mettre à jour
        db.collection('payslips').document(payslip_id).update(update_data)

        return jsonify({
            'success': True,
            'message': 'Bulletin mis à jour avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du bulletin: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/payslip/<payslip_id>/approve', methods=['POST'])
@company_required
def approve_payslip(payslip_id):
    """Approuver un bulletin de paie"""
    try:
        company_id = session['uid']

        # Vérifier que le bulletin appartient à l'entreprise
        payslip_doc = db.collection('payslips').document(payslip_id).get()
        if not payslip_doc.exists:
            return jsonify({'success': False, 'error': 'Bulletin non trouvé'}), 404

        payslip_data = payslip_doc.to_dict()
        if payslip_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Mettre à jour le statut
        update_data = {
            'status': 'approved',
            'approved_by': company_id,
            'approved_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }

        db.collection('payslips').document(payslip_id).update(update_data)

        # Créer une notification pour l'employé
        employee_doc = db.collection('employees').document(payslip_data['employee_id']).get()
        if employee_doc.exists:
            emp_data = employee_doc.to_dict()

            notification_data = {
                'employee_id': payslip_data['employee_id'],
                'company_id': company_id,
                'type': 'payslip_approved',
                'title': 'Bulletin de paie disponible',
                'message': f'Votre bulletin de paie pour la période {payslip_data["period_start"]} - {payslip_data["period_end"]} est disponible.',
                'read': False,
                'created_at': datetime.datetime.now(),
                'data': {
                    'payslip_id': payslip_id,
                    'period': f"{payslip_data['period_start']} - {payslip_data['period_end']}",
                    'net_salary': payslip_data.get('net_salary', 0)
                }
            }

            db.collection('notifications').add(notification_data)

        return jsonify({
            'success': True,
            'message': 'Bulletin approuvé avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur lors de l'approbation du bulletin: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/payslip/<payslip_id>/pay', methods=['POST'])
@company_required
def mark_as_paid(payslip_id):
    """Marquer un bulletin comme payé"""
    try:
        company_id = session['uid']

        # Vérifier que le bulletin appartient à l'entreprise
        payslip_doc = db.collection('payslips').document(payslip_id).get()
        if not payslip_doc.exists:
            return jsonify({'success': False, 'error': 'Bulletin non trouvé'}), 404

        payslip_data = payslip_doc.to_dict()
        if payslip_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Mettre à jour le statut
        update_data = {
            'status': 'paid',
            'paid_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }

        db.collection('payslips').document(payslip_id).update(update_data)

        return jsonify({
            'success': True,
            'message': 'Bulletin marqué comme payé'
        })

    except Exception as e:
        logger.error(f"Erreur lors du marquage comme payé: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/stats', methods=['GET'])
@company_required
def get_payroll_stats():
    """Récupérer les statistiques de la paie"""
    try:
        company_id = session['uid']

        # Récupérer tous les bulletins
        payslips_ref = db.collection('payslips').where('company_id', '==', company_id)
        payslips = []

        for doc in payslips_ref.stream():
            data = doc.to_dict()
            payslips.append(data)

        # Récupérer les employés
        employees_ref = db.collection('employees').where('company_id', '==', company_id)
        employees = []

        for doc in employees_ref.stream():
            employees.append(doc.id)

        # Calculer les statistiques
        stats = {
            'total_payslips': len(payslips),
            'total_employees': len(employees),
            'by_status': {
                'draft': 0,
                'approved': 0,
                'paid': 0,
                'cancelled': 0
            },
            'total_payroll_cost': 0,
            'average_salary': 0,
            'by_month': {},
            'this_month_total': 0,
            'pending_payments': 0,
            'taxes_total': 0,
            'contributions_total': 0
        }

        total_salary = 0
        salary_count = 0
        current_month = datetime.datetime.now().strftime('%Y-%m')

        for payslip in payslips:
            # Par statut
            status = payslip.get('status', 'draft')
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1

            # Coût total
            total_cost = payslip.get('total_cost', 0)
            stats['total_payroll_cost'] += total_cost

            # Salaires
            gross_salary = payslip.get('gross_salary', 0)
            total_salary += gross_salary
            salary_count += 1

            # Taxes et contributions
            stats['taxes_total'] += payslip.get('income_tax', 0)
            stats['contributions_total'] += payslip.get('total_employee_contributions', 0) + payslip.get(
                'total_employer_contributions', 0)

            # Par mois
            if 'period_end' in payslip:
                try:
                    month = payslip['period_end'].strftime('%Y-%m') if hasattr(payslip['period_end'], 'strftime') else \
                    payslip['period_end'][:7]
                    if month not in stats['by_month']:
                        stats['by_month'][month] = 0
                    stats['by_month'][month] += total_cost

                    if month == current_month:
                        stats['this_month_total'] += total_cost
                except:
                    pass

            # Paiements en attente
            if status == 'approved':
                stats['pending_payments'] += total_cost

        # Calcul de la moyenne
        if salary_count > 0:
            stats['average_salary'] = round(total_salary / salary_count, 2)

        return jsonify({
            'success': True,
            'stats': stats
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/export/<format>', methods=['GET'])
@company_required
def export_payroll(format):
    """Exporter les données de paie"""
    try:
        company_id = session['uid']

        # Récupérer les bulletins
        payslips = []
        payslips_ref = db.collection('payslips').where('company_id', '==', company_id)

        for doc in payslips_ref.stream():
            data = doc.to_dict()
            data['id'] = doc.id
            payslips.append(data)

        # Préparer les données pour l'export
        export_data = {
            'company_id': company_id,
            'generated_at': datetime.datetime.now().isoformat(),
            'total_records': len(payslips),
            'payslips': payslips
        }

        if format == 'csv':
            # Ici vous pourriez générer un CSV
            return jsonify({
                'success': True,
                'message': 'Export CSV non implémenté',
                'data': export_data
            })
        elif format == 'excel':
            # Ici vous pourriez générer un Excel
            return jsonify({
                'success': True,
                'message': 'Export Excel non implémenté',
                'data': export_data
            })
        else:
            return jsonify({
                'success': True,
                'data': export_data
            })

    except Exception as e:
        logger.error(f"Erreur lors de l'export: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/company/info', methods=['GET'])
@company_required
def get_company_info():
    """Récupérer les informations de l'entreprise"""
    try:
        company_id = session['uid']

        # Récupérer les informations de l'entreprise
        company_doc = db.collection('users').document(company_id).get()
        if not company_doc.exists:
            return jsonify({'success': False, 'error': 'Entreprise non trouvée'}), 404

        company_data = company_doc.to_dict()

        # Formater les données
        formatted_data = {
            'company_name': company_data.get('companyName', ''),
            'address': company_data.get('address', {}),
            'city': company_data.get('city', ''),
            'country': company_data.get('country', ''),
            'siret': company_data.get('siret', ''),
            'industry': company_data.get('industry', ''),
            'email': company_data.get('email', ''),
            'phone': company_data.get('phone', ''),
            'company_size': company_data.get('company_size', ''),
            'geographic_area': company_data.get('geographic_area', '')
        }

        return jsonify({
            'success': True,
            'company': formatted_data
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des infos entreprise: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/employee/<employee_id>/complete', methods=['GET'])
@company_required
def get_employee_complete_info(employee_id):
    """Récupérer les informations complètes d'un employé"""
    try:
        company_id = session['uid']

        # Vérifier que l'employé appartient à l'entreprise
        employee_doc = db.collection('employees').document(employee_id).get()
        if not employee_doc.exists:
            return jsonify({'success': False, 'error': 'Employé non trouvé'}), 404

        employee_data = employee_doc.to_dict()

        if employee_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Récupérer les infos du candidat
        candidate_id = employee_data.get('candidate_id')
        candidate_info = {}

        if candidate_id:
            candidate_doc = db.collection('users').document(candidate_id).get()
            if candidate_doc.exists:
                candidate_data = candidate_doc.to_dict()
                candidate_info = {
                    'email': candidate_data.get('email', ''),
                    'phone': candidate_data.get('phone', ''),
                    'address': candidate_data.get('address', {}),
                    'nationality': candidate_data.get('nationality', ''),
                    'birth_date': candidate_data.get('birth_date', ''),
                    'social_security_number': candidate_data.get('social_security_number', ''),
                    'bank_details': candidate_data.get('bank_details', {})
                }

        # Informations combinées
        complete_info = {
            'employee_id': employee_id,
            'candidate_name': employee_data.get('candidate_name', ''),
            'position': employee_data.get('position', ''),
            'contract_type': employee_data.get('contract_type', 'CDI'),
            'hire_date': employee_data.get('hire_date', ''),
            'status': employee_data.get('status', 'active'),
            'department': employee_data.get('department', ''),
            'salary_grade': employee_data.get('salary_grade', ''),
            'personal_info': candidate_info
        }

        return jsonify({
            'success': True,
            'employee': complete_info
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des infos employé: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/auto_setup/<employee_id>', methods=['POST'])
@company_required
def setup_auto_payroll(employee_id):
    """Configurer la paie automatique pour un employé"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Vérifier que l'employé appartient à l'entreprise
        employee_doc = db.collection('employees').document(employee_id).get()
        if not employee_doc.exists:
            return jsonify({'success': False, 'error': 'Employé non trouvé'}), 404

        employee_data = employee_doc.to_dict()
        if employee_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Récupérer le salaire du contrat
        salary = employee_data.get('salary', 0)
        contract_type = employee_data.get('contract_type', 'CDI')

        # Calculer les périodes
        today = datetime.datetime.now()
        period_start = datetime.datetime(today.year, today.month, 1)
        period_end = (period_start + datetime.timedelta(days=31)).replace(day=1) - datetime.timedelta(days=1)
        payment_date = get_last_working_day(period_end)

        # Configuration de paie automatique
        payroll_config = {
            'employee_id': employee_id,
            'company_id': company_id,
            'contract_type': contract_type,
            'gross_salary': float(salary),
            'period_start': period_start,
            'period_end': period_end,
            'payment_date': payment_date,
            'payment_method': data.get('payment_method', 'bank_transfer'),
            'payment_frequency': data.get('payment_frequency', 'monthly'),
            'auto_generate': True,
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }

        # Sauvegarder la configuration
        db.collection('payroll_configurations').add(payroll_config)

        # Générer le premier bulletin
        generate_first_payslip(employee_id, company_id, salary, period_start, period_end, payment_date)

        return jsonify({
            'success': True,
            'message': 'Paie configurée automatiquement avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur lors de la configuration automatique de la paie: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


def get_last_working_day(end_date):
    """Trouve le dernier jour ouvré du mois (fonction utilitaire)"""
    last_day = end_date
    if last_day.weekday() == 5:  # Samedi
        last_day = last_day - datetime.timedelta(days=1)
    elif last_day.weekday() == 6:  # Dimanche
        last_day = last_day - datetime.timedelta(days=2)
    return last_day


@payroll_bp.route('/ai/all-payslips', methods=['GET'])
@company_required
def get_all_payslips_for_ai():
    """Récupérer TOUS les bulletins pour l'analyse IA"""
    try:
        company_id = session['uid']

        # Récupérer tous les bulletins sans filtre
        payslips_ref = db.collection('payslips') \
            .where('company_id', '==', company_id) \
            .order_by('period_end', direction=firestore.Query.DESCENDING)

        payslips = []
        for doc in payslips_ref.stream():
            data = doc.to_dict()
            data['id'] = doc.id

            # Récupérer les infos de l'employé
            if 'employee_id' in data:
                employee_doc = db.collection('employees').document(data['employee_id']).get()
                if employee_doc.exists:
                    emp_data = employee_doc.to_dict()
                    data['employee_name'] = emp_data.get('candidate_name', 'Inconnu')
                    data['position'] = emp_data.get('position', 'Non spécifié')

            payslips.append(data)

        return jsonify({
            'success': True,
            'payslips': payslips
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des bulletins pour IA: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@payroll_bp.route('/ai/query', methods=['POST'])
@company_required
def query_payroll_ai():
    """Répondre aux questions spécifiques sur la paie"""
    try:
        payload = request.get_json() or {}
        question = payload.get('question')
        context = payload.get('context', {})

        if not question:
            return jsonify({'success': False, 'error': 'Question manquante'}), 400

        # Récupérer les données nécessaires
        company_id = session['uid']

        # Récupérer les bulletins récents pour le contexte
        payslips_ref = db.collection('payslips') \
            .where('company_id', '==', company_id) \
            .order_by('period_end', direction=firestore.Query.DESCENDING) \
            .limit(20)

        recent_payslips = []
        for doc in payslips_ref.stream():
            data = doc.to_dict()
            data['id'] = doc.id
            recent_payslips.append(data)

        # Préparer le contexte avec une fonction locale
        def summarize_payslips(payslips):
            """Résume les bulletins pour le contexte IA"""
            summary = {
                'total': len(payslips),
                'by_status': {},
                'total_gross': 0,
                'total_net': 0,
                'recent_periods': []
            }

            for payslip in payslips[:5]:  # 5 plus récents
                status = payslip.get('status', 'unknown')
                summary['by_status'][status] = summary['by_status'].get(status, 0) + 1
                summary['total_gross'] += payslip.get('gross_salary', 0)
                summary['total_net'] += payslip.get('net_salary', 0)

                if 'period_end' in payslip:
                    summary['recent_periods'].append(payslip.get('period_end'))

            return summary

        ai_context = {
            'company_id': company_id,
            'recent_payslips_count': len(recent_payslips),
            'recent_payslips_summary': summarize_payslips(recent_payslips),
            'user_context': context
        }

        # Utiliser l'IA pour répondre
        payroll_ai = get_ai_manager("payroll")
        answer = payroll_ai.answer_payroll_question(question, ai_context)

        return jsonify({
            'success': True,
            'answer': answer
        })

    except Exception as e:
        logger.error(f"Erreur query IA Paie: {str(e)}")
        return jsonify({'success': False, 'error': 'Erreur lors de la réponse IA'}), 500


def _summarize_payslips(self, payslips):
    """Résume les bulletins pour le contexte IA"""
    summary = {
        'total': len(payslips),
        'by_status': {},
        'total_gross': 0,
        'total_net': 0,
        'recent_periods': []
    }

    for payslip in payslips[:5]:  # 5 plus récents
        status = payslip.get('status', 'unknown')
        summary['by_status'][status] = summary['by_status'].get(status, 0) + 1
        summary['total_gross'] += payslip.get('gross_salary', 0)
        summary['total_net'] += payslip.get('net_salary', 0)

        if 'period_end' in payslip:
            summary['recent_periods'].append(payslip.get('period_end'))

    return summary

