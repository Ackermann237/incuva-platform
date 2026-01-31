from firebase_admin import firestore
import logging
import datetime

logger = logging.getLogger(__name__)


class ContractService:
    def __init__(self, db):
        self.db = db

    def create_contract(self, contract_data):
        """Create a new contract in Firestore."""
        contract_data['created_at'] = firestore.SERVER_TIMESTAMP
        contract_data['updated_at'] = firestore.SERVER_TIMESTAMP
        contract_ref = self.db.collection('contracts').add(contract_data)
        contract_id = contract_ref[1].id
        logger.info(f"Contrat créé avec ID: {contract_id}")
        return contract_id

    # Dans contract_service.py
    def update_contract_status(self, contract_id, new_status):
        """Met à jour le statut d'un contrat et ajoute l'employé si accepté"""
        try:
            contract_ref = self.db.collection('contracts').document(contract_id)
            contract_data = contract_ref.get().to_dict()

            # Mettre à jour le statut
            contract_ref.update({
                'status': new_status,
                'updated_at': datetime.datetime.now()
            })

            # Si le contrat est accepté, ajouter l'employé
            if new_status == 'accepted':
                self.add_employee_from_contract(contract_data, contract_id)

            return True
        except Exception as e:
            logger.error(f"Erreur mise à jour statut contrat: {str(e)}")
            raise e

    def add_employee_from_contract(self, contract_data, contract_id):
        """Ajoute un employé depuis un contrat accepté"""
        try:
            company_id = contract_data['company_id']
            candidate_id = contract_data['candidate_id']

            # Vérifier si l'employé existe déjà
            existing = self.db.collection('employees') \
                .where('company_id', '==', company_id) \
                .where('candidate_id', '==', candidate_id) \
                .limit(1).stream()

            if any(existing):
                logger.info(f"Employé {candidate_id} existe déjà pour l'entreprise {company_id}")
                return None

            # Récupérer les infos du candidat
            candidate_doc = self.db.collection('users').document(candidate_id).get()
            candidate_info = candidate_doc.to_dict() if candidate_doc.exists else {}

            # Créer l'employé
            employee_data = {
                'company_id': company_id,
                'candidate_id': candidate_id,
                'candidate_name': contract_data['candidate_name'],
                'position': contract_data['position'],
                'salary': contract_data['salary'],
                'contract_type': contract_data['contract_type'],
                'start_date': contract_data.get('start_date', datetime.datetime.now()),
                'hire_date': datetime.datetime.now(),
                'status': 'active',
                'email': candidate_info.get('email', ''),
                'phone': candidate_info.get('phone', ''),
                'location': candidate_info.get('location', ''),
                'country': candidate_info.get('country', ''),
                'contract_id': contract_id,
                'created_at': datetime.datetime.now(),
                'updated_at': datetime.datetime.now()
            }

            # Ajouter compétences et langues si disponibles
            if 'skills' in candidate_info:
                employee_data['skills'] = candidate_info['skills']
            if 'languages' in candidate_info:
                employee_data['languages'] = candidate_info['languages']

            employee_ref = self.db.collection('employees').add(employee_data)
            logger.info(f"Employé ajouté: {employee_ref[1].id}")
            return employee_ref[1].id

        except Exception as e:
            logger.error(f"Erreur ajout employé depuis contrat: {str(e)}")
            return None
