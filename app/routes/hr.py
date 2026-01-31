from flask import Blueprint, session, request, jsonify, g
import logging
import re
from firebase_admin import firestore
from ..firebase.init_firebase import db

logger = logging.getLogger(__name__)
hr_bp = Blueprint('hr', __name__, url_prefix='/hr')


@hr_bp.route('/recruitment_management', methods=['GET'])
def recruitment_management_api():
    """API pour récupérer les données du recrutement pour une entreprise"""
    if 'uid' not in session or session.get('account_type') != 'company':
        logger.warning("Accès non autorisé ou pas de session")
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    company_id = session['uid']

    # Vérifier existence de l'entreprise
    user_doc = g.db.collection('users').document(company_id).get()
    if not user_doc.exists or user_doc.to_dict().get('accountType') != 'company':
        logger.warning(f"User {company_id} is not a company or does not exist")
        return jsonify({'success': False, 'error': 'Utilisateur non autorisé'}), 403

    metrics = g.recruitment_service.get_recruitment_metrics(company_id)
    jobs = g.job_service.get_jobs_by_company(company_id)
    applications = g.recruitment_service.get_all_applications(company_id)
    favorite_count = g.favorite_service.get_favorite_count(company_id)

    # Préparer le nombre de candidatures par job
    job_applications = []
    for job in jobs:
        job_data = job.copy()
        job_data['application_count'] = sum(1 for app in applications if app['job_id'] == job['job_id'])
        job_applications.append(job_data)

    # Mise à jour des metrics
    g.recruitment_service.update_metrics(company_id)

    return jsonify({
        'success': True,
        'metrics': metrics,
        'jobs': jobs,
        'applications': applications,
        'favorite_count': favorite_count,
        'job_applications': job_applications
    })


@hr_bp.route('/candidate_submit/<job_id>', methods=['GET'])
def candidate_submit_api(job_id):
    """API pour récupérer les candidatures pour un poste donné"""
    if 'uid' not in session or session.get('account_type') != 'company':
        logger.warning("Accès non autorisé ou pas de session")
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    company_id = session['uid']

    # Vérifier existence de l'entreprise
    user_doc = g.db.collection('users').document(company_id).get()
    if not user_doc.exists or user_doc.to_dict().get('accountType') != 'company':
        logger.warning(f"User {company_id} is not a company or does not exist")
        return jsonify({'success': False, 'error': 'Utilisateur non autorisé'}), 403

    # Vérifier le job
    job_doc = g.db.collection('jobs').document(job_id).get()
    if not job_doc.exists:
        logger.error(f"Job {job_id} not found")
        return jsonify({'success': False, 'error': 'Offre non trouvée'}), 404

    job = job_doc.to_dict()
    if job['company_id'] != company_id:
        logger.warning(f"User {company_id} not authorized for job {job_id}")
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    applications = g.recruitment_service.get_applications_by_job(job_id)

    return jsonify({
        'success': True,
        'job_title': job.get('title', 'Unknown'),
        'applications': applications
    })


# === NOUVELLE ROUTE TALENT MARKET (candidats depuis users) ===
@hr_bp.route('/talent_market', methods=['GET'])
def talent_market_api():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès réservé aux entreprises'}), 401

    company_uid = session['uid']
    search = request.args.get('search', '').strip().lower()

    try:
        # Récupérer tous les utilisateurs individuels
        users_ref = db.collection('users') \
            .where('accountType', '==', 'individual') \
            .stream()

        talents = []
        for doc in users_ref:
            data = doc.to_dict()
            uid = doc.id

            # Filtre par recherche (nom, prénom, ville, compétences)
            full_name = f"{data.get('first_name', '')} {data.get('name', '')}".lower()
            location = data.get('location', '').lower()
            skills = ' '.join([s.lower() for s in data.get('skills', [])])

            if search and not (
                search in full_name or
                search in location or
                search in skills
            ):
                continue

            # Calcul d'une note moyenne fictive (à partir des expériences (ou tu peux ajouter un champ rating plus tard)
            rating = 4.5  # À remplacer par un vrai système de notation plus tard

            talents.append({
                'id': uid,
                'userUid': uid,  # Important pour le chat
                'name': f"{data.get('first_name', '')} {data.get('name', '')}".strip() or "Anonyme",
                'title': data.get('bio', '')[:60] + "..." if data.get('bio') else "Candidat disponible",
                'location': f"{data.get('location', 'Non renseignée')}, {data.get('country', '')}",
                'rating': round(rating, 1),
                'skills': data.get('skills', [])[:8],  # Top 8 compétences
                'profileImageUrl': data.get('profileImageUrl', '/static/images/user_avatar.jpg'),
                'cvUrl': data.get('cvUrl'),
                'cvName': data.get('cvName'),
                'userRole': data.get('userRole', 'standard')
            })

        # Récupérer les favoris de l'entreprise
        favorites_ref = db.collection('favorites') \
            .where('company_id', '==', company_uid) \
            .stream()
        favorite_ids = [doc.to_dict().get('talent_id') for doc in favorites_ref]

        return jsonify({
            'success': True,
            'talents': talents,
            'favorite_ids': favorite_ids
        })

    except Exception as e:
        print("Erreur talent_market:", e)
        return jsonify({'success': False, 'error': 'Erreur serveur'}), 500


@hr_bp.route('/talent_detail/<talent_id>', methods=['GET'])
def talent_detail_api(talent_id):
    """API pour récupérer les détails d’un talent spécifique."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    try:
        talent_doc = db.collection('users').document(talent_id).get()
        if not talent_doc.exists:
            return jsonify({'success': False, 'error': 'Talent non trouvé'}), 404

        data = talent_doc.to_dict()

        # Récupérer les favoris de l'entreprise
        company_uid = session['uid']
        favorite_doc = db.collection('favorites') \
            .where('company_id', '==', company_uid) \
            .where('talent_id', '==', talent_id) \
            .limit(1).stream()
        is_favorite = any(True for _ in favorite_doc)

        # === Traitement des langues pour gérer les deux formats ===
        languages_raw = data.get('languages', [])
        languages = []

        import re  # À placer en haut du fichier si ce n’est pas déjà fait

        for item in languages_raw:
            if isinstance(item, dict) and 'language' in item:
                # Déjà au bon format {language: "...", level: "..."}
                languages.append({
                    'language': item.get('language', '').strip(),
                    'level': item.get('level', '').strip() or 'Non précisé'
                })
            elif isinstance(item, str):
                # Format texte libre : "Français (natif)" ou "Anglais"
                item = item.strip()
                # Recherche "Langue (niveau)"
                match = re.match(r'^([^(\s]+)\s*(?:\(([^)]*)\))?$', item)
                if match:
                    language = match.group(1).strip()
                    level = match.group(2).strip() if match.group(2) else ''
                    languages.append({
                        'language': language,
                        'level': level or 'Non précisé'
                    })
                else:
                    # Cas improbable : juste la langue sans parenthèses
                    languages.append({
                        'language': item,
                        'level': 'Non précisé'
                    })
            # Ignorer les autres types (None, etc.)

        # === Construction du talent_info ===
        talent_info = {
            'id': talent_id,
            'userUid': talent_id,
            'name': f"{data.get('first_name', '')} {data.get('name', '')}".strip() or "Anonyme",
            'bio': data.get('bio', '') or '',  # Chaîne vide si absent
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'location': f"{data.get('location', 'Non renseignée')}, {data.get('country', '')}".strip(),
            'rating': float(data.get('rating', 4.5)) if data.get('rating') is not None else 4.5,
            'reviewCount': data.get('reviewCount', 0),
            'skills': data.get('skills', []),  # Doit être une liste de strings
            'languages': languages,  # ← Format corrigé et unifié
            'experience': data.get('experience', []),  # Liste d'objets {title, company, period ou start/end, description}
            'education': data.get('education', []),    # Liste d'objets {degree, school, period}
            'portfolio': data.get('portfolio', []),
            'linkedin': data.get('linkedin', ''),
            'cvUrl': data.get('cvUrl'),
            'cvName': data.get('cvName'),
            'profileImageUrl': data.get('profileImageUrl', ''),
            'userRole': data.get('userRole', 'standard'),
            'isFavorite': is_favorite,
            'accountType': data.get('accountType', 'individual')
        }

        return jsonify({'success': True, 'talent': talent_info})

    except Exception as e:
        print(f"Erreur talent_detail: {e}")
        import traceback
        traceback.print_exc()  # Utile pour débugger en prod
        return jsonify({'success': False, 'error': 'Erreur serveur'}), 500


@hr_bp.route('/initiate_chat', methods=['POST'])
def initiate_chat_api():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    data = request.get_json() or {}
    talent_id = data.get('talent_id')
    talent_user_uid = data.get('talent_user_uid')

    if not talent_id or not talent_user_uid:
        return jsonify({'success': False, 'error': 'Paramètres manquants'}), 400

    # Vérifier chat existant
    try:
        chat_id = g.messaging_service.get_existing_chat(user_id, talent_user_uid, talent_id)
        if chat_id:
            return jsonify({'success': True, 'chat_id': chat_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

    # Créer un nouveau chat
    try:
        chat_id = g.messaging_service.create_chat(company_id=user_id, talent_user_id=talent_user_uid, service_id=talent_id)
        return jsonify({'success': True, 'chat_id': chat_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/add_favorite', methods=['POST'])
def add_favorite_api():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    data = request.get_json() or {}
    talent_id = data.get('talent_id')
    if not talent_id:
        return jsonify({'success': False, 'error': 'ID talent manquant'}), 400

    try:
        success = g.favorite_service.add_favorite(user_id, talent_id)
        message = 'Talent ajouté aux favoris' if success else 'Talent déjà dans les favoris'
        return jsonify({'success': success, 'message': message})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/favorites', methods=['GET'])
def favorites_api():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    try:
        favorites = g.favorite_service.get_favorites(user_id)
        return jsonify({'success': True, 'favorites': favorites})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/remove_favorite', methods=['POST'])
def remove_favorite_api():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    data = request.get_json() or {}
    talent_id = data.get('talent_id')
    if not talent_id:
        return jsonify({'success': False, 'error': 'ID talent manquant'}), 400

    try:
        success = g.favorite_service.remove_favorite(user_id, talent_id)
        message = 'Talent supprimé des favoris' if success else 'Talent non trouvé dans les favoris'
        return jsonify({'success': success, 'message': message})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/agreements', methods=['GET'])
def agreements_api():
    """Retourne tous les contrats de l'entreprise au format JSON"""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 401

    try:
        contracts_ref = db.collection('contracts') \
            .where('company_id', '==', session['uid']) \
            .order_by('created_at', direction=firestore.Query.DESCENDING) \
            .stream()

        agreements = []
        for contract_doc in contracts_ref:
            contract_data = contract_doc.to_dict()
            contract_data['contract_id'] = contract_doc.id
            # Récupérer le nom du candidat
            candidate_doc = db.collection('users').document(contract_data['candidate_id']).get()
            contract_data['candidate_name'] = candidate_doc.to_dict().get('name', 'Anonyme') if candidate_doc.exists else 'Anonyme'
            agreements.append(contract_data)

        return jsonify({'success': True, 'agreements': agreements})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/rejections', methods=['GET'])
def rejections_api():
    """Retourne tous les entretiens rejetés de l'entreprise au format JSON"""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 401

    try:
        interviews_ref = db.collection('interviews') \
            .where('company_id', '==', session['uid']) \
            .where('status', '==', 'not_selected') \
            .order_by('datetime', direction=firestore.Query.DESCENDING) \
            .stream()

        rejections = []
        for interview_doc in interviews_ref:
            interview_data = interview_doc.to_dict()
            interview_data['interview_id'] = interview_doc.id

            # Récupérer le nom du candidat
            candidate_doc = db.collection('users').document(interview_data['candidate_id']).get()
            interview_data['candidate_name'] = candidate_doc.to_dict().get('name', 'Anonyme') if candidate_doc.exists else 'Anonyme'

            # Récupérer le titre du poste
            job_doc = db.collection('jobs').document(interview_data['job_id']).get()
            interview_data['job_title'] = job_doc.to_dict().get('title', 'Poste inconnu') if job_doc.exists else 'Poste inconnu'

            rejections.append(interview_data)

        return jsonify({'success': True, 'rejections': rejections})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
