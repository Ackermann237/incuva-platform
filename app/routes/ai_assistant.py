# app/routes/ai_assistant.py
from firebase_admin import firestore
from flask import Blueprint, request, jsonify, session, current_app
import requests
import logging
import json
from ..firebase.init_firebase import db

ai_assistant_bp = Blueprint('ai_assistant', __name__, url_prefix='/ai_assistant')
logger = logging.getLogger(__name__)

# ==========================
# 🧠 CONTEXTE DE LA BASE FIRESTORE
# ==========================
system_prompt = """
Tu es Jarvis, l’assistant IA intégré à la plateforme INCUVA.
Tu aides les utilisateurs à naviguer dans l’application et à effectuer des actions simples.
Tu peux aussi recommander des talents en fonction des critères ou des offres d'emploi.

Structure de la base Firestore :
- users : comptes utilisateurs
- providers : prestataires de services (profil, offres, disponibilité)
- clients : entreprises ou particuliers demandeurs de service
- applications : candidatures à des offres
- services : liste des services proposés
- jobs : offres d'emploi
- chats/messages : messagerie entre clients et prestataires
- recruitment_metrics : statistiques RH et performances
- notifications : alertes et rappels système

Règles :
- Si la demande correspond à une action ou page connue, renvoie “navigate_to” avec le chemin.
- Si la demande concerne des recommandations de talents, réponds en JSON strict avec une liste de talents.
- Sinon, réponds à la question de manière naturelle et utile.
"""

# ==========================
# 🔀 MAP DES ACTIONS
# ==========================
action_map = {
    "tableau de bord": "/dashboard/user_dashboard",
    "rh": "/hr/recruitment_management",
    "messagerie": "/messaging/inbox",
    "créer une offre d'emploi": "/jobs/create_job",
    "Talents en favoris": "/hr/favorites",
    "contrats": "/contracts",
    "analytics": "/dashboard/data_analysis",
    "accueil": "/",
    "déconnexion": "/logout",
}

# ==========================
# ⚙️ ROUTE PRINCIPALE DE L’IA
# ==========================
@ai_assistant_bp.route('/ask', methods=['POST'])
def ask():
    if 'uid' not in session:
        return jsonify({'response': "Vous devez être connecté."}), 403

    data = request.get_json()
    prompt = data.get('prompt', '').strip()
    context = data.get('context', {})

    if not prompt:
        return jsonify({'response': "Veuillez entrer une question."})

    # 🔍 Étape 1 : Vérifier si l'utilisateur demande une navigation
    for keyword, route in action_map.items():
        if keyword in prompt.lower():
            return jsonify({
                'response': f"Très bien, je vous redirige vers la page {keyword} 🚀",
                'navigate_to': route
            })

    # 🔍 Étape 2 : Vérifier si c'est une demande de recommandation de talents
    if "recommande-moi des talents" in prompt.lower() or "job_id" in context:
        return handle_talent_recommendation(prompt, context)

    # 🔍 Étape 3 : Vérifier si c'est une demande d'analyse RH
    if any(keyword in prompt.lower() for keyword in ["analyse", "statistiques", "insights", "tendances", "recrutement"]):
        return handle_hr_analysis(prompt, context)

    # 🧠 Étape 4 : Appel normal à Hugging Face
    return call_huggingface_api(prompt, context)

# ==========================
# 🎯 GESTION DES RECOMMANDATIONS DE TALENTS
# ==========================
def handle_talent_recommendation(prompt, context):
    job_id = context.get('job_id')
    job_doc = None
    if job_id:
        job_doc = db.collection('jobs').document(job_id).get()
    if job_doc and job_doc.exists:
        job = job_doc.to_dict()
        ai_prompt = f"""
        Recommande-moi des talents qui correspondent à cette offre d'emploi :
        - Titre : {job.get('title', '')}
        - Localisation : {job.get('location', '')}
        - Salaire : {job.get('salary_range', '')}
        - Description : {job.get('description', '')}
        - Compétences requises : {job.get('skills', [])}
        Réponds en JSON strict avec une liste de talents recommandés, incluant :
        - name
        - title
        - location
        - skills
        - rating
        - id
        """
    else:
        ai_prompt = f"""
        Recommande-moi des talents en fonction des critères suivants :
        {prompt}
        Réponds en JSON strict avec une liste de talents recommandés, incluant :
        - name
        - title
        - location
        - skills
        - rating
        - id
        """

    try:
        api_key = current_app.config.get('HUGGINGFACE_API_KEY')
        if not api_key:
            raise Exception("Clé API Hugging Face non configurée")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct:novita",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": ai_prompt}
            ],
            "max_tokens": 2000,
            "temperature": 0.7,
            "top_p": 0.9
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            logger.error(f"Erreur API Hugging Face: {response.text}")
            return jsonify({'response': f"Erreur API Hugging Face ({response.status_code})"}), 500

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        try:
            parsed = json.loads(content)
            return jsonify({'response': json.dumps(parsed)})
        except json.JSONDecodeError:
            return jsonify({'response': content})

    except Exception as e:
        logger.error(f"Erreur lors de la génération des recommandations : {str(e)}")
        return jsonify({'response': f"Erreur serveur : {str(e)}"}), 500

# ==========================
# 📊 GESTION DE L'ANALYSE RH
# ==========================
def handle_hr_analysis(prompt, context):
    context_str = ""
    if context:
        context_str = f"""
        Contexte RH :
        - Candidatures : {len(context.get('applications', []))}
        - Entretiens : {len(context.get('interviews', []))}
        - Contrats : {len(context.get('contracts', []))}
        - Période : {context.get('timeRange', 'mois')}
        """

    ai_prompt = f"""
    {context_str}
    Question : {prompt}
    Fournis une analyse détaillée et des recommandations concrètes pour optimiser le recrutement.
    """

    try:
        api_key = current_app.config.get('HUGGINGFACE_API_KEY')
        if not api_key:
            raise Exception("Clé API Hugging Face non configurée")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct:novita",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": ai_prompt}
            ],
            "max_tokens": 1500,
            "temperature": 0.7,
            "top_p": 0.9
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            logger.error(f"Erreur API Hugging Face: {response.text}")
            return jsonify({'response': f"Erreur API Hugging Face ({response.status_code})"}), 500

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        return jsonify({'response': content})

    except Exception as e:
        logger.error(f"Erreur lors de l'analyse RH : {str(e)}")
        return jsonify({'response': f"Erreur serveur : {str(e)}"}), 500

# ==========================
# 🤖 APPEL À L'API HUGGING FACE
# ==========================
def call_huggingface_api(prompt, context):
    context_str = ""
    if context:
        context_str = f"""
        Contexte RH :
        - Candidatures : {len(context.get('applications', []))}
        - Entretiens : {len(context.get('interviews', []))}
        - Contrats : {len(context.get('contracts', []))}
        - Période : {context.get('timeRange', 'mois')}
        """

    full_prompt = f"{context_str}\n\nQuestion : {prompt}"

    try:
        api_key = current_app.config.get('HUGGINGFACE_API_KEY')
        if not api_key:
            raise Exception("Clé API Hugging Face non configurée")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct:novita",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": full_prompt}
            ],
            "max_tokens": 1000,
            "temperature": 0.7,
            "top_p": 0.9
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            logger.error(f"Erreur API Hugging Face: {response.text}")
            return jsonify({'response': f"Erreur API Hugging Face ({response.status_code})"}), 500

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        logger.info("Réponse IA générée avec succès ✅")
        return jsonify({'response': content})

    except Exception as e:
        logger.error(f"Erreur lors de la génération du contenu via l'IA: {str(e)}")
        return jsonify({'response': f"Erreur serveur : {str(e)}"}), 500

# ==========================
# ⚡ ACTIONS FLASK EXÉCUTABLES PAR L’IA
# ==========================
@ai_assistant_bp.route('/action/view_applications', methods=['GET'])
def view_applications():
    """Affiche la liste des candidatures (exemple d’action exécutée)"""
    try:
        applications = [doc.to_dict() for doc in db.collection("applications").stream()]
        return jsonify({"applications": applications, "count": len(applications)})
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des candidatures : {e}")
        return jsonify({"error": str(e)}), 500

@ai_assistant_bp.route('/action/view_providers', methods=['GET'])
def view_providers():
    """Affiche la liste des prestataires"""
    try:
        providers = [doc.to_dict() for doc in db.collection("providers").stream()]
        return jsonify({"providers": providers, "count": len(providers)})
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des prestataires : {e}")
        return jsonify({"error": str(e)}), 500

@ai_assistant_bp.route('/action/view_services', methods=['GET'])
def view_services():
    """Affiche la liste des services disponibles"""
    try:
        services = [doc.to_dict() for doc in db.collection("services").stream()]
        return jsonify({"services": services, "count": len(services)})
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des services : {e}")
        return jsonify({"error": str(e)}), 500

@ai_assistant_bp.route('/action/view_jobs', methods=['GET'])
def view_jobs():
    """Affiche la liste des offres d'emploi"""
    try:
        jobs = [doc.to_dict() for doc in db.collection("jobs").stream()]
        return jsonify({"jobs": jobs, "count": len(jobs)})
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des offres d'emploi : {e}")
        return jsonify({"error": str(e)}), 500


# ==========================
# 🚀 TEST
# ==========================
@ai_assistant_bp.route('/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok", "message": "Jarvis est opérationnel 🤖"})
