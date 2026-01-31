# routes/users.py ou dans un fichier existant
from flask import Blueprint, jsonify, request
from firebase_admin import firestore
import logging

logger = logging.getLogger(__name__)
users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('/<user_id>/country', methods=['GET'])
def get_user_country(user_id):
    """Récupérer le pays d'un utilisateur"""
    try:
        # Accès à la base de données
        db = firestore.client()

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