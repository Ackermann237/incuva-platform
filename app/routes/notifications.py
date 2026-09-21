# backend/app/routes/notifications.py
"""Notifications internes (cloche) et préférences du compte (page Paramètres)."""
import logging
from datetime import datetime, timezone

from flask import Blueprint, g, jsonify, request, session

from ..query_utils import sort_docs_desc
from ..user_utils import display_name

logger = logging.getLogger(__name__)

notifications_bp = Blueprint('notifications', __name__)
settings_bp = Blueprint('settings', __name__)

MAX_NOTIFICATIONS = 50

# Catégories que l'utilisateur peut activer / désactiver dans les Paramètres
CATEGORIES = {
    'application': "Candidatures (nouvelle candidature, décision sur une candidature)",
    'contract': "Contrats reçus",
    'hr': "Absences et bulletins de paie",
}
TYPE_TO_CATEGORY = {
    'application_status': 'application',
    'new_application': 'application',
    'contract_received': 'contract',
    'absence_approved': 'hr',
    'payslip_approved': 'hr',
}


def _preferences(user_data):
    stored = (user_data or {}).get('settings', {}).get('notifications', {})
    return {key: bool(stored.get(key, True)) for key in CATEGORIES}


def create_notification(db, recipient_id, notif_type, title, message, data=None, company_id=None,
                        recipient_field='user_id'):
    """Crée une notification, sauf si le destinataire a désactivé cette catégorie dans ses Paramètres.

    Ne lève jamais d'exception : une notification manquée ne doit pas faire échouer l'action métier.
    """
    try:
        category = TYPE_TO_CATEGORY.get(notif_type)
        if category:
            user_doc = db.collection('users').document(recipient_id).get()
            if user_doc.exists and not _preferences(user_doc.to_dict())[category]:
                return None
        payload = {
            recipient_field: recipient_id,
            'type': notif_type,
            'title': title,
            'message': message,
            'data': data or {},
            'read': False,
            'created_at': datetime.utcnow(),  # Firestore interprète les dates naïves comme UTC
        }
        if company_id:
            payload['company_id'] = company_id
        return db.collection('notifications').add(payload)[1].id
    except Exception as e:
        logger.error(f"Création de notification impossible ({notif_type}) : {e}")
        return None


def _iso(value):
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).isoformat()
    return None


def _my_notification_docs(uid):
    """Notifications adressées à l'utilisateur (champ user_id, ou employee_id pour les salariés)."""
    docs = {}
    for field in ('user_id', 'employee_id'):
        for doc in g.db.collection('notifications').where(field, '==', uid).stream():
            docs[doc.id] = doc
    return sort_docs_desc(docs.values(), 'created_at')


def _login_required():
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401
    return None


@notifications_bp.route('/', methods=['GET'])
def list_notifications():
    denied = _login_required()
    if denied:
        return denied
    try:
        docs = _my_notification_docs(session['uid'])
        items = []
        for doc in docs[:MAX_NOTIFICATIONS]:
            n = doc.to_dict()
            items.append({
                'id': doc.id,
                'type': n.get('type'),
                'title': n.get('title', ''),
                'message': n.get('message', ''),
                'data': n.get('data') or {},
                'read': bool(n.get('read')),
                'created_at': _iso(n.get('created_at')),
            })
        unread = sum(1 for d in docs if not d.to_dict().get('read'))
        return jsonify({'success': True, 'notifications': items, 'unread_count': unread})
    except Exception as e:
        logger.error(f"Erreur liste notifications : {e}")
        return jsonify({'success': False, 'error': 'Impossible de charger les notifications'}), 500


@notifications_bp.route('/<notification_id>/read', methods=['POST'])
def mark_read(notification_id):
    denied = _login_required()
    if denied:
        return denied
    ref = g.db.collection('notifications').document(notification_id)
    doc = ref.get()
    n = doc.to_dict() if doc.exists else {}
    if session['uid'] not in (n.get('user_id'), n.get('employee_id')):
        return jsonify({'success': False, 'error': 'Notification introuvable'}), 404
    ref.update({'read': True})
    return jsonify({'success': True})


@notifications_bp.route('/read_all', methods=['POST'])
def mark_all_read():
    denied = _login_required()
    if denied:
        return denied
    count = 0
    for doc in _my_notification_docs(session['uid']):
        if not doc.to_dict().get('read'):
            doc.reference.update({'read': True})
            count += 1
    return jsonify({'success': True, 'updated': count})


@notifications_bp.route('/<notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    denied = _login_required()
    if denied:
        return denied
    ref = g.db.collection('notifications').document(notification_id)
    doc = ref.get()
    n = doc.to_dict() if doc.exists else {}
    if session['uid'] not in (n.get('user_id'), n.get('employee_id')):
        return jsonify({'success': False, 'error': 'Notification introuvable'}), 404
    ref.delete()
    return jsonify({'success': True})


# === PARAMÈTRES DU COMPTE ===
@settings_bp.route('/', methods=['GET'])
def get_settings():
    denied = _login_required()
    if denied:
        return denied
    doc = g.db.collection('users').document(session['uid']).get()
    if not doc.exists:
        return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404
    user = doc.to_dict()
    return jsonify({
        'success': True,
        'account': {
            'name': display_name(user, default=''),
            'email': user.get('email', ''),
            'account_type': session.get('account_type'),
        },
        'categories': CATEGORIES,
        'notifications': _preferences(user),
    })


@settings_bp.route('/', methods=['POST'])
def update_settings():
    denied = _login_required()
    if denied:
        return denied
    body = (request.get_json(silent=True) or {}).get('notifications')
    if not isinstance(body, dict):
        return jsonify({'success': False, 'error': 'Paramètres invalides'}), 400

    # Seules les catégories connues sont acceptées, et seulement des booléens
    prefs = {key: value for key, value in body.items() if key in CATEGORIES and isinstance(value, bool)}
    if not prefs:
        return jsonify({'success': False, 'error': 'Aucun paramètre valide'}), 400

    ref = g.db.collection('users').document(session['uid'])
    doc = ref.get()
    if not doc.exists:
        return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404
    merged = _preferences(doc.to_dict())
    merged.update(prefs)
    ref.update({'settings.notifications': merged})
    return jsonify({'success': True, 'notifications': merged})
