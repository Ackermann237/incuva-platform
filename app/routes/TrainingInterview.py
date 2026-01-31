# backend/app/routes/TrainingInterview.py
from flask import Blueprint, request, jsonify, session, g
from flask_cors import cross_origin
import logging
import json
from datetime import datetime
from ..ai.copilote import generate_contract_content
from ..firebase.init_firebase import db

logger = logging.getLogger(__name__)

training_interview_bp = Blueprint('training_interview', __name__)


@training_interview_bp.route('/questions', methods=['POST'])
@cross_origin(supports_credentials=True)
def generate_interview_questions():
    """Génère des questions d'entretien basées sur l'offre d'emploi."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()
        application_id = data.get('application_id')
        job_data = data.get('job_data', {})

        if not application_id or not job_data:
            return jsonify({'success': False, 'error': 'Données manquantes'}), 400

        # Récupérer les détails complets du job depuis la base de données
        job_ref = db.collection('jobs').document(job_data.get('job_id')).get()
        if not job_ref.exists:
            return jsonify({'success': False, 'error': 'Offre d\'emploi non trouvée'}), 404

        job_details = job_ref.to_dict()

        # Préparer le contexte pour l'IA
        job_context = {
            'title': job_details.get('title', ''),
            'description': job_details.get('description', ''),
            'required_skills': job_details.get('required_skills', []),
            'missions': job_details.get('missions', []),
            'contract_type': job_details.get('contract_type', ''),
            'company_name': job_data.get('company_name', '')
        }

        # Générer des questions avec l'IA
        prompt = f"""
        Tu es un recruteur expert qui prépare des candidats aux entretiens d'embauche.

        Contexte du poste:
        - Titre: {job_context['title']}
        - Description: {job_context['description'][:500]}
        - Compétences requises: {', '.join(job_context['required_skills'])}
        - Missions: {'; '.join(job_context['missions'])}
        - Type de contrat: {job_context['contract_type']}
        - Entreprise: {job_context['company_name']}

        Génère 8-10 questions d'entretien pertinentes pour ce poste, couvrant ces catégories:
        1. Questions techniques/spécifiques au poste
        2. Questions sur l'expérience et les compétences
        3. Questions comportementales
        4. Questions sur la motivation
        5. Questions sur les situations difficiles

        Format de réponse attendu en JSON:
        {{
            "questions": [
                {{
                    "id": "q1",
                    "category": "Technique",
                    "text": "Question text",
                    "difficulty": "medium",
                    "expected_keywords": ["keyword1", "keyword2"],
                    "evaluation_criteria": ["criteria1", "criteria2"]
                }}
            ],
            "job_context": {{
                "title": "...",
                "key_skills": [...],
                "company_culture": "description..."
            }}
        }}

        Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.
        """

        # Utiliser l'IA pour générer les questions
        try:
            ai_response = generate_contract_content(prompt)

            # Extraire le JSON de la réponse
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                questions_data = json.loads(json_str)

                # Sauvegarder les questions dans la base de données
                interview_session = {
                    'user_id': session['uid'],
                    'application_id': application_id,
                    'job_id': job_data.get('job_id'),
                    'questions': questions_data.get('questions', []),
                    'job_context': questions_data.get('job_context', {}),
                    'created_at': datetime.now(),
                    'status': 'active',
                    'current_question': 0,
                    'responses': [],
                    'scores': {}
                }

                # Sauvegarder dans Firestore
                interview_ref = db.collection('interview_sessions').document()
                interview_ref.set(interview_session)

                return jsonify({
                    'success': True,
                    'data': {
                        'session_id': interview_ref.id,
                        'questions': questions_data.get('questions', []),
                        'job_context': questions_data.get('job_context', {}),
                        'total_questions': len(questions_data.get('questions', []))
                    }
                })
            else:
                raise ValueError("Format de réponse IA invalide")

        except Exception as ai_error:
            logger.error(f"Erreur IA: {ai_error}")
            # Fallback: questions génériques
            return generate_fallback_questions(job_context, application_id)

    except Exception as e:
        logger.error(f"Erreur génération questions: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


def generate_fallback_questions(job_context, application_id):
    """Questions par défaut si l'IA échoue."""
    fallback_questions = [
        {
            'id': 'q1',
            'category': 'Motivation',
            'text': f'Pourquoi avez-vous postulé pour ce poste de {job_context["title"]} chez {job_context["company_name"]} ?',
            'difficulty': 'easy',
            'expected_keywords': ['passion', 'intérêt', 'alignement valeurs', 'carrière'],
            'evaluation_criteria': ['clarté motivation', 'connaissance entreprise', 'alignement poste']
        },
        {
            'id': 'q2',
            'category': 'Technique',
            'text': f'Pouvez-vous décrire votre expérience avec les compétences requises pour ce poste : {", ".join(job_context["required_skills"][:3])} ?',
            'difficulty': 'medium',
            'expected_keywords': job_context['required_skills'][:3],
            'evaluation_criteria': ['profondeur expertise', 'exemples concrets', 'applications pratiques']
        },
        {
            'id': 'q3',
            'category': 'Comportementale',
            'text': 'Décrivez une situation où vous avez dû résoudre un problème complexe. Quelle était votre approche ?',
            'difficulty': 'medium',
            'expected_keywords': ['analyse', 'solution', 'collaboration', 'résultats'],
            'evaluation_criteria': ['pensée critique', 'résolution problèmes', 'communication']
        },
        {
            'id': 'q4',
            'category': 'Expérience',
            'text': f'Comment votre expérience passée vous prépare-t-elle pour les missions suivantes : {"; ".join(job_context["missions"][:2])} ?',
            'difficulty': 'hard',
            'expected_keywords': ['expérience pertinente', 'accomplissements', 'apprentissages'],
            'evaluation_criteria': ['pertinence expérience', 'accomplissements', 'capacité adaptation']
        }
    ]

    job_context_data = {
        'title': job_context['title'],
        'key_skills': job_context['required_skills'],
        'company_culture': f'Culture orientée vers {job_context.get("contract_type", "l\'excellence")}'
    }

    # Sauvegarder dans Firestore
    interview_ref = db.collection('interview_sessions').document()
    interview_ref.set({
        'user_id': session['uid'],
        'application_id': application_id,
        'job_id': job_context.get('job_id', ''),
        'questions': fallback_questions,
        'job_context': job_context_data,
        'created_at': datetime.now(),
        'status': 'active',
        'current_question': 0,
        'responses': [],
        'scores': {}
    })

    return jsonify({
        'success': True,
        'data': {
            'session_id': interview_ref.id,
            'questions': fallback_questions,
            'job_context': job_context_data,
            'total_questions': len(fallback_questions)
        }
    })


@training_interview_bp.route('/submit-answer', methods=['POST'])
@cross_origin(supports_credentials=True)
def submit_interview_answer():
    """Évalue une réponse à une question d'entretien."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()
        session_id = data.get('session_id')
        question_id = data.get('question_id')
        answer = data.get('answer')
        job_context = data.get('job_context', {})

        if not all([session_id, question_id, answer]):
            return jsonify({'success': False, 'error': 'Données manquantes'}), 400

        # Récupérer la session d'entretien
        session_ref = db.collection('interview_sessions').document(session_id)
        interview_session = session_ref.get()

        if not interview_session.exists or interview_session.to_dict()['user_id'] != session['uid']:
            return jsonify({'success': False, 'error': 'Session non trouvée'}), 404

        # Trouver la question
        questions = interview_session.to_dict().get('questions', [])
        current_question = next((q for q in questions if q['id'] == question_id), None)

        if not current_question:
            return jsonify({'success': False, 'error': 'Question non trouvée'}), 404

        # Évaluer la réponse avec l'IA
        prompt = f"""
        Tu es un recruteur expert qui évalue les réponses aux entretiens.

        Contexte du poste:
        - Titre: {job_context.get('title', 'Non spécifié')}
        - Compétences clés: {', '.join(job_context.get('key_skills', []))}

        Question posée (Catégorie: {current_question.get('category', 'Général')}):
        "{current_question.get('text', '')}"

        Mots-clés attendus: {', '.join(current_question.get('expected_keywords', []))}

        Réponse du candidat:
        "{answer}"

        Évalue cette réponse sur 10 points selon ces critères:
        1. Pertinence par rapport à la question (0-3 points)
        2. Clarté et structure de la réponse (0-3 points)
        3. Utilisation d'exemples concrets (0-2 points)
        4. Alignement avec les mots-clés attendus (0-2 points)

        Fournis un feedback détaillé et des conseils d'amélioration.

        Format de réponse attendu en JSON:
        {{
            "score": 8,
            "score_breakdown": {{
                "pertinence": 3,
                "clarte": 2,
                "exemples": 2,
                "mots_cles": 1
            }},
            "feedback": "Feedback détaillé sur la réponse...",
            "improvement_tips": ["Conseil 1", "Conseil 2"],
            "strengths": ["Point fort 1", "Point fort 2"],
            "areas_to_improve": ["Aire à améliorer 1", "Aire à améliorer 2"]
        }}

        Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.
        """

        try:
            ai_response = generate_contract_content(prompt)

            # Extraire le JSON
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                evaluation = json.loads(json_str)

                # Mettre à jour la session
                current_responses = interview_session.to_dict().get('responses', [])
                current_responses.append({
                    'question_id': question_id,
                    'answer': answer,
                    'evaluation': evaluation,
                    'timestamp': datetime.now()
                })

                current_scores = interview_session.to_dict().get('scores', {})
                current_scores[question_id] = evaluation.get('score', 0)

                # Calculer la progression
                current_question_idx = next((i for i, q in enumerate(questions) if q['id'] == question_id), 0)
                next_question_idx = current_question_idx + 1 if current_question_idx + 1 < len(questions) else None

                session_ref.update({
                    'responses': current_responses,
                    'scores': current_scores,
                    'current_question': next_question_idx if next_question_idx is not None else len(questions),
                    'updated_at': datetime.now()
                })

                if next_question_idx is None:
                    session_ref.update({'status': 'completed'})

                return jsonify({
                    'success': True,
                    'data': evaluation
                })
            else:
                raise ValueError("Format de réponse IA invalide")

        except Exception as ai_error:
            logger.error(f"Erreur évaluation IA: {ai_error}")
            return generate_fallback_evaluation(answer, current_question, session_ref, question_id)

    except Exception as e:
        logger.error(f"Erreur soumission réponse: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


def generate_fallback_evaluation(answer, question, session_ref, question_id):
    """Évaluation par défaut si l'IA échoue."""
    import random

    # Évaluation simple basée sur la longueur et la présence de mots-clés
    answer_length = len(answer.split())
    keywords_found = sum(1 for keyword in question.get('expected_keywords', [])
                         if keyword.lower() in answer.lower())

    score = min(10, (answer_length // 10) * 2 + keywords_found * 2)

    evaluation = {
        'score': score,
        'score_breakdown': {
            'pertinence': min(3, score // 3),
            'clarté': min(3, score // 3),
            'exemples': min(2, score // 5),
            'mots_cles': min(2, keywords_found)
        },
        'feedback': f"Votre réponse est {'bonne' if score >= 7 else 'correcte' if score >= 5 else 'à améliorer'}. Longueur: {answer_length} mots. Mots-clés trouvés: {keywords_found} sur {len(question.get('expected_keywords', []))}.",
        'improvement_tips': [
            "Développez davantage votre réponse avec des exemples concrets",
            "Structurez votre réponse (Situation, Action, Résultat)",
            "Mentionnez plus de compétences spécifiques au poste"
        ],
        'strengths': ["Réponse structurée", "Pertinence générale"] if score >= 5 else ["Effort de réponse"],
        'areas_to_improve': ["Exemples concrets", "Liens avec le poste"] if score < 8 else ["Perfectionnement"]
    }

    # Mettre à jour la session
    interview_session = session_ref.get()
    current_responses = interview_session.to_dict().get('responses', [])
    current_responses.append({
        'question_id': question_id,
        'answer': answer,
        'evaluation': evaluation,
        'timestamp': datetime.now()
    })

    current_scores = interview_session.to_dict().get('scores', {})
    current_scores[question_id] = score

    session_ref.update({
        'responses': current_responses,
        'scores': current_scores,
        'updated_at': datetime.now()
    })

    return jsonify({
        'success': True,
        'data': evaluation
    })


@training_interview_bp.route('/feedback/<session_id>', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_interview_feedback(session_id):
    """Récupère le feedback complet d'une session d'entretien."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        # Récupérer la session
        session_ref = db.collection('interview_sessions').document(session_id)
        interview_session = session_ref.get()

        if not interview_session.exists or interview_session.to_dict()['user_id'] != session['uid']:
            return jsonify({'success': False, 'error': 'Session non trouvée'}), 404

        session_data = interview_session.to_dict()
        responses = session_data.get('responses', [])
        scores = session_data.get('scores', {})

        if not responses:
            return jsonify({'success': False, 'error': 'Aucune réponse enregistrée'}), 400

        # Calculer les statistiques
        total_score = sum(scores.values())
        average_score = total_score / len(scores) if scores else 0

        # Générer un résumé avec l'IA
        prompt = f"""
        Tu es un coach d'entretien professionnel.

        Récapitulatif d'une simulation d'entretien:
        - Poste: {session_data.get('job_context', {}).get('title', 'Non spécifié')}
        - Nombre de questions: {len(session_data.get('questions', []))}
        - Nombre de réponses: {len(responses)}
        - Score moyen: {average_score:.1f}/10

        Détails des réponses:
        {json.dumps([{'question': r.get('question_id'), 'score': r.get('evaluation', {}).get('score', 0)} for r in responses], indent=2)}

        Génère un feedback complet incluant:
        1. Un résumé général de la performance
        2. Les points forts identifiés
        3. Les domaines à améliorer
        4. Des recommandations personnalisées pour de futurs entretiens

        Format de réponse attendu en JSON:
        {{
            "summary": "Résumé général...",
            "average_score": {average_score:.1f},
            "strengths": ["Point fort 1", "Point fort 2"],
            "areas_for_improvement": ["Aire à améliorer 1", "Aire à améliorer 2"],
            "recommendations": ["Recommandation 1", "Recommandation 2"],
            "next_steps": ["Étape 1", "Étape 2"]
        }}

        Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.
        """

        try:
            ai_response = generate_contract_content(prompt)

            # Extraire le JSON
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                feedback = json.loads(json_str)

                return jsonify({
                    'success': True,
                    'data': feedback
                })
            else:
                raise ValueError("Format de réponse IA invalide")

        except Exception as ai_error:
            logger.error(f"Erreur feedback IA: {ai_error}")
            return generate_fallback_feedback(session_data, responses, average_score)

    except Exception as e:
        logger.error(f"Erreur récupération feedback: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


def generate_fallback_feedback(session_data, responses, average_score):
    """Feedback par défaut si l'IA échoue."""
    feedback = {
        "summary": f"Vous avez complété la simulation d'entretien pour le poste de {session_data.get('job_context', {}).get('title', 'ce poste')}. Score moyen: {average_score:.1f}/10.",
        "average_score": average_score,
        "strengths": [
            "Engagement dans l'exercice",
            "Réponses généralement pertinentes",
            "Structure de base des réponses"
        ],
        "areas_for_improvement": [
            "Développer davantage les exemples concrets",
            "Mieux relier les réponses aux exigences du poste",
            "Améliorer la clarté et la concision"
        ],
        "recommendations": [
            "Entraînez-vous avec d'autres simulations",
            "Préparez des exemples concrets de vos expériences",
            "Étudiez l'entreprise et le poste en détail"
        ],
        "next_steps": [
            "Revoir les questions où votre score était inférieur à 7/10",
            "Préparer une présentation personnelle de 2 minutes",
            "Rechercher des informations sur l'entreprise"
        ]
    }

    return jsonify({
        'success': True,
        'data': feedback
    })


@training_interview_bp.route('/sessions', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_user_interview_sessions():
    """Récupère toutes les sessions d'entretien d'un utilisateur."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        sessions_ref = db.collection('interview_sessions') \
            .where('user_id', '==', session['uid']) \
            .order_by('created_at', direction='DESCENDING') \
            .limit(10) \
            .stream()

        sessions = []
        for doc in sessions_ref:
            session_data = doc.to_dict()
            session_data['id'] = doc.id
            sessions.append(session_data)

        return jsonify({
            'success': True,
            'data': {
                'sessions': sessions,
                'total': len(sessions)
            }
        })

    except Exception as e:
        logger.error(f"Erreur récupération sessions: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500