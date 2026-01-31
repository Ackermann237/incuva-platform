# backend/app/routes/conversational.py
from flask import Blueprint, jsonify, request, session
from firebase_admin import firestore
import datetime
import logging
import re
from functools import wraps

from typing import Dict, List

from ..firebase.init_firebase import db
from ..ai.copilote import generate_bi_insights, call_ia, chat_general
from ..ai.nlp_processor import get_nlp_processor

logger = logging.getLogger(__name__)
conversational_bp = Blueprint('conversational', __name__, url_prefix='/api/conversational')


def company_required(f):
    """Décorateur pour vérifier que l'utilisateur est une entreprise"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'uid' not in session or session.get('account_type') != 'company':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        return f(*args, **kwargs)

    return decorated_function


@conversational_bp.route('/analyze', methods=['POST'])
@company_required
def analyze_query():
    """Analyser une requête en langage naturel et retourner une analyse"""
    try:
        company_id = session['uid']
        data = request.get_json()
        query = data.get('query', '').strip()

        if not query:
            return jsonify({'success': False, 'error': 'Requête vide'}), 400

        logger.info(f"Analyse de la requête: {query[:100]}...")

        # Obtenir le processeur NLP
        nlp_processor = get_nlp_processor()

        # Analyser l'intention avec NLP avancé
        intent_result = nlp_processor.classify_intent(query)

        logger.info(f"Intention détectée: {intent_result['type']} (confiance: {intent_result['confidence']:.2f})")

        # Récupérer les données nécessaires selon l'intention
        data_context = fetch_needed_data(company_id, intent_result)

        # Traiter selon l'intention
        if intent_result['type'] == 'conversation':
            # Conversation générale - utiliser l'IA pour une réponse naturelle
            response = handle_conversation(query, intent_result, data_context)

            return jsonify({
                'success': True,
                'type': 'conversation',
                'response': response,
                'intent': intent_result,
                'data_used': False
            })

        else:
            # Analyse RH - utiliser l'analyse des données
            analysis = handle_rh_analysis(query, intent_result, data_context)

            return jsonify({
                'success': True,
                'type': 'analysis',
                'analysis': analysis,
                'intent': intent_result,
                'data_used': True
            })

    except Exception as e:
        logger.error(f"Erreur lors de l'analyse: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@conversational_bp.route('/chat', methods=['POST'])
@company_required
def chat():
    """Endpoint pour la conversation générale avec l'IA"""
    try:
        company_id = session['uid']
        data = request.get_json()
        query = data.get('query', '').strip()

        if not query:
            return jsonify({'success': False, 'error': 'Requête vide'}), 400

        logger.info(f"Conversation: {query[:50]}...")

        # Analyser l'intention
        nlp_processor = get_nlp_processor()
        intent_result = nlp_processor.classify_intent(query)

        # Préparer le contexte pour l'IA
        context_data = fetch_all_company_data(company_id)

        # Générer une réponse conversationnelle avec IA
        if intent_result['type'] == 'conversation':
            response = generate_conversational_response(query, intent_result)
        else:
            # Même pour les questions RH, répondre de manière conversationnelle d'abord
            response = generate_mixed_response(query, intent_result, context_data)

        return jsonify({
            'success': True,
            'response': response,
            'intent': intent_result
        })

    except Exception as e:
        logger.error(f"Erreur lors de la conversation: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@conversational_bp.route('/advanced-analyze', methods=['POST'])
@company_required
def advanced_analyze():
    """Analyse avancée avec NLP et IA"""
    try:
        company_id = session['uid']
        data = request.get_json()
        query = data.get('query', '').strip()

        if not query:
            return jsonify({'success': False, 'error': 'Requête vide'}), 400

        logger.info(f"Analyse avancée: {query[:100]}...")

        # Analyser avec NLP avancé
        nlp_processor = get_nlp_processor()

        # Extraire les entités et intentions
        intent_result = nlp_processor.classify_intent(query)
        entities = nlp_processor.extract_entities(query)
        key_phrases = nlp_processor.extract_key_phrases(query)
        sentiment = nlp_processor.analyze_sentiment(query)

        # Récupérer les données
        data_context = fetch_all_company_data(company_id)

        # Générer une analyse avec IA
        analysis_prompt = create_advanced_prompt(query, intent_result, entities, data_context)
        ai_analysis = generate_bi_insights(analysis_prompt)

        # Structurer la réponse
        response = {
            'query': query,
            'intent_analysis': intent_result,
            'entities': entities,
            'key_phrases': key_phrases,
            'sentiment': sentiment,
            'data_summary': create_data_summary(data_context),
            'ai_analysis': ai_analysis,
            'recommendations': extract_recommendations(ai_analysis),
            'follow_up_questions': generate_follow_up_questions(intent_result, entities)
        }

        return jsonify({
            'success': True,
            'analysis': response
        })

    except Exception as e:
        logger.error(f"Erreur lors de l'analyse avancée: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


def fetch_needed_data(company_id: str, intent_result: Dict) -> Dict:
    """Récupérer uniquement les données nécessaires selon l'intention"""
    data_needs = intent_result.get('details', {}).get('data_needs', [])

    data = {}

    if not data_needs:
        return fetch_all_company_data(company_id)

    try:
        if 'employees' in data_needs:
            employees_ref = db.collection('employees').where('company_id', '==', company_id)
            data['employees'] = [doc.to_dict() for doc in employees_ref.stream()]

        if 'planning' in data_needs:
            planning_ref = db.collection('planning').where('company_id', '==', company_id)
            data['planning'] = [doc.to_dict() for doc in planning_ref.stream()]

        if 'absences' in data_needs:
            absences_ref = db.collection('absences').where('company_id', '==', company_id)
            data['absences'] = [doc.to_dict() for doc in absences_ref.stream()]

        if 'recruitment' in data_needs:
            jobs_ref = db.collection('jobs').where('company_id', '==', company_id)
            data['recruitment'] = [doc.to_dict() for doc in jobs_ref.stream()]

        if 'contracts' in data_needs:
            contracts_ref = db.collection('contracts').where('company_id', '==', company_id)
            data['contracts'] = [doc.to_dict() for doc in contracts_ref.stream()]

    except Exception as e:
        logger.error(f"Erreur récupération données: {str(e)}")

    return data


def fetch_all_company_data(company_id: str) -> Dict:
    """Récupérer toutes les données de l'entreprise"""
    data = {
        'employees': [],
        'planning': [],
        'absences': [],
        'recruitment': [],
        'contracts': []
    }

    try:
        # Récupérer les employés
        employees_ref = db.collection('employees').where('company_id', '==', company_id)
        for doc in employees_ref.stream():
            emp_data = doc.to_dict()
            emp_data['id'] = doc.id
            data['employees'].append(emp_data)

        # Récupérer le planning
        planning_ref = db.collection('planning').where('company_id', '==', company_id)
        for doc in planning_ref.stream():
            shift = doc.to_dict()
            shift['id'] = doc.id
            data['planning'].append(shift)

        # Récupérer les absences
        absences_ref = db.collection('absences').where('company_id', '==', company_id)
        for doc in absences_ref.stream():
            absence = doc.to_dict()
            absence['id'] = doc.id
            data['absences'].append(absence)

        # Récupérer les données de recrutement
        jobs_ref = db.collection('jobs').where('company_id', '==', company_id)
        for doc in jobs_ref.stream():
            job = doc.to_dict()
            job['id'] = doc.id
            data['recruitment'].append(job)

        # Récupérer les contrats
        contracts_ref = db.collection('contracts').where('company_id', '==', company_id)
        for doc in contracts_ref.stream():
            contract = doc.to_dict()
            contract['id'] = doc.id
            data['contracts'].append(contract)

    except Exception as e:
        logger.error(f"Erreur récupération données: {str(e)}")

    return data


def handle_conversation(query: str, intent_result: Dict, data_context: Dict) -> str:
    """Gérer une conversation générale"""
    nlp_processor = get_nlp_processor()

    # Générer une réponse de base avec le template
    base_response = nlp_processor.generate_response_template(intent_result, data_context)

    # Si la confiance est élevée, utiliser le template
    if intent_result['confidence'] > 0.7:
        return base_response

    # Sinon, utiliser l'IA pour une réponse plus naturelle
    try:
        prompt = f"""
        Tu es Jarvis, un assistant IA RH professionnel et amical.

        L'utilisateur te dit: "{query}"

        Ton analyse montre que c'est une conversation de type: {intent_result['details']['primary_intent']}

        Réponds de manière naturelle, en incluant:
        1. Une réponse appropriée au contexte
        2. Une ouverture pour continuer la conversation
        3. Une offre d'aide pour les sujets RH si pertinent

        Réponds en français, utilise des emojis appropriés.
        """

        ai_response = chat_general(prompt)
        return ai_response

    except Exception as e:
        logger.error(f"Erreur génération réponse IA: {str(e)}")
        return base_response


def handle_rh_analysis(query: str, intent_result: Dict, data_context: Dict) -> Dict:
    """Gérer une analyse RH"""
    primary_intent = intent_result['details']['primary_intent']

    # Mapper les intentions aux fonctions d'analyse
    analysis_functions = {
        'burnout_risk': analyze_burnout_risk,
        'recruitment_anomalies': analyze_recruitment_anomalies,
        'planning_optimization': analyze_planning_optimization,
        'absence_trends': analyze_absence_trends,
        'employee_analysis': analyze_employee_data,
        'salary_analysis': analyze_salary_data,
        'contract_analysis': analyze_contract_data,
        'training_needs': analyze_training_needs,
        'general_analysis': perform_general_analysis
    }

    # Exécuter l'analyse appropriée
    analysis_function = analysis_functions.get(primary_intent, perform_general_analysis)
    analysis = analysis_function(data_context)

    # Ajouter le contexte de la requête
    analysis['query'] = query
    analysis['intent'] = primary_intent
    analysis['confidence'] = intent_result['confidence']

    # Générer des insights avec IA si pertinent
    if intent_result['confidence'] > 0.5:
        ai_insights = generate_ai_insights(query, analysis, data_context)
        analysis['ai_insights'] = ai_insights

    return analysis


def generate_conversational_response(query: str, intent_result: Dict) -> str:
    """Générer une réponse conversationnelle avec IA"""
    try:
        prompt = f"""
        Tu es Jarvis, un assistant IA RH.

        Utilisateur: "{query}"

        Type de conversation: {intent_result['details']['primary_intent']}
        Langue: {intent_result.get('language', 'fr')}

        Réponds de manière:
        - Naturelle et conversationnelle
        - Amicale mais professionnelle
        - Avec des emojis appropriés
        - En français
        - Avec une ouverture pour continuer

        Si c'est une question RH, offre brièvement ton expertise.
        """

        return chat_general(prompt)

    except Exception as e:
        logger.error(f"Erreur réponse conversationnelle: {str(e)}")
        nlp_processor = get_nlp_processor()
        return nlp_processor.generate_response_template(intent_result, {})


def generate_mixed_response(query: str, intent_result: Dict, data_context: Dict) -> str:
    """Générer une réponse mixte (conversation + RH)"""
    try:
        # Commencer par une réponse conversationnelle
        nlp_processor = get_nlp_processor()
        conversation_part = nlp_processor.generate_response_template(intent_result, data_context)

        # Ajouter la partie analyse si les données sont disponibles
        data_summary = create_data_summary(data_context)

        prompt = f"""
        Tu es Jarvis, assistant IA RH.

        L'utilisateur demande: "{query}"

        C'est une question RH de type: {intent_result['details']['primary_intent']}

        Données disponibles: {data_summary}

        Donne une réponse qui:
        1. Commence par un ton conversationnel amical
        2. Mentionne que tu as analysé les données
        3. Fournit un aperçu des insights disponibles
        4. Propose de donner plus de détails si intéressé

        Réponds en français avec des emojis.
        """

        return chat_general(prompt)

    except Exception as e:
        logger.error(f"Erreur réponse mixte: {str(e)}")
        return "Je peux analyser vos données RH. Souhaitez-vous que je détaille mon analyse ?"


def create_advanced_prompt(query: str, intent_result: Dict, entities: Dict, data_context: Dict) -> str:
    """Créer un prompt avancé pour l'IA"""
    data_summary = create_data_summary(data_context)

    return f"""
    En tant qu'expert IA RH, analyse cette requête: "{query}"

    Analyse d'intention:
    - Type: {intent_result['type']}
    - Intention principale: {intent_result['details']['primary_intent']}
    - Confiance: {intent_result['confidence']:.2f}

    Entités détectées: {entities}

    Données disponibles:
    {data_summary}

    Fournis une analyse complète avec:
    1. Résumé exécutif
    2. Points clés d'analyse
    3. Recommandations actionnables
    4. Risques identifiés
    5. Métriques de suivi
    6. Questions de suivi

    Réponds en français de manière professionnelle.
    """


def create_data_summary(data_context: Dict) -> str:
    """Créer un résumé des données disponibles"""
    summary = []

    if 'employees' in data_context:
        summary.append(f"- Employés: {len(data_context['employees'])}")

    if 'planning' in data_context:
        summary.append(f"- Shifts de planning: {len(data_context['planning'])}")

    if 'absences' in data_context:
        summary.append(f"- Absences: {len(data_context['absences'])}")

    if 'recruitment' in data_context:
        summary.append(f"- Offres d'emploi: {len(data_context['recruitment'])}")

    if 'contracts' in data_context:
        summary.append(f"- Contrats: {len(data_context['contracts'])}")

    return "\n".join(summary) if summary else "Aucune donnée disponible"


def extract_recommendations(analysis_text: str) -> List[str]:
    """Extraire les recommandations du texte d'analyse"""
    recommendations = []
    lines = analysis_text.split('\n')

    for line in lines:
        line = line.strip()
        # Chercher les lignes qui contiennent des recommandations
        if any(marker in line.lower() for marker in ['recommande', 'suggère', 'conseille', 'propose', '•', '-']):
            # Nettoyer la ligne
            clean_line = re.sub(r'^[•\-\d\.\s]+', '', line)
            if clean_line and len(clean_line) > 10:  # Éviter les lignes trop courtes
                recommendations.append(clean_line)

    return recommendations[:5]  # Limiter à 5 recommandations


def generate_follow_up_questions(intent_result: Dict, entities: Dict) -> List[str]:
    """Générer des questions de suivi pertinentes"""
    questions = []

    if intent_result['type'] == 'rh':
        primary_intent = intent_result['details']['primary_intent']

        question_templates = {
            'burnout_risk': [
                "Quelles mesures préventives mettre en place ?",
                "Comment suivre l'évolution de ces risques ?",
                "Quels indicateurs surveiller en priorité ?"
            ],
            'recruitment_anomalies': [
                "Comment améliorer notre processus de recrutement ?",
                "Quels sont les délais de recrutement idéaux ?",
                "Comment réduire le taux d'abandon ?"
            ],
            'planning_optimization': [
                "Comment équilibrer la charge de travail ?",
                "Quels sont les pics d'activité à anticiper ?",
                "Comment optimiser les coûts liés au planning ?"
            ],
            'absence_trends': [
                "Comment réduire l'absentéisme ?",
                "Quelles sont les causes principales des absences ?",
                "Comment améliorer le présentéisme ?"
            ]
        }

        questions = question_templates.get(primary_intent, [
            "Souhaitez-vous plus de détails sur cette analyse ?",
            "Voulez-vous que je compare avec les périodes précédentes ?",
            "Aimeriez-vous un rapport détaillé sur ce sujet ?"
        ])

    else:  # Conversation
        questions = [
            "De quoi aimeriez-vous parler ?",
            "Puis-je vous aider avec autre chose ?",
            "Avez-vous des questions sur les RH ?"
        ]

    # Ajouter des questions basées sur les entités
    if entities.get('persons'):
        questions.append(f"Voulez-vous plus d'informations sur {entities['persons'][0]} ?")

    if entities.get('departments'):
        questions.append(f"Souhaitez-vous analyser le département {entities['departments'][0]} ?")

    return questions[:3]  # Limiter à 3 questions


def generate_ai_insights(query: str, analysis: Dict, data_context: Dict) -> str:
    """Générer des insights avec IA"""
    prompt = f"""
    Requête: "{query}"

    Analyse effectuée: {analysis.get('summary', 'Analyse générale')}

    Données analysées:
    - Employés: {len(data_context.get('employees', []))}
    - Planning: {len(data_context.get('planning', []))}
    - Absences: {len(data_context.get('absences', []))}

    Fournis des insights additionnels:
    1. Perspectives à moyen terme
    2. Benchmarks sectoriels
    3. Tendances émergentes
    4. Recommandations innovantes

    Réponds en français.
    """

    try:
        return generate_bi_insights(prompt)
    except:
        return ""


# Fonctions d'analyse existantes (à adapter selon vos besoins)
def analyze_burnout_risk(data_context):
    """Analyser les risques de burnout"""
    # Votre logique existante ici
    return {'summary': 'Analyse des risques de burnout'}


def analyze_recruitment_anomalies(data_context):
    """Analyser les anomalies dans le recrutement"""
    # Votre logique existante ici
    return {'summary': 'Analyse des anomalies de recrutement'}


def analyze_planning_optimization(data_context):
    """Analyser et optimiser le planning"""
    # Votre logique existante ici
    return {'summary': 'Analyse d\'optimisation du planning'}


def analyze_absence_trends(data_context):
    """Analyser les tendances d'absences"""
    # Votre logique existante ici
    return {'summary': 'Analyse des tendances d\'absences'}


def analyze_employee_data(data_context):
    """Analyser les données employés"""
    employees = data_context.get('employees', [])
    return {
        'summary': f'Analyse de {len(employees)} employés',
        'total': len(employees),
        'by_department': {},
        'by_status': {}
    }


def analyze_salary_data(data_context):
    """Analyser les données salariales"""
    return {'summary': 'Analyse des données salariales'}


def analyze_contract_data(data_context):
    """Analyser les données de contrats"""
    return {'summary': 'Analyse des contrats'}


def analyze_training_needs(data_context):
    """Analyser les besoins en formation"""
    return {'summary': 'Analyse des besoins en formation'}


def perform_general_analysis(data_context):
    """Analyse générale"""
    return {'summary': 'Analyse RH générale'}