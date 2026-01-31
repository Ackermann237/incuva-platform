# backend/app/routes/VisioTraining.py
from flask import Blueprint, request, jsonify, session, g
from flask_cors import cross_origin
import logging
import json
from datetime import datetime
from ..ai.copilote import call_ia
from ..firebase.init_firebase import db
import uuid

logger = logging.getLogger(__name__)

visio_training_bp = Blueprint('visio_training', __name__)


@visio_training_bp.route('/start-visio', methods=['POST'])
@cross_origin(supports_credentials=True)
def start_visio_interview():
    """Démarre une session d'entretien en visio."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()
        application_id = data.get('application_id')
        job_data = data.get('job_data', {})

        if not application_id or not job_data:
            return jsonify({'success': False, 'error': 'Données manquantes'}), 400

        # Générer un ID de session unique pour la visio
        visio_session_id = str(uuid.uuid4())

        # Récupérer ou générer les questions
        job_ref = db.collection('jobs').document(job_data.get('job_id')).get()
        if job_ref.exists:
            job_details = job_ref.to_dict()
        else:
            job_details = {}

        # Générer les questions avec l'IA
        job_context = {
            'title': job_data.get('job_title', job_details.get('title', '')),
            'description': job_data.get('description', job_details.get('description', '')),
            'required_skills': job_details.get('required_skills', []),
            'company_name': job_data.get('company_name', ''),
            'contract_type': job_details.get('contract_type', '')
        }

        prompt = f"""
        Tu es un expert en préparation aux entretiens d'embauche.

        Contexte du poste:
        - Titre: {job_context['title']}
        - Entreprise: {job_context['company_name']}
        - Compétences requises: {', '.join(job_context['required_skills'][:5])}

        Génère 6-8 questions pour une simulation d'entretien en visioconférence.

        Format de réponse attendu en JSON:
        {{
            "questions": [
                {{
                    "id": "visio_q1",
                    "type": "technique",
                    "text": "Question texte",
                    "time_limit": 180,  // temps en secondes
                    "difficulty": "medium",
                    "evaluation_criteria": ["critère 1", "critère 2"],
                    "tips": ["astuce 1", "astuce 2"]
                }}
            ],
            "visio_settings": {{
                "session_duration": 1800,
                "max_questions": 8,
                "recording_enabled": true,
                "real_time_feedback": true
            }}
        }}

        Réponds UNIQUEMENT avec le JSON.
        """

        try:
            ai_response = call_ia(prompt)

            # Extraire le JSON
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                visio_data = json.loads(json_str)
            else:
                raise ValueError("Format de réponse IA invalide")

        except Exception as ai_error:
            logger.error(f"Erreur IA pour la visio: {ai_error}")
            # Questions par défaut
            visio_data = {
                "questions": [
                    {
                        "id": "visio_q1",
                        "type": "technique",
                        "text": f"Pouvez-vous présenter votre expérience en lien avec le poste de {job_context['title']} ?",
                        "time_limit": 120,
                        "difficulty": "easy",
                        "evaluation_criteria": ["clarté", "pertinence", "structure"],
                        "tips": ["Parlez pendant 1-2 minutes", "Structurez votre réponse"]
                    },
                    {
                        "id": "visio_q2",
                        "type": "comportementale",
                        "text": "Décrivez une situation difficile que vous avez surmontée.",
                        "time_limit": 180,
                        "difficulty": "medium",
                        "evaluation_criteria": ["résolution problème", "communication", "résultats"],
                        "tips": ["Utilisez la méthode STAR", "Soyez spécifique"]
                    }
                ],
                "visio_settings": {
                    "session_duration": 900,
                    "max_questions": 6,
                    "recording_enabled": True,
                    "real_time_feedback": True
                }
            }

        # Créer la session visio dans Firestore
        visio_session = {
            'user_id': session['uid'],
            'application_id': application_id,
            'session_id': visio_session_id,
            'job_context': job_context,
            'questions': visio_data.get('questions', []),
            'visio_settings': visio_data.get('visio_settings', {}),
            'status': 'active',
            'start_time': datetime.now(),
            'current_question': 0,
            'responses': [],
            'recordings': [],
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }

        db.collection('visio_sessions').document(visio_session_id).set(visio_session)

        return jsonify({
            'success': True,
            'data': {
                'visio_session_id': visio_session_id,
                'questions': visio_data.get('questions', []),
                'settings': visio_data.get('visio_settings', {}),
                'job_context': job_context
            }
        })

    except Exception as e:
        logger.error(f"Erreur démarrage visio: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@visio_training_bp.route('/submit-visio-answer', methods=['POST'])
@cross_origin(supports_credentials=True)
def submit_visio_answer():
    """Évalue une réponse d'entretien visio."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()
        visio_session_id = data.get('visio_session_id')
        question_id = data.get('question_id')
        answer_text = data.get('answer')
        recording_url = data.get('recording_url')

        if not all([visio_session_id, question_id, answer_text]):
            return jsonify({'success': False, 'error': 'Données manquantes'}), 400

        # Récupérer la session
        session_ref = db.collection('visio_sessions').document(visio_session_id)
        visio_session = session_ref.get()

        if not visio_session.exists or visio_session.to_dict()['user_id'] != session['uid']:
            return jsonify({'success': False, 'error': 'Session non trouvée'}), 404

        session_data = visio_session.to_dict()
        job_context = session_data.get('job_context', {})

        # Trouver la question
        questions = session_data.get('questions', [])
        current_question = next((q for q in questions if q['id'] == question_id), None)

        if not current_question:
            return jsonify({'success': False, 'error': 'Question non trouvée'}), 404

        # Évaluer la réponse avec l'IA
        prompt = f"""
        Tu es un expert en évaluation d'entretiens vidéo.

        Contexte:
        - Poste: {job_context.get('title', '')}
        - Entreprise: {job_context.get('company_name', '')}

        Question:
        "{current_question.get('text', '')}"

        Critères d'évaluation:
        {', '.join(current_question.get('evaluation_criteria', []))}

        Réponse du candidat:
        "{answer_text}"

        Évalue cette réponse pour un entretien VIDÉO. Considère:
        1. Qualité de la communication non-verbale (posture, contact visuel, gestes)
        2. Clarté et articulation de la parole
        3. Structure de la réponse
        4. Contenu et pertinence

        Format de réponse attendu en JSON:
        {{
            "score": 8.5,
            "score_breakdown": {{
                "communication_non_verbale": 4,
                "clarte_verbale": 4.5,
                "structure": 4,
                "contenu": 4.5,
                "temps_gestion": 4
            }},
            "feedback": "Feedback détaillé...",
            "video_feedback": ["Point positif vidéo 1", "Point à améliorer vidéo 1"],
            "improvement_tips": ["Conseil 1", "Conseil 2"],
            "next_question_tips": "Conseil pour la prochaine question"
        }}

        Réponds UNIQUEMENT avec le JSON.
        """

        try:
            ai_response = call_ia(prompt)

            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                evaluation = json.loads(json_str)
            else:
                raise ValueError("Format de réponse IA invalide")

        except Exception as ai_error:
            logger.error(f"Erreur évaluation IA visio: {ai_error}")
            evaluation = {
                "score": 7.0,
                "score_breakdown": {
                    "communication_non_verbale": 3.5,
                    "clarte_verbale": 3.5,
                    "structure": 3.5,
                    "contenu": 3.5,
                    "temps_gestion": 3.5
                },
                "feedback": "Réponse correcte. Pour améliorer votre performance vidéo, regardez plus souvent la caméra et parlez plus lentement.",
                "video_feedback": ["Posture correcte", "Regardez plus la caméra"],
                "improvement_tips": ["Pratiquez devant un miroir", "Enregistrez-vous pour vous voir"],
                "next_question_tips": "Prenez une respiration avant de répondre"
            }

        # Mettre à jour la session
        current_responses = session_data.get('responses', [])
        current_responses.append({
            'question_id': question_id,
            'answer': answer_text,
            'recording_url': recording_url,
            'evaluation': evaluation,
            'timestamp': datetime.now()
        })

        # Mettre à jour l'index de la question en cours
        current_idx = next((i for i, q in enumerate(questions) if q['id'] == question_id), 0)
        next_idx = current_idx + 1 if current_idx + 1 < len(questions) else None

        update_data = {
            'responses': current_responses,
            'updated_at': datetime.now()
        }

        if next_idx is not None:
            update_data['current_question'] = next_idx
        else:
            update_data['status'] = 'completed'
            update_data['end_time'] = datetime.now()

        session_ref.update(update_data)

        return jsonify({
            'success': True,
            'data': {
                'evaluation': evaluation,
                'next_question_index': next_idx,
                'total_questions': len(questions)
            }
        })

    except Exception as e:
        logger.error(f"Erreur soumission réponse visio: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@visio_training_bp.route('/end-visio', methods=['POST'])
@cross_origin(supports_credentials=True)
def end_visio_session():
    """Termine une session d'entretien visio et génère un rapport."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()
        visio_session_id = data.get('visio_session_id')

        if not visio_session_id:
            return jsonify({'success': False, 'error': 'Session ID manquant'}), 400

        # Récupérer la session
        session_ref = db.collection('visio_sessions').document(visio_session_id)
        visio_session = session_ref.get()

        if not visio_session.exists or visio_session.to_dict()['user_id'] != session['uid']:
            return jsonify({'success': False, 'error': 'Session non trouvée'}), 404

        session_data = visio_session.to_dict()
        responses = session_data.get('responses', [])
        job_context = session_data.get('job_context', {})

        if not responses:
            return jsonify({'success': False, 'error': 'Aucune réponse enregistrée'}), 400

        # Calculer les scores
        scores = [r.get('evaluation', {}).get('score', 0) for r in responses]
        avg_score = sum(scores) / len(scores) if scores else 0

        # Générer un rapport complet avec l'IA
        prompt = f"""
        Tu es un coach professionnel spécialisé en entretiens vidéo.

        Rapport d'une simulation d'entretien VIDÉO:
        - Poste: {job_context.get('title', '')}
        - Entreprise: {job_context.get('company_name', '')}
        - Nombre de questions: {len(session_data.get('questions', []))}
        - Score moyen: {avg_score:.1f}/10

        Détail des performances:
        {json.dumps([{
            'question': r.get('question_id'),
            'score': r.get('evaluation', {}).get('score', 0),
            'feedback': r.get('evaluation', {}).get('feedback', '')
        } for r in responses], indent=2)}

        Génère un rapport complet incluant:
        1. Résumé général de la performance vidéo
        2. Analyse de la communication non-verbale
        3. Évaluation de la présence à l'écran
        4. Points forts spécifiques à la vidéo
        5. Domaines d'amélioration pour les futurs entretiens vidéo
        6. Recommandations personnalisées

        Format de réponse attendu en JSON:
        {{
            "summary": "Résumé...",
            "average_score": {avg_score:.1f},
            "video_performance_analysis": {{
                "eye_contact": "Évaluation contact visuel",
                "body_language": "Évaluation langage corporel",
                "voice_clarity": "Évaluation clarté vocale",
                "presence": "Évaluation présence écran"
            }},
            "strengths": ["Point fort 1", "Point fort 2"],
            "video_specific_improvements": ["Amélioration 1", "Amélioration 2"],
            "recommendations": [
                {{
                    "title": "Titre recommandation",
                    "description": "Description",
                    "priority": "high/medium/low"
                }}
            ],
            "final_verdict": "Verdict final sur la préparation"
        }}

        Réponds UNIQUEMENT avec le JSON.
        """

        try:
            ai_response = call_ia(prompt)

            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                report = json.loads(json_str)
            else:
                raise ValueError("Format de réponse IA invalide")

        except Exception as ai_error:
            logger.error(f"Erreur rapport IA visio: {ai_error}")
            report = {
                "summary": f"Simulation d'entretien vidéo terminée. Score moyen: {avg_score:.1f}/10",
                "average_score": avg_score,
                "video_performance_analysis": {
                    "eye_contact": "À améliorer - regardez plus souvent la caméra",
                    "body_language": "Correct - posture droite",
                    "voice_clarity": "Bon - voix audible",
                    "presence": "À développer - plus de confiance à l'écran"
                },
                "strengths": ["Réponses structurées", "Connaissance du sujet"],
                "video_specific_improvements": ["Contact visuel", "Expression faciale"],
                "recommendations": [
                    {
                        "title": "Pratiquez devant la caméra",
                        "description": "Enregistrez-vous régulièrement pour vous habituer",
                        "priority": "high"
                    }
                ],
                "final_verdict": "Bonne préparation, continuez à travailler la présence vidéo"
            }

        # Mettre à jour la session avec le rapport
        session_ref.update({
            'status': 'completed',
            'end_time': datetime.now(),
            'report': report,
            'final_score': avg_score,
            'updated_at': datetime.now()
        })

        return jsonify({
            'success': True,
            'data': {
                'report': report,
                'session_data': {
                    'duration': (datetime.now() - session_data.get('start_time')).total_seconds() if session_data.get(
                        'start_time') else 0,
                    'questions_answered': len(responses),
                    'final_score': avg_score
                }
            }
        })

    except Exception as e:
        logger.error(f"Erreur fin session visio: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@visio_training_bp.route('/recordings/<visio_session_id>', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_visio_recordings(visio_session_id):
    """Récupère les enregistrements d'une session visio."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        # Récupérer la session
        session_ref = db.collection('visio_sessions').document(visio_session_id)
        visio_session = session_ref.get()

        if not visio_session.exists or visio_session.to_dict()['user_id'] != session['uid']:
            return jsonify({'success': False, 'error': 'Session non trouvée'}), 404

        session_data = visio_session.to_dict()

        # Simuler des enregistrements (dans une vraie implémentation, ce serait stocké dans un service cloud)
        recordings = [
            {
                'id': f'recording_{i + 1}',
                'question_id': response.get('question_id'),
                'timestamp': response.get('timestamp'),
                'duration': 120,  # secondes
                'url': f'/api/visio/recordings/{visio_session_id}/{i + 1}',
                'thumbnail': f'/api/visio/thumbnails/{visio_session_id}/{i + 1}'
            }
            for i, response in enumerate(session_data.get('responses', []))
        ]

        return jsonify({
            'success': True,
            'data': {
                'recordings': recordings,
                'session_info': {
                    'id': visio_session_id,
                    'start_time': session_data.get('start_time'),
                    'end_time': session_data.get('end_time'),
                    'status': session_data.get('status')
                }
            }
        })

    except Exception as e:
        logger.error(f"Erreur récupération enregistrements: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@visio_training_bp.route('/history', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_visio_history():
    """Récupère l'historique des sessions visio d'un utilisateur."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        # Récupérer les sessions de l'utilisateur
        sessions_ref = db.collection('visio_sessions') \
            .where('user_id', '==', session['uid']) \
            .order_by('created_at', direction='DESCENDING') \
            .limit(20) \
            .stream()

        sessions = []
        for doc in sessions_ref:
            session_data = doc.to_dict()
            session_data['id'] = doc.id

            # Calculer les statistiques
            responses = session_data.get('responses', [])
            scores = [r.get('evaluation', {}).get('score', 0) for r in responses]

            session_summary = {
                'id': doc.id,
                'job_title': session_data.get('job_context', {}).get('title', ''),
                'company': session_data.get('job_context', {}).get('company_name', ''),
                'date': session_data.get('created_at'),
                'duration': (session_data.get('end_time', datetime.now()) - session_data.get('start_time',
                                                                                             datetime.now())).total_seconds() if session_data.get(
                    'start_time') else 0,
                'questions_answered': len(responses),
                'average_score': sum(scores) / len(scores) if scores else 0,
                'status': session_data.get('status', 'unknown'),
                'has_recordings': len(responses) > 0
            }
            sessions.append(session_summary)

        return jsonify({
            'success': True,
            'data': {
                'sessions': sessions,
                'total': len(sessions)
            }
        })

    except Exception as e:
        logger.error(f"Erreur récupération historique: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@visio_training_bp.route('/submit-audio-answer', methods=['POST'])
@cross_origin(supports_credentials=True)
def submit_audio_answer():
    """Évalue une réponse audio d'entretien visio."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()
        visio_session_id = data.get('visio_session_id')
        question_id = data.get('question_id')
        audio_transcript = data.get('audio_transcript')
        audio_duration = data.get('audio_duration')
        audio_metrics = data.get('audio_metrics', {})

        if not all([visio_session_id, question_id, audio_transcript]):
            return jsonify({'success': False, 'error': 'Données manquantes'}), 400

        # Récupérer la session
        session_ref = db.collection('visio_sessions').document(visio_session_id)
        visio_session = session_ref.get()

        if not visio_session.exists or visio_session.to_dict()['user_id'] != session['uid']:
            return jsonify({'success': False, 'error': 'Session non trouvée'}), 404

        session_data = visio_session.to_dict()
        job_context = session_data.get('job_context', {})

        # Trouver la question
        questions = session_data.get('questions', [])
        current_question = next((q for q in questions if q['id'] == question_id), None)

        if not current_question:
            return jsonify({'success': False, 'error': 'Question non trouvée'}), 404

        # Évaluer la réponse AUDIO avec l'IA (incluant l'analyse vocale)
        prompt = f"""
        Tu es un expert en évaluation d'entretiens vidéo et audio.

        Contexte:
        - Poste: {job_context.get('title', '')}
        - Entreprise: {job_context.get('company_name', '')}

        Question:
        "{current_question.get('text', '')}"

        Critères d'évaluation:
        {', '.join(current_question.get('evaluation_criteria', []))}

        Réponse AUDIO du candidat:
        "{audio_transcript}"

        Métriques audio:
        - Durée: {audio_duration} secondes
        - Délai de réponse: {audio_metrics.get('response_delay', 0)} secondes
        - Fluidité: {audio_metrics.get('fluency_score', 'Non mesurée')}

        Évalue cette réponse AUDIO pour un entretien VIDÉO. Considère:
        1. Qualité de la communication vocale (clarté, articulation, rythme)
        2. Structure de la réponse parlée
        3. Contenu et pertinence
        4. Confiance dans la voix
        5. Gestion du temps (trop long/trop court)

        Format de réponse attendu en JSON:
        {{
            "score": 8.5,
            "score_breakdown": {{
                "communication_vocale": 4.5,
                "structure": 4,
                "contenu": 4.5,
                "confiance": 4,
                "gestion_temps": 4
            }},
            "audio_feedback": "Feedback spécifique à la qualité audio...",
            "transcription": "{audio_transcript}",
            "feedback": "Feedback détaillé...",
            "audio_specific_feedback": ["Point audio positif 1", "Point audio à améliorer 1"],
            "improvement_tips": ["Conseil 1", "Conseil 2"],
            "voice_analysis": {{
                "clarity": "bonne/moyenne/faible",
                "pace": "adapté/trop rapide/trop lent",
                "confidence": "élevée/moyenne/faible"
            }}
        }}

        Réponds UNIQUEMENT avec le JSON.
        """

        try:
            ai_response = call_ia(prompt)

            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                evaluation = json.loads(json_str)
            else:
                raise ValueError("Format de réponse IA invalide")

        except Exception as ai_error:
            logger.error(f"Erreur évaluation IA audio: {ai_error}")
            evaluation = {
                "score": 7.0,
                "score_breakdown": {
                    "communication_vocale": 3.5,
                    "structure": 3.5,
                    "contenu": 3.5,
                    "confiance": 3.5,
                    "gestion_temps": 3.5
                },
                "audio_feedback": "Qualité audio acceptable. Pour améliorer votre communication orale, parlez plus lentement et articulez mieux.",
                "transcription": audio_transcript,
                "feedback": "Réponse correcte. Pour améliorer votre performance, structurez mieux vos réponses et donnez plus d'exemples concrets.",
                "audio_specific_feedback": ["Voix audible", "Parlez plus lentement"],
                "improvement_tips": ["Pratiquez à haute voix", "Enregistrez-vous pour vous écouter"],
                "voice_analysis": {
                    "clarity": "moyenne",
                    "pace": "trop rapide",
                    "confidence": "moyenne"
                }
            }

        # Mettre à jour la session avec l'évaluation audio
        current_responses = session_data.get('responses', [])
        current_responses.append({
            'question_id': question_id,
            'answer': audio_transcript,
            'answer_type': 'audio',
            'audio_duration': audio_duration,
            'audio_metrics': audio_metrics,
            'evaluation': evaluation,
            'timestamp': datetime.now()
        })

        # Mettre à jour l'index de la question en cours
        current_idx = next((i for i, q in enumerate(questions) if q['id'] == question_id), 0)
        next_idx = current_idx + 1 if current_idx + 1 < len(questions) else None

        update_data = {
            'responses': current_responses,
            'updated_at': datetime.now()
        }

        if next_idx is not None:
            update_data['current_question'] = next_idx
        else:
            update_data['status'] = 'completed'
            update_data['end_time'] = datetime.now()

        session_ref.update(update_data)

        return jsonify({
            'success': True,
            'data': {
                'evaluation': evaluation,
                'next_question_index': next_idx,
                'total_questions': len(questions)
            }
        })

    except Exception as e:
        logger.error(f"Erreur soumission réponse audio: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500