import uuid

from firebase_admin import firestore
from flask import Blueprint, session, url_for, request, jsonify
from ..services.contract_service import ContractService
from ..services.messaging_service import MessagingService
from ..hr.contracts_generator import ContractGenerator
from ..firebase.init_firebase import db
import logging
import datetime

logger = logging.getLogger(__name__)
contracts_bp = Blueprint('contracts', __name__, url_prefix='/contracts', template_folder='templates/contracts')


def setup_automatic_payroll(employee_id, contract_data):
    """Configure la paie automatique pour un nouvel employé"""
    try:
        # Récupérer les informations nécessaires
        company_id = contract_data['company_id']
        salary = contract_data['salary']
        contract_type = contract_data['contract_type']
        start_date = contract_data.get('start_date', datetime.datetime.now())

        # Calculer la période de paie (du 1er au dernier jour du mois)
        today = datetime.datetime.now()
        period_start = datetime.datetime(today.year, today.month, 1)

        # Si la date de début est dans le futur, utiliser cette date
        if start_date > today:
            period_start = start_date

        period_end = (period_start + datetime.timedelta(days=31)).replace(day=1) - datetime.timedelta(days=1)

        # Déterminer la date de paiement (dernier jour ouvré du mois)
        payment_date = get_last_working_day(period_end)

        # Créer la configuration de paie
        payroll_config = {
            'employee_id': employee_id,
            'company_id': company_id,
            'contract_type': contract_type,
            'gross_salary': float(salary),
            'period_start': period_start,
            'period_end': period_end,
            'payment_date': payment_date,
            'payment_method': 'bank_transfer',  # Par défaut
            'payment_frequency': 'monthly',  # Par défaut
            'auto_generate': True,  # Générer automatiquement les bulletins
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }

        # Sauvegarder la configuration
        payroll_config_ref = db.collection('payroll_configurations').add(payroll_config)
        payroll_config_id = payroll_config_ref[1].id

        # Créer le premier bulletin de paie
        generate_first_payslip(employee_id, company_id, salary, period_start, period_end, payment_date)

        logger.info(f"Paie configurée automatiquement pour l'employé {employee_id}")
        return payroll_config_id

    except Exception as e:
        logger.error(f"Erreur lors de la configuration automatique de la paie: {str(e)}")
        return None


def get_last_working_day(end_date):
    """Trouve le dernier jour ouvré du mois"""
    # Par défaut, le dernier jour du mois
    last_day = end_date

    # Si c'est un samedi, prendre le vendredi précédent
    if last_day.weekday() == 5:  # 5 = samedi
        last_day = last_day - datetime.timedelta(days=1)
    # Si c'est un dimanche, prendre le vendredi précédent
    elif last_day.weekday() == 6:  # 6 = dimanche
        last_day = last_day - datetime.timedelta(days=2)

    return last_day


def generate_first_payslip(employee_id, company_id, salary, period_start, period_end, payment_date):
    """Génère le premier bulletin de paie pour un nouvel employé"""
    try:
        # Calculer les cotisations (même logique que dans payroll.py)
        gross_salary = float(salary)

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

        # Calculer le nombre d'heures travaillées (pro-rata si début en cours de mois)
        days_in_month = (period_end - period_start).days + 1
        work_days_in_month = 22  # Jours ouvrés moyens par mois
        days_worked = min(days_in_month, work_days_in_month)
        hours_worked = round((days_worked / work_days_in_month) * 151.67, 2)  # 151.67h = moyenne mensuelle
        hourly_rate = round(gross_salary / 151.67, 2)

        # Créer le bulletin
        payslip_data = {
            'company_id': company_id,
            'employee_id': employee_id,
            'period_start': period_start,
            'period_end': period_end,
            'gross_salary': gross_salary,
            'net_salary': net_salary,
            'employee_contributions': employee_contributions,
            'total_employee_contributions': total_employee_contributions,
            'employer_contributions': employer_contributions,
            'total_employer_contributions': total_employer_contributions,
            'income_tax': income_tax,
            'total_cost': total_cost,
            'hours_worked': hours_worked,
            'hourly_rate': hourly_rate,
            'overtime_hours': 0,
            'overtime_pay': 0,
            'bonuses': 0,
            'deductions': 0,
            'status': 'draft',
            'payment_method': 'bank_transfer',
            'payment_date': payment_date,
            'notes': f'Premier bulletin - Contrat signé le {datetime.datetime.now().strftime("%d/%m/%Y")}',
            'generated_at': datetime.datetime.now(),
            'payslip_number': f"PAY-{datetime.datetime.now().strftime('%Y%m')}-{str(uuid.uuid4())[:8]}",
            'is_auto_generated': True
        }

        # Sauvegarder dans Firestore
        doc_ref = db.collection('payslips').add(payslip_data)

        logger.info(f"Premier bulletin généré pour l'employé {employee_id}: {doc_ref[1].id}")
        return doc_ref[1].id

    except Exception as e:
        logger.error(f"Erreur lors de la génération du premier bulletin: {str(e)}")
        return None

@contracts_bp.route('/create/<chat_id>/<candidate_id>', methods=['POST'])
def create_contract_api(chat_id, candidate_id):
    if 'uid' not in session:
        return jsonify({'success': False, 'message': 'Veuillez vous connecter.'}), 401

    if session.get('account_type') != 'company':
        return jsonify({'success': False, 'message': 'Seules les entreprises peuvent créer des contrats.'}), 403

    try:
        # Vérifier chat
        chat_doc = db.collection('chats').document(chat_id).get()
        if not chat_doc.exists:
            return jsonify({'success': False, 'message': 'Conversation non trouvée.'}), 404

        chat_data = chat_doc.to_dict()
        if session['uid'] not in chat_data['participants']:
            return jsonify({'success': False, 'message': 'Accès non autorisé à cette conversation.'}), 403

        # Vérifier candidat
        candidate_doc = db.collection('users').document(candidate_id).get()
        if not candidate_doc.exists:
            return jsonify({'success': False, 'message': 'Candidat non trouvé.'}), 404

        candidate_data = candidate_doc.to_dict()
        candidate_name = candidate_data.get('name', 'Anonyme')

        # Récupérer les données du frontend
        data = request.get_json()
        position = data.get('position', '')
        salary = data.get('salary')
        contract_type = data.get('contract_type')
        description = data.get('description', '')
        job_source_id = data.get('job_source_id', 'manual')
        generation_mode = data.get('generation_mode', 'manual')

        # Validation des champs obligatoires
        if not position or not salary or not contract_type:
            return jsonify({'success': False, 'message': 'Position, salaire et type de contrat sont requis.'}), 400

        # Récupérer contract_content depuis le frontend
        contract_content = data.get('contract_content', '')
        if not contract_content:
            return jsonify({'success': False, 'message': 'Contenu du contrat manquant.'}), 400

        # Récupérer informations entreprise
        company_doc = db.collection('users').document(session['uid']).get()
        company_name = company_doc.to_dict().get('companyName', 'Entreprise') if company_doc.exists else 'Entreprise'

        # Vérifier si une offre est associée (optionnel)
        job_id = None
        if 'serviceId' in chat_data and chat_data['serviceId']:
            job_id = chat_data['serviceId']
            # Optionnel: vérifier si le job existe
            job_doc = db.collection('jobs').document(job_id).get()
            if not job_doc.exists:
                job_id = None  # Si le job n'existe plus, ignorer

        contract_service = ContractService(db)
        contract_data = {
            'position': position,
            'start_date': datetime.datetime.combine(datetime.date.today(), datetime.time()),
            'salary': float(salary),
            'contract_type': contract_type,
            'description': description,
            'company_id': session['uid'],
            'company_name': company_name,
            'candidate_id': candidate_id,
            'candidate_name': candidate_name,
            'chat_id': chat_id,
            'contract_content': contract_content,
            'job_source_id': job_source_id,
            'job_id': job_id,  # Peut être None
            'generation_mode': generation_mode,
            'custom_prompt_used': data.get('custom_prompt_used'),
            'status': 'pending'
        }
        contract_id = contract_service.create_contract(contract_data)

        # Envoyer notification
        messaging_service = MessagingService(db)
        contract_link = url_for('contracts.view_contract', contract_id=contract_id, _external=True)
        messaging_service.send_contract_message(
            chat_id=chat_id,
            sender_id=session['uid'],
            receiver_id=candidate_id,
            contract_details={
                'contract_id': contract_id,
                'position': position,
                'contract_link': contract_link
            }
        )

        return jsonify({
            'success': True,
            'message': 'Contrat créé avec succès.',
            'contract_id': contract_id,
            'contract_link': contract_link
        }), 201

    except Exception as e:
        logger.error(f"Erreur lors de la création du contrat: {str(e)}")
        return jsonify({'success': False, 'message': f'Erreur serveur : {str(e)}'}), 500


@contracts_bp.route('/generate', methods=['POST'])
def generate_contract():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    data = request.get_json()

    # Champs de base requis
    required_fields = ['position', 'salary', 'contract_type', 'chat_id', 'candidate_id']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'success': False, 'error': 'Données manquantes'}), 400

    try:
        # Vérifier l'accès au chat
        chat_doc = db.collection('chats').document(data['chat_id']).get()
        if not chat_doc.exists or session['uid'] not in chat_doc.to_dict()['participants']:
            return jsonify({'success': False, 'error': 'Accès non autorisé à cette conversation'}), 403

        # Récupérer informations candidat
        candidate_id = data['candidate_id']
        candidate_doc = db.collection('users').document(candidate_id).get()
        if not candidate_doc.exists:
            return jsonify({'success': False, 'error': 'Candidat non trouvé'}), 404

        candidate_data = candidate_doc.to_dict()
        candidate_name = candidate_data.get('name', 'Anonyme')
        candidate_country = candidate_data.get('country', 'Non spécifié')

        # Récupérer informations entreprise
        company_doc = db.collection('users').document(session['uid']).get()
        company_name = company_doc.to_dict().get('companyName',
                                                 'Entreprise Anonyme') if company_doc.exists else 'Entreprise Anonyme'

        # Récupérer le mode de génération
        ai_mode = data.get('ai_mode', 'auto')
        custom_prompt = data.get('custom_prompt')

        # Générer le contrat selon le mode
        contract_generator = ContractGenerator()
        contract_content = contract_generator.generate_contract(
            position=data['position'],
            salary=data['salary'],
            contract_type=data['contract_type'],
            company_name=company_name,
            candidate_name=candidate_name,
            candidate_country=candidate_country,
            ai_mode=ai_mode,
            custom_prompt=custom_prompt
        )

        return jsonify({
            'success': True,
            'contract_content': contract_content,
            'generation_mode': ai_mode
        })

    except Exception as e:
        logger.error(f"Erreur lors de la génération du contrat: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Erreur lors de la génération : {str(e)}'
        }), 500


@contracts_bp.route('/view/<contract_id>', methods=['GET', 'POST'])
def view_contract(contract_id):
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    contract_doc = db.collection('contracts').document(contract_id).get()
    if not contract_doc.exists:
        return jsonify({'success': False, 'error': 'Contrat non trouvé'}), 404

    contract_data = contract_doc.to_dict()
    user_id = session['uid']
    if user_id not in [contract_data['candidate_id'], contract_data['company_id']]:
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    # Si POST par le candidat pour accepter/rejeter
    if request.method == 'POST' and user_id == contract_data['candidate_id']:
        data = request.get_json()
        action = data.get('action')
        if action not in ['accept', 'reject']:
            return jsonify({'success': False, 'error': 'Action non valide'}), 400
        try:
            contract_service = ContractService(db)
            new_status = 'accepted' if action == 'accept' else 'rejected'
            contract_service.update_contract_status(contract_id, new_status)

            messaging_service = MessagingService(db)
            message_content = f"Le candidat {contract_data['candidate_name']} a {new_status} le contrat pour le poste de {contract_data['position']}."
            messaging_service.send_message(
                chat_id=contract_data['chat_id'],
                sender_id=user_id,
                receiver_id=contract_data['company_id'],
                content=message_content
            )
            return jsonify({'success': True, 'status': new_status})
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du contrat {contract_id}: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    # GET → retourne les détails du contrat
    company_doc = db.collection('users').document(contract_data['company_id']).get()
    company_name = company_doc.to_dict().get('companyName', 'Entreprise Anonyme') if company_doc.exists else 'Entreprise Anonyme'

    return jsonify({
        'success': True,
        'contract': contract_data,
        'company_name': company_name,
        'is_candidate': user_id == contract_data['candidate_id']
    })


# === AJOUTE CETTE ROUTE DANS contract.py ===
@contracts_bp.route('/list', methods=['GET'])
def list_contracts():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    try:
        company_id = session['uid']
        contracts_ref = db.collection('contracts')
        query = contracts_ref.where('company_id', '==', company_id).stream()

        contracts = []
        for doc in query:
            data = doc.to_dict()
            data['id'] = doc.id
            # Convertir les timestamps Firestore en string ISO
            if 'created_at' in data and data['created_at']:
                data['created_at'] = data['created_at'].isoformat()
            contracts.append(data)

        return jsonify({
            'success': True,
            'contracts': contracts
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des contrats: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@contracts_bp.route('/sign_contract/<contract_id>', methods=['POST'])
def sign_contract(contract_id):
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    contract_doc = db.collection('contracts').document(contract_id).get()
    if not contract_doc.exists:
        return jsonify({'success': False, 'error': 'Contrat non trouvé'}), 404

    contract_data = contract_doc.to_dict()
    if session['uid'] != contract_data['candidate_id']:
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    try:
        # Mettre à jour le statut du contrat
        contract_service = ContractService(db)
        contract_service.update_contract_status(contract_id, 'accepted')

        # AJOUTER CETTE LIGNE : Ajouter l'employé automatiquement
        employee_id = add_employee_to_company(contract_data)

        # AJOUTER CETTE LIGNE : Configurer la paie automatiquement
        if employee_id:
            setup_automatic_payroll(employee_id, contract_data)

        # Envoyer un message de confirmation dans le chat
        messaging_service = MessagingService(db)
        message_content = f"Le candidat {contract_data['candidate_name']} a signé et accepté le contrat pour le poste de {contract_data['position']}."
        messaging_service.send_message(
            chat_id=contract_data['chat_id'],
            sender_id=session['uid'],
            receiver_id=contract_data['company_id'],
            content=message_content
        )

        return jsonify({
            'success': True,
            'message': 'Contrat signé avec succès !'
        })

    except Exception as e:
        logger.error(f"Erreur lors de la signature du contrat: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@contracts_bp.route('/<user_id>/country', methods=['GET'])
def get_user_country(user_id):
    """Récupérer le pays d'un utilisateur"""
    try:
        # Accès à la base de données

        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        user_data = user_doc.to_dict()
        country = user_data.get('country', '')

        return jsonify({
            'success': True,
            'country': country
        }), 200

    except Exception as e:
        logger.error(f"Erreur récupération pays utilisateur: {str(e)}")
        return jsonify({'error': 'Erreur serveur'}), 500


def add_employee_to_company(contract_data):
    """Ajoute un employé à la liste des employés de l'entreprise après signature"""
    try:
        company_id = contract_data['company_id']
        candidate_id = contract_data['candidate_id']
        candidate_name = contract_data['candidate_name']
        position = contract_data['position']
        salary = contract_data['salary']
        contract_type = contract_data['contract_type']
        start_date = contract_data.get('start_date', datetime.datetime.now())
        contract_id = contract_data.get('id', '')

        # Vérifier si l'employé existe déjà
        employee_ref = db.collection('employees').where('company_id', '==', company_id) \
            .where('candidate_id', '==', candidate_id).limit(1).stream()

        if any(employee_ref):
            logger.info(f"L'employé {candidate_name} existe déjà pour l'entreprise {company_id}")
            return None

        # Récupérer les informations du candidat
        candidate_doc = db.collection('users').document(candidate_id).get()
        candidate_data = candidate_doc.to_dict() if candidate_doc.exists else {}

        # Créer l'entrée employé
        employee_data = {
            'company_id': company_id,
            'candidate_id': candidate_id,
            'candidate_name': candidate_name,
            'position': position,
            'salary': salary,
            'contract_type': contract_type,
            'start_date': start_date,
            'hire_date': datetime.datetime.now(),
            'status': 'active',  # active, inactive, terminated, on_leave
            'email': candidate_data.get('email', ''),
            'phone': candidate_data.get('phone', ''),
            'location': candidate_data.get('location', ''),
            'country': candidate_data.get('country', ''),
            'contract_id': contract_id,
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }

        # Ajouter les compétences si disponibles
        if 'skills' in candidate_data:
            employee_data['skills'] = candidate_data['skills']

        if 'languages' in candidate_data:
            employee_data['languages'] = candidate_data['languages']

        # Ajouter à la collection employees
        employee_ref = db.collection('employees').add(employee_data)
        employee_id = employee_ref[1].id

        logger.info(f"Employé {candidate_name} ajouté avec ID: {employee_id}")
        return employee_id

    except Exception as e:
        logger.error(f"Erreur lors de l'ajout de l'employé: {str(e)}")
        return None


@contracts_bp.route('/<contract_id>/signature', methods=['POST'])
def save_signature(contract_id):
    """Sauvegarde la signature du contrat"""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()

        # Vérifier que l'utilisateur est le candidat
        contract_doc = db.collection('contracts').document(contract_id).get()
        if not contract_doc.exists:
            return jsonify({'success': False, 'error': 'Contrat non trouvé'}), 404

        contract_data = contract_doc.to_dict()
        if session['uid'] != contract_data['candidate_id']:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Sauvegarder les données de signature
        signature_data = {
            'signature_method': data.get('method'),
            'signature_value': data.get('value'),
            'signature_timestamp': data.get('timestamp'),
            'signed_at': datetime.datetime.now(),
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent')
        }

        # Mettre à jour le contrat avec les données de signature
        db.collection('contracts').document(contract_id).update({
            'signature_data': signature_data,
            'signature_saved_at': datetime.datetime.now()
        })

        return jsonify({
            'success': True,
            'message': 'Signature sauvegardée avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur sauvegarde signature: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

