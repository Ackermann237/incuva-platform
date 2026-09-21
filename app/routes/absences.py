# backend/app/routes/absences.py
from flask import Blueprint, jsonify, request, session
from firebase_admin import firestore
import datetime
import logging
from functools import wraps
from ..firebase.init_firebase import db
from ..query_utils import sort_docs_desc
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


ALLOWED_TYPES = {'vacation', 'sick', 'maternity', 'paternity', 'training', 'personal', 'other'}
ALLOWED_STATUSES = {'pending', 'approved', 'rejected'}


def _parse_date(value, label):
    """Date AAAA-MM-JJ (les heures éventuelles sont ignorées) ; ValueError avec un message lisible sinon."""
    try:
        return datetime.datetime.strptime(str(value or '').strip()[:10], '%Y-%m-%d')
    except ValueError:
        raise ValueError(f"{label} invalide (format attendu : AAAA-MM-JJ).")


def _iso_day(value):
    """Date au format AAAA-MM-JJ (les navigateurs et <input type="date"> l'attendent) à partir d'un datetime ou d'un texte."""
    if isinstance(value, datetime.datetime):
        return value.strftime('%Y-%m-%d')
    return str(value)[:10] if value else None


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

        # Exécuter la requête, triée par date de début (plus récent en premier) côté Python
        # pour ne pas dépendre d'un index composite Firestore
        absences = []
        for doc in sort_docs_desc(query.stream(), 'start_date'):
            data = doc.to_dict()
            data['id'] = doc.id

            # Une absence sans employé est une donnée invalide (créée avant l'ajout des contrôles) : on l'ignore
            # au lieu de faire échouer toute la liste (Firestore refuse un identifiant de document vide)
            employee_id = data.get('employee_id')
            if not employee_id or not isinstance(employee_id, str) or '/' in employee_id:
                continue

            employee_doc = db.collection('employees').document(employee_id).get()
            if employee_doc.exists:
                emp_data = employee_doc.to_dict()
                data['employeeName'] = emp_data.get('candidate_name', 'Inconnu')
                data['position'] = emp_data.get('position', 'Non spécifié')
                data['department'] = emp_data.get('department', 'Non spécifié')
            else:
                data['employeeName'] = 'Employé supprimé'

            data['start_date'] = _iso_day(data.get('start_date'))
            data['end_date'] = _iso_day(data.get('end_date'))
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
            if data.get('employee_id'):  # les absences sans employé (données invalides) ne comptent pas
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
        data = request.get_json(silent=True) or {}

        # Validation : un employé de l'entreprise, un type connu, des dates cohérentes, une raison
        employee_id = str(data.get('employee_id') or '').strip()
        if not employee_id:
            return jsonify({'success': False, 'error': 'Veuillez sélectionner un employé.'}), 400
        employee_doc = db.collection('employees').document(employee_id).get() if '/' not in employee_id else None
        if not employee_doc or not employee_doc.exists or employee_doc.to_dict().get('company_id') != company_id:
            return jsonify({'success': False, 'error': "Cet employé n'existe pas dans votre entreprise."}), 400
        absence_type = data.get('type')
        if absence_type not in ALLOWED_TYPES:
            return jsonify({'success': False, 'error': "Type d'absence invalide."}), 400
        start_date = _parse_date(data.get('start_date'), 'Date de début')
        end_date = _parse_date(data.get('end_date'), 'Date de fin')
        if end_date < start_date:
            return jsonify({'success': False, 'error': 'La date de fin ne peut pas précéder la date de début.'}), 400
        reason = str(data.get('reason') or '').strip()
        if not reason:
            return jsonify({'success': False, 'error': "Veuillez indiquer la raison de l'absence."}), 400

        # Créer le document
        absence_data = {
            'company_id': company_id,
            'employee_id': employee_id,
            'type': absence_type,
            'start_date': start_date,
            'end_date': end_date,
            'reason': reason[:500],
            'notes': str(data.get('notes') or '')[:2000],
            'emergency_contact': str(data.get('emergency_contact') or '')[:200],
            'documents': data.get('documents') if isinstance(data.get('documents'), list) else [],
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

    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'absence: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@absences_bp.route('/<absence_id>', methods=['PUT'])
@company_required
def update_absence(absence_id):
    """Mettre à jour une absence"""
    try:
        company_id = session['uid']
        data = request.get_json(silent=True) or {}

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
                    update_data[field] = _parse_date(data[field], 'Date de début' if field == 'start_date' else 'Date de fin')
                else:
                    update_data[field] = data[field]

        if 'type' in update_data and update_data['type'] not in ALLOWED_TYPES:
            return jsonify({'success': False, 'error': "Type d'absence invalide."}), 400
        if 'status' in update_data and update_data['status'] not in ALLOWED_STATUSES:
            return jsonify({'success': False, 'error': 'Statut invalide.'}), 400
        if 'reason' in update_data and not str(update_data['reason'] or '').strip():
            return jsonify({'success': False, 'error': "Veuillez indiquer la raison de l'absence."}), 400

        # Les dates finales (modifiées ou conservées) doivent rester cohérentes
        def as_naive(value):
            return value.replace(tzinfo=None) if isinstance(value, datetime.datetime) else None
        final_start = update_data.get('start_date') or as_naive(absence_data.get('start_date'))
        final_end = update_data.get('end_date') or as_naive(absence_data.get('end_date'))
        if final_start and final_end and final_end < final_start:
            return jsonify({'success': False, 'error': 'La date de fin ne peut pas précéder la date de début.'}), 400

        # Mettre à jour
        db.collection('absences').document(absence_id).update(update_data)

        return jsonify({
            'success': True,
            'message': 'Absence mise à jour avec succès'
        })

    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
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

        range_start = data.get('start_date')
        range_end = data.get('end_date')

        absences_data = []
        for doc in absences_ref.stream():
            absence = doc.to_dict()

            # Filtre de période côté Python : `start_date` est stocké comme date Firestore (pas comme texte) et
            # un filtre d'intervalle exigerait de toute façon un index composite
            if range_start and range_end:
                start = absence.get('start_date')
                start = start.strftime('%Y-%m-%d') if hasattr(start, 'strftime') else str(start)[:10]
                if not (range_start <= start <= range_end):
                    continue

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