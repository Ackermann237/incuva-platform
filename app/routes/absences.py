# backend/app/routes/absences.py
from flask import Blueprint, jsonify, request, session
from firebase_admin import firestore
import datetime
import logging
from functools import wraps
from ..firebase.init_firebase import db
from ..ai.manage import get_ai_manager

logger = logging.getLogger(__name__)
absences_bp = Blueprint('absences', __name__, url_prefix='/api/absences')


def company_required(f):
    """Décorateur pour vérifier que l'utilisateur est une entreprise"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'uid' not in session or session.get('account_type') != 'company':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        return f(*args, **kwargs)

    return decorated_function


@absences_bp.route('/', methods=['GET'])
@company_required
def get_absences():
    """Récupérer les absences"""
    try:
        company_id = session['uid']

        # Paramètres de filtrage
        status = request.args.get('status')
        absence_type = request.args.get('type')

        # Construire la requête
        query = db.collection('absences').where('company_id', '==', company_id)

        if status and status != 'all':
            query = query.where('status', '==', status)

        if absence_type and absence_type != 'all':
            query = query.where('type', '==', absence_type)

        # Trier par date de début (plus récent en premier)
        query = query.order_by('start_date', direction=firestore.Query.DESCENDING)

        # Exécuter la requête
        absences = []
        for doc in query.stream():
            data = doc.to_dict()
            data['id'] = doc.id

            # Récupérer les infos de l'employé
            if 'employee_id' in data:
                employee_doc = db.collection('employees').document(data['employee_id']).get()
                if employee_doc.exists:
                    emp_data = employee_doc.to_dict()
                    data['employeeName'] = emp_data.get('candidate_name', 'Inconnu')
                    data['position'] = emp_data.get('position', 'Non spécifié')
                    data['department'] = emp_data.get('department', 'Non spécifié')

            absences.append(data)

        return jsonify({
            'success': True,
            'absences': absences
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des absences: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@absences_bp.route('/stats', methods=['GET'])
@company_required
def get_absence_stats():
    """Récupérer les statistiques des absences"""
    try:
        company_id = session['uid']

        # Récupérer toutes les absences
        absences_ref = db.collection('absences').where('company_id', '==', company_id)
        absences = []

        for doc in absences_ref.stream():
            data = doc.to_dict()
            absences.append(data)

        # Calculer les statistiques
        stats = {
            'total': len(absences),
            'by_type': {},
            'by_status': {},
            'by_month': {},
            'this_month': 0,
            'pending': 0,
            'approved': 0,
            'rejected': 0
        }

        current_month = datetime.datetime.now().strftime('%Y-%m')

        for absence in absences:
            # Par type
            absence_type = absence.get('type', 'unknown')
            stats['by_type'][absence_type] = stats['by_type'].get(absence_type, 0) + 1

            # Par statut
            status = absence.get('status', 'pending')
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1

            # Compteurs globaux
            if status == 'pending':
                stats['pending'] += 1
            elif status == 'approved':
                stats['approved'] += 1
            elif status == 'rejected':
                stats['rejected'] += 1

            # Par mois
            if 'start_date' in absence:
                try:
                    month = absence['start_date'].strftime('%Y-%m') if hasattr(absence['start_date'], 'strftime') else \
                    absence['start_date'][:7]
                    stats['by_month'][month] = stats['by_month'].get(month, 0) + 1

                    if month == current_month:
                        stats['this_month'] += 1
                except:
                    pass

        # Taux d'approbation
        total_processed = stats['approved'] + stats['rejected']
        if total_processed > 0:
            stats['approval_rate'] = round((stats['approved'] / total_processed) * 100, 1)
        else:
            stats['approval_rate'] = 0

        # Durée moyenne
        total_days = 0
        count_with_duration = 0

        for absence in absences:
            if 'start_date' in absence and 'end_date' in absence:
                try:
                    start = absence['start_date']
                    end = absence['end_date']

                    if hasattr(start, 'date'):
                        start_date = start.date()
                        end_date = end.date()
                    else:
                        start_date = datetime.datetime.strptime(str(start)[:10], '%Y-%m-%d').date()
                        end_date = datetime.datetime.strptime(str(end)[:10], '%Y-%m-%d').date()

                    duration = (end_date - start_date).days + 1
                    total_days += duration
                    count_with_duration += 1
                except:
                    pass

        if count_with_duration > 0:
            stats['average_days'] = round(total_days / count_with_duration, 1)
        else:
            stats['average_days'] = 0

        return jsonify({
            'success': True,
            'stats': stats
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@absences_bp.route('/', methods=['POST'])
@company_required
def create_absence():
    """Créer une nouvelle absence"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Validation des données
        required_fields = ['employee_id', 'type', 'start_date', 'end_date', 'reason']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Champ manquant: {field}'}), 400

        # Créer le document
        absence_data = {
            'company_id': company_id,
            'employee_id': data['employee_id'],
            'type': data['type'],
            'start_date': datetime.datetime.strptime(data['start_date'], '%Y-%m-%d'),
            'end_date': datetime.datetime.strptime(data['end_date'], '%Y-%m-%d'),
            'reason': data['reason'],
            'notes': data.get('notes', ''),
            'emergency_contact': data.get('emergency_contact', ''),
            'documents': data.get('documents', []),
            'status': 'pending',
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }

        # Sauvegarder dans Firestore
        doc_ref = db.collection('absences').add(absence_data)

        return jsonify({
            'success': True,
            'message': 'Absence créée avec succès',
            'absence_id': doc_ref[1].id
        })

    except Exception as e:
        logger.error(f"Erreur lors de la création de l'absence: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@absences_bp.route('/<absence_id>', methods=['PUT'])
@company_required
def update_absence(absence_id):
    """Mettre à jour une absence"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Vérifier que l'absence appartient à l'entreprise
        absence_doc = db.collection('absences').document(absence_id).get()
        if not absence_doc.exists:
            return jsonify({'success': False, 'error': 'Absence non trouvée'}), 404

        absence_data = absence_doc.to_dict()
        if absence_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Préparer les données de mise à jour
        update_data = {
            'updated_at': datetime.datetime.now()
        }

        # Champs pouvant être mis à jour
        updatable_fields = ['type', 'start_date', 'end_date', 'reason', 'notes',
                            'emergency_contact', 'documents', 'status']

        for field in updatable_fields:
            if field in data:
                if field in ['start_date', 'end_date'] and data[field]:
                    update_data[field] = datetime.datetime.strptime(data[field], '%Y-%m-%d')
                else:
                    update_data[field] = data[field]

        # Mettre à jour
        db.collection('absences').document(absence_id).update(update_data)

        return jsonify({
            'success': True,
            'message': 'Absence mise à jour avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'absence: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@absences_bp.route('/<absence_id>/approve', methods=['POST'])
@company_required
def approve_absence(absence_id):
    """Approuver une absence"""
    try:
        company_id = session['uid']

        # Vérifier que l'absence appartient à l'entreprise
        absence_doc = db.collection('absences').document(absence_id).get()
        if not absence_doc.exists:
            return jsonify({'success': False, 'error': 'Absence non trouvée'}), 404

        absence_data = absence_doc.to_dict()
        if absence_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Mettre à jour le statut
        update_data = {
            'status': 'approved',
            'approved_by': company_id,
            'approved_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }

        db.collection('absences').document(absence_id).update(update_data)

        # Créer une notification pour l'employé
        notification_data = {
            'employee_id': absence_data['employee_id'],
            'company_id': company_id,
            'type': 'absence_approved',
            'title': 'Absence approuvée',
            'message': f'Votre absence du {absence_data["start_date"].strftime("%d/%m/%Y")} au {absence_data["end_date"].strftime("%d/%m/%Y")} a été approuvée.',
            'read': False,
            'created_at': datetime.datetime.now()
        }

        db.collection('notifications').add(notification_data)

        return jsonify({
            'success': True,
            'message': 'Absence approuvée avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur lors de l'approbation de l'absence: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@absences_bp.route('/analyze', methods=['POST'])
@company_required
def analyze_absences():
    """Analyser les absences avec IA"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Récupérer les données d'absences
        absences_ref = db.collection('absences').where('company_id', '==', company_id)

        if 'start_date' in data and 'end_date' in data:
            absences_ref = absences_ref.where('start_date', '>=', data['start_date']) \
                .where('start_date', '<=', data['end_date'])

        absences_data = []
        for doc in absences_ref.stream():
            absence = doc.to_dict()
            absences_data.append(absence)

        # Récupérer le gestionnaire IA
        ai_manager = get_ai_manager('absence')

        # Analyser avec IA
        analysis = ai_manager.analyze_absence_patterns(absences_data)

        return jsonify({
            'success': True,
            'analysis': analysis
        })

    except Exception as e:
        logger.error(f"Erreur lors de l'analyse des absences: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500