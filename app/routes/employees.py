# employees.py
from flask import Blueprint, jsonify, request, session
from firebase_admin import firestore
import datetime
import logging
from functools import wraps
from ..firebase.init_firebase import db

logger = logging.getLogger(__name__)
employees_bp = Blueprint('employees', __name__, url_prefix='/api/employees')


def company_required(f):
    """Décorateur pour vérifier que l'utilisateur est une entreprise"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'uid' not in session or session.get('account_type') != 'company':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        return f(*args, **kwargs)

    return decorated_function


@employees_bp.route('/list', methods=['GET'])
@company_required
def get_employees():
    """Récupérer la liste des employés de l'entreprise"""
    try:
        company_id = session['uid']

        # Récupérer tous les employés de l'entreprise
        employees_ref = db.collection('employees') \
            .where('company_id', '==', company_id) \
            .order_by('hire_date', direction=firestore.Query.DESCENDING)

        employees = []
        for doc in employees_ref.stream():
            data = doc.to_dict()
            data['id'] = doc.id

            # Formater les dates
            if 'hire_date' in data:
                data['hire_date'] = data['hire_date'].isoformat() if hasattr(data['hire_date'], 'isoformat') else str(
                    data['hire_date'])

            if 'start_date' in data:
                data['start_date'] = data['start_date'].isoformat() if hasattr(data['start_date'],
                                                                               'isoformat') else str(data['start_date'])

            # Récupérer les informations complémentaires du candidat
            candidate_doc = db.collection('users').document(data['candidate_id']).get()
            if candidate_doc.exists:
                candidate_data = candidate_doc.to_dict()
                data['email'] = candidate_data.get('email', data.get('email', ''))
                data['phone'] = candidate_data.get('phone', data.get('phone', ''))
                data['location'] = candidate_data.get('location', data.get('location', ''))
                data['country'] = candidate_data.get('country', data.get('country', ''))
                data['profile_image_url'] = candidate_data.get('profileImageUrl', '')

                # Compétences et langues
                data['skills'] = candidate_data.get('skills', [])
                data['languages'] = candidate_data.get('languages', [])

            employees.append(data)

        # Statistiques
        stats = {
            'total': len(employees),
            'active': len([e for e in employees if e.get('status') == 'active']),
            'inactive': len([e for e in employees if e.get('status') == 'inactive']),
            'on_leave': len([e for e in employees if e.get('status') == 'on_leave']),
            'by_department': {}
        }

        # Regroupement par département/position
        for employee in employees:
            position = employee.get('position', 'Non spécifié')
            stats['by_department'][position] = stats['by_department'].get(position, 0) + 1

        return jsonify({
            'success': True,
            'employees': employees,
            'stats': stats
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des employés: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@employees_bp.route('/<employee_id>', methods=['GET'])
@company_required
def get_employee_detail(employee_id):
    """Récupérer les détails d'un employé spécifique"""
    try:
        company_id = session['uid']

        # Vérifier que l'employé appartient à l'entreprise
        employee_doc = db.collection('employees').document(employee_id).get()
        if not employee_doc.exists:
            return jsonify({'success': False, 'error': 'Employé non trouvé'}), 404

        employee_data = employee_doc.to_dict()
        if employee_data['company_id'] != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Récupérer les informations complètes du candidat
        candidate_id = employee_data['candidate_id']
        candidate_doc = db.collection('users').document(candidate_id).get()

        if candidate_doc.exists:
            candidate_data = candidate_doc.to_dict()

            # Fusionner les données
            employee_data.update({
                'full_profile': {
                    'bio': candidate_data.get('bio', ''),
                    'experience': candidate_data.get('experience', []),
                    'education': candidate_data.get('education', []),
                    'portfolio': candidate_data.get('portfolio', []),
                    'linkedin': candidate_data.get('linkedin', ''),
                    'cv_url': candidate_data.get('cvUrl', ''),
                    'skills': candidate_data.get('skills', []),
                    'languages': candidate_data.get('languages', []),
                    'profile_image_url': candidate_data.get('profileImageUrl', '')
                }
            })

        # Récupérer le contrat associé
        if 'contract_id' in employee_data and employee_data['contract_id']:
            contract_doc = db.collection('contracts').document(employee_data['contract_id']).get()
            if contract_doc.exists:
                employee_data['contract'] = contract_doc.to_dict()

        employee_data['id'] = employee_id

        # Formater les dates
        for date_field in ['hire_date', 'start_date', 'created_at', 'updated_at']:
            if date_field in employee_data:
                value = employee_data[date_field]
                if hasattr(value, 'isoformat'):
                    employee_data[date_field] = value.isoformat()

        return jsonify({
            'success': True,
            'employee': employee_data
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'employé: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@employees_bp.route('/<employee_id>/update', methods=['POST'])
@company_required
def update_employee(employee_id):
    """Mettre à jour les informations d'un employé"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Vérifier que l'employé appartient à l'entreprise
        employee_doc = db.collection('employees').document(employee_id).get()
        if not employee_doc.exists:
            return jsonify({'success': False, 'error': 'Employé non trouvé'}), 404

        employee_data = employee_doc.to_dict()
        if employee_data['company_id'] != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Champs autorisés à être mis à jour
        allowed_fields = ['position', 'salary', 'status', 'contract_type']
        update_data = {}

        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        if not update_data:
            return jsonify({'success': False, 'error': 'Aucune donnée valide à mettre à jour'}), 400

        # Ajouter la date de mise à jour
        update_data['updated_at'] = datetime.datetime.now()

        # Mettre à jour dans Firestore
        db.collection('employees').document(employee_id).update(update_data)

        # Si le statut est modifié, créer une notification
        if 'status' in update_data:
            # Log de l'historique des statuts
            history_data = {
                'employee_id': employee_id,
                'previous_status': employee_data.get('status'),
                'new_status': update_data['status'],
                'changed_by': company_id,
                'change_date': datetime.datetime.now(),
                'reason': data.get('reason', '')
            }
            db.collection('employee_status_history').add(history_data)

        return jsonify({
            'success': True,
            'message': 'Employé mis à jour avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'employé: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@employees_bp.route('/stats', methods=['GET'])
@company_required
def get_employee_stats():
    """Récupérer les statistiques détaillées des employés"""
    try:
        company_id = session['uid']

        # Récupérer tous les employés
        employees_ref = db.collection('employees') \
            .where('company_id', '==', company_id) \
            .stream()

        employees = []
        for doc in employees_ref.stream():
            data = doc.to_dict()
            data['id'] = doc.id
            employees.append(data)

        # Statistiques détaillées
        stats = {
            'total': len(employees),
            'by_status': {
                'active': 0,
                'inactive': 0,
                'on_leave': 0,
                'terminated': 0
            },
            'by_contract_type': {},
            'by_position': {},
            'salary_stats': {
                'total': 0,
                'average': 0,
                'min': float('inf'),
                'max': 0
            },
            'hiring_timeline': {},
            'by_country': {}
        }

        total_salary = 0
        salary_count = 0

        for employee in employees:
            # Par statut
            status = employee.get('status', 'active')
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1

            # Par type de contrat
            contract_type = employee.get('contract_type', 'Non spécifié')
            stats['by_contract_type'][contract_type] = stats['by_contract_type'].get(contract_type, 0) + 1

            # Par position
            position = employee.get('position', 'Non spécifié')
            stats['by_position'][position] = stats['by_position'].get(position, 0) + 1

            # Statistiques salariales
            salary = employee.get('salary')
            if salary:
                try:
                    salary_val = float(salary)
                    total_salary += salary_val
                    salary_count += 1
                    stats['salary_stats']['min'] = min(stats['salary_stats']['min'], salary_val)
                    stats['salary_stats']['max'] = max(stats['salary_stats']['max'], salary_val)
                except:
                    pass

            # Timeline d'embauche
            if 'hire_date' in employee:
                hire_date = employee['hire_date']
                if hasattr(hire_date, 'month'):
                    month_key = f"{hire_date.year}-{hire_date.month:02d}"
                    stats['hiring_timeline'][month_key] = stats['hiring_timeline'].get(month_key, 0) + 1

            # Par pays
            country = employee.get('country', 'Non spécifié')
            stats['by_country'][country] = stats['by_country'].get(country, 0) + 1

        # Calcul de la moyenne salariale
        if salary_count > 0:
            stats['salary_stats']['total'] = total_salary
            stats['salary_stats']['average'] = total_salary / salary_count

        # Si min n'a pas changé, mettre à 0
        if stats['salary_stats']['min'] == float('inf'):
            stats['salary_stats']['min'] = 0

        # Trier les données
        stats['by_position'] = dict(sorted(stats['by_position'].items(), key=lambda x: x[1], reverse=True)[:10])
        stats['hiring_timeline'] = dict(sorted(stats['hiring_timeline'].items()))

        return jsonify({
            'success': True,
            'stats': stats
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@employees_bp.route('/search', methods=['POST'])
@company_required
def search_employees():
    """Rechercher des employés par critères"""
    try:
        company_id = session['uid']
        data = request.get_json()

        query = db.collection('employees') \
            .where('company_id', '==', company_id)

        # Filtrer par statut
        if 'status' in data and data['status']:
            query = query.where('status', '==', data['status'])

        # Filtrer par position
        if 'position' in data and data['position']:
            query = query.where('position', '==', data['position'])

        # Filtrer par type de contrat
        if 'contract_type' in data and data['contract_type']:
            query = query.where('contract_type', '==', data['contract_type'])

        employees = []
        for doc in query.stream():
            data = doc.to_dict()
            data['id'] = doc.id

            # Récupérer les infos du candidat
            candidate_doc = db.collection('users').document(data['candidate_id']).get()
            if candidate_doc.exists:
                candidate_data = candidate_doc.to_dict()
                data['email'] = candidate_data.get('email', '')
                data['phone'] = candidate_data.get('phone', '')
                data['profile_image_url'] = candidate_data.get('profileImageUrl', '')

            employees.append(data)

        return jsonify({
            'success': True,
            'employees': employees,
            'count': len(employees)
        })

    except Exception as e:
        logger.error(f"Erreur lors de la recherche d'employés: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500