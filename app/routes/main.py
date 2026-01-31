from flask import Blueprint, request, session, jsonify
from flask_babel import gettext
from firebase_admin import firestore
from .. import get_locale  # Importe la fonction get_locale depuis __init__.py
from ..firebase.init_firebase import db

main_api_bp = Blueprint('main_api', __name__, url_prefix='/api/main')


@main_api_bp.route('/home', methods=['GET'])
def api_home():
    """Return home info based on authentication and account type."""
    locale = get_locale()

    if 'uid' in session and 'account_type' in session:
        user_doc = db.collection('users').document(session['uid']).get()

        if user_doc.exists:
            account_type = user_doc.to_dict().get('accountType', session['account_type'])
            if account_type == 'company':
                return jsonify({"success": True, "account_type": "company", "redirect_url": "/home_company"})
            elif account_type == 'individual':
                return jsonify({"success": True, "account_type": "individual", "redirect_url": "/home_perso"})

        # Clear session if user not found or invalid account type
        session.pop('uid', None)
        session.pop('account_type', None)

    return jsonify({"success": True, "account_type": None, "redirect_url": "/"})


@main_api_bp.route('/home_company', methods=['GET'])
def api_home_company():
    """Return data for company home page."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    # Ici, tu peux retourner des données spécifiques à l’entreprise
    return jsonify({
        "success": True,
        "message": "Bienvenue sur le dashboard entreprise",
        "locale": get_locale(),
        "data": {}  # Ajoute ici les données nécessaires côté frontend
    })


@main_api_bp.route('/home_perso', methods=['GET'])
def api_home_perso():
    """Return data for individual home page."""
    if 'uid' not in session or session.get('account_type') != 'individual':
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    # Ici, tu peux retourner des données spécifiques au particulier
    return jsonify({
        "success": True,
        "message": "Bienvenue sur le dashboard particulier",
        "locale": get_locale(),
        "data": {}  # Ajoute ici les données nécessaires côté frontend
    })


@main_api_bp.route('/set_language/<lang>', methods=['POST'])
def api_set_language(lang):
    session['lang'] = lang
    return jsonify({"success": True, "lang": lang})
