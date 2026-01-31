# backend/app/routes/TechnicalTest.py
from flask import Blueprint, request, jsonify, session, g
from flask_cors import cross_origin
import logging
import json
from datetime import datetime

from ..ai.TestAI import generate_technical_test
from ..ai.copilote import call_ia
from ..firebase.init_firebase import db

logger = logging.getLogger(__name__)

technical_test_bp = Blueprint('technical_test', __name__)


@technical_test_bp.route('/api/technical-tests', methods=['POST'])
@cross_origin(supports_credentials=True)
def create_technical_test():
    """Créer un test technique pour une offre d'emploi."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    try:
        data = request.get_json()
        job_id = data.get('job_id')
        test_data = data.get('test_data', {})

        if not job_id or not test_data:
            return jsonify({'success': False, 'error': 'Données manquantes'}), 400

        # Vérifier que l'entreprise possède cette offre
        job_ref = db.collection('jobs').document(job_id)
        job = job_ref.get()

        if not job.exists:
            return jsonify({'success': False, 'error': 'Offre d\'emploi non trouvée'}), 404

        if job.to_dict().get('company_id') != session['uid']:
            return jsonify({'success': False, 'error': 'Vous n\'êtes pas autorisé à modifier cette offre'}), 403

        # Valider les données du test
        if not test_data.get('title'):
            return jsonify({'success': False, 'error': 'Le titre du test est requis'}), 400

        if not test_data.get('questions') or len(test_data.get('questions', [])) == 0:
            return jsonify({'success': False, 'error': 'Le test doit contenir au moins une question'}), 400

        # VALIDER ET CORRIGER LES POINTS DES QUESTIONS
        validated_questions = []
        for question in test_data.get('questions', []):
            validated_question = question.copy()

            # S'assurer que les points sont des nombres
            if 'points' in validated_question:
                try:
                    # Convertir en nombre entier
                    validated_question['points'] = int(float(validated_question['points']))
                except (ValueError, TypeError):
                    # Valeur par défaut si conversion échoue
                    validated_question['points'] = 1

            # S'assurer que chaque question a des points
            if 'points' not in validated_question:
                validated_question['points'] = 1

            validated_questions.append(validated_question)

        # Remplacer les questions par les versions validées
        test_data['questions'] = validated_questions

        # Calculer le score total (maintenant avec des nombres garantis)
        total_points = sum(q.get('points', 1) for q in test_data.get('questions', []))

        # S'assurer que les autres valeurs numériques sont correctes
        duration = test_data.get('duration', 60)
        passing_score = test_data.get('passing_score', 70)

        # Convertir si nécessaire
        try:
            duration = int(float(duration))
        except (ValueError, TypeError):
            duration = 60

        try:
            passing_score = int(float(passing_score))
        except (ValueError, TypeError):
            passing_score = 70

        # Préparer le document du test
        test_doc = {
            'job_id': job_id,
            'company_id': session['uid'],
            'title': test_data.get('title', '').strip(),
            'description': test_data.get('description', '').strip(),
            'duration': duration,  # en minutes
            'passing_score': passing_score,  # pourcentage
            'total_points': total_points,
            'questions': test_data.get('questions', []),
            'is_public': bool(test_data.get('is_public', False)),
            'allow_retake': bool(test_data.get('allow_retake', False)),
            'show_results': bool(test_data.get('show_results', True)),
            'grading_mode': test_data.get('grading_mode', 'auto'),
            'status': 'active',
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'candidate_count': 0,
            'average_score': 0
        }

        # Sauvegarder dans Firestore
        test_ref = db.collection('technical_tests').document()
        test_doc['id'] = test_ref.id
        test_ref.set(test_doc)

        # Générer un lien public si le test est public
        if test_doc['is_public']:
            test_doc['public_link'] = f"/technical-test/{test_ref.id}"

        return jsonify({
            'success': True,
            'message': 'Test technique créé avec succès',
            'data': test_doc
        })

    except Exception as e:
        logger.error(f"Erreur création test technique: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


# Dans la fonction generate_technical_test_ai()

@technical_test_bp.route('/api/technical-tests/generate-ai', methods=['POST'])
@cross_origin(supports_credentials=True)
def generate_technical_test_ai():
    """Génère un test technique avec l'IA basé sur l'offre d'emploi et les directives utilisateur."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    try:
        data = request.get_json()
        job_id = data.get('job_id')
        config = data.get('config', {})

        if not job_id:
            return jsonify({'success': False, 'error': 'ID d\'offre requis'}), 400

        # Récupérer les détails de l'offre
        job_ref = db.collection('jobs').document(job_id)
        job = job_ref.get()

        if not job.exists:
            return jsonify({'success': False, 'error': 'Offre d\'emploi non trouvée'}), 404

        job_data = job.to_dict()

        # UTILISATION DE LA NOUVELLE CLASSE TestAI (version améliorée)
        generated_test = generate_technical_test(job_data, config, db)

        # VALIDER ET CORRIGER LES DONNÉES GÉNÉRÉES PAR L'IA
        if 'questions' in generated_test:
            validated_questions = []
            for question in generated_test['questions']:
                validated_question = question.copy()

                # Pour les questions MCQ
                if validated_question.get('type') == 'mcq' and 'options' in validated_question:
                    options = validated_question['options']

                    # Compter les réponses correctes
                    correct_count = sum(1 for opt in options if opt.get('is_correct', False))
                    total_options = len(options)

                    # CORRECTION 1: S'assurer qu'il n'y a pas 0 réponse correcte
                    if correct_count == 0 and total_options > 0:
                        options[0]['is_correct'] = True
                        correct_count = 1

                    # CORRECTION 2: S'assurer qu'il n'y a pas trop de réponses correctes
                    if correct_count > 1 and not validated_question.get('multiple_correct', False):
                        # Si c'est un QCM à réponse unique mais plusieurs sont marquées correctes
                        # Garder seulement la première comme correcte
                        for i, opt in enumerate(options):
                            opt['is_correct'] = (i == 0)

                    # CORRECTION 3: S'assurer que toutes les options ne sont pas correctes
                    if correct_count == total_options and total_options > 1:
                        # Rendre incorrectes toutes sauf la première
                        for i, opt in enumerate(options):
                            opt['is_correct'] = (i == 0)

                    validated_question['options'] = options

                validated_questions.append(validated_question)

            generated_test['questions'] = validated_questions

        return jsonify({
            'success': True,
            'data': generated_test
        })

    except Exception as e:
        logger.error(f"Erreur génération test IA: {e}", exc_info=True)
        # Retourner un test par défaut en cas d'erreur
        default_test = create_default_test(
            job_data.get('title', 'Poste'),
            config.get('difficulty', 'medium'),
            config.get('question_types', ['mcq', 'open_ended']),
            config.get('number_of_questions', 10)
        )
        return jsonify({
            'success': True,
            'data': default_test
        })


def build_advanced_prompt(
        job_title, job_desc, job_skills, job_missions, job_contract,
        difficulty, question_types, num_questions, include_explanations,
        custom_prompt, focus_areas, specific_topics, exclude_topics,
        experience_level, test_style, include_complexity_analysis,
        include_best_practices, include_error_handling, include_optimization
):
    """Construit un prompt avancé pour l'IA."""

    # Niveaux de difficulté
    difficulty_map = {
        'easy': 'débutant',
        'medium': 'intermédiaire',
        'hard': 'avancé'
    }

    # Niveaux d'expérience
    experience_map = {
        'junior': 'junior (0-2 ans d\'expérience)',
        'intermediate': 'intermédiaire (2-5 ans d\'expérience)',
        'senior': 'senior (5+ ans d\'expérience)',
        'expert': 'expert (8+ ans d\'expérience)'
    }

    # Styles de test
    style_map = {
        'theoretical': 'théorique (concepts, principes, théorie)',
        'practical': 'pratique (exercices concrets, scénarios réels)',
        'mixed': 'mixte (équilibre théorie/pratique)'
    }

    # Types de questions
    question_type_labels = {
        'mcq': 'Questions à choix multiple (QCM)',
        'coding': 'Exercices de programmation',
        'open_ended': 'Questions à réponse ouverte'
    }

    # Construire le prompt
    prompt = f"""Tu es un expert en recrutement technique qui crée des tests d'évaluation pour développeurs.

# CONTEXTE DE L'OFFRE D'EMPLOI
**Titre du poste:** {job_title}
**Description:** {job_desc[:1000]}
**Compétences requises:** {job_skills}
**Missions principales:** {job_missions}
**Type de contrat:** {job_contract}

# CONFIGURATION DU TEST
**Niveau de difficulté:** {difficulty_map.get(difficulty, 'intermédiaire')}
**Nombre de questions:** {num_questions}
**Niveau d'expérience cible:** {experience_map.get(experience_level, 'intermédiaire')}
**Style du test:** {style_map.get(test_style, 'mixte')}
**Types de questions:** {', '.join([question_type_labels.get(t, t) for t in question_types])}

# DIRECTIVES SPÉCIFIQUES
"""

    # Ajouter les directives spécifiques si fournies
    if custom_prompt:
        prompt += f"\n**Instructions personnalisées:**\n{custom_prompt}\n"

    if focus_areas:
        prompt += f"\n**Domaines de focus prioritaires:**\n{', '.join(focus_areas)}\n"

    if specific_topics:
        prompt += f"\n**Topics spécifiques à inclure:**\n{specific_topics}\n"

    if exclude_topics:
        prompt += f"\n**Topics à exclure:**\n{exclude_topics}\n"

    # Critères d'évaluation
    prompt += "\n# CRITÈRES D'ÉVALUATION\n"
    if include_best_practices:
        prompt += "- Évaluer les connaissances des bonnes pratiques\n"
    if include_error_handling:
        prompt += "- Inclure des scénarios de gestion d'erreurs\n"
    if include_complexity_analysis:
        prompt += "- Inclure des questions sur l'analyse de complexité\n"
    if include_optimization:
        prompt += "- Inclure des questions d'optimisation\n"

    # Répartition des questions
    prompt += f"\n# RÉPARTITION DES QUESTIONS\n"
    prompt += f"Créer {num_questions} questions avec la répartition suivante:\n"

    if 'mcq' in question_types:
        prompt += f"- Questions à choix multiple (QCM): {int(num_questions * 0.4)} questions\n"
    if 'coding' in question_types:
        prompt += f"- Exercices de code: {int(num_questions * 0.4)} questions\n"
    if 'open_ended' in question_types:
        prompt += f"- Questions à réponse ouverte: {int(num_questions * 0.2)} questions\n"

    # Instructions de format
    prompt += """
# FORMAT DE RÉPONSE ATTENDU
Tu dois répondre UNIQUEMENT avec un objet JSON valide au format suivant:

{
    "title": "Titre du test technique",
    "description": "Description détaillée du test",
    "duration": 60,
    "passing_score": 70,
    "questions": [
        {
            "id": "q1",
            "type": "mcq",
            "question": "Énoncé de la question",
            "points": 1,
            "difficulty": "easy|medium|hard",
            "explanation": "Explication détaillée de la réponse",
            "options": [
                {"id": 1, "text": "Option 1", "is_correct": true},
                {"id": 2, "text": "Option 2", "is_correct": false}
            ],
            "multiple_correct": false
        },
        {
            "id": "q2",
            "type": "coding",
            "question": "Énoncé du problème de code",
            "points": 2,
            "difficulty": "medium",
            "explanation": "Explication de la solution",
            "language": "javascript|python|java|etc",
            "code_template": "Template de code de départ",
            "expected_output": "Sortie attendue",
            "test_cases": [
                {"input": "value1", "expected": "result1"},
                {"input": "value2", "expected": "result2"}
            ]
        },
        {
            "id": "q3",
            "type": "open_ended",
            "question": "Question ouverte",
            "points": 3,
            "difficulty": "hard",
            "explanation": "Résumé de ce qui est attendu",
            "max_length": 500,
            "expected_keywords": ["mot-clé1", "mot-clé2", "mot-clé3"]
        }
    ]
}

# IMPORTANT
1. Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.
2. Échappe correctement tous les caractères spéciaux dans les chaînes.
3. Assure-toi que le JSON est syntaxiquement valide.
4. Adapte le contenu aux directives spécifiques fournies ci-dessus.
5. Pour les questions de code, fournis un template de départ réaliste.
6. Pour les QCM, marque clairement les réponses correctes.
7. Pour les questions ouvertes, liste les mots-clés attendus.

Génère maintenant le test technique JSON:
"""

    return prompt


def parse_ai_response(ai_response, job_title, difficulty, question_types, num_questions):
    """Parse et valide la réponse de l'IA."""

    # Nettoyer la réponse
    ai_response = ai_response.strip()

    # Chercher le JSON dans la réponse
    start_idx = ai_response.find('{')
    end_idx = ai_response.rfind('}') + 1

    if start_idx == -1 or end_idx == 0:
        logger.error("Aucun JSON trouvé dans la réponse IA")
        return create_robust_test(job_title, difficulty, question_types, num_questions)

    json_str = ai_response[start_idx:end_idx]

    try:
        # Nettoyer le JSON
        json_str = clean_json_string(json_str)
        generated_test = json.loads(json_str)
        logger.info("JSON IA parsé avec succès")

        # Valider et compléter la structure
        generated_test = validate_and_complete_test(generated_test, job_title, difficulty, question_types,
                                                    num_questions)

        return generated_test

    except json.JSONDecodeError as e:
        logger.error(f"Erreur parsing JSON IA: {e}")
        logger.error(f"JSON problématique: {json_str[:200]}")
        return create_robust_test(job_title, difficulty, question_types, num_questions)


def validate_and_complete_test(test_data, job_title, difficulty, question_types, num_questions):
    """Valide et complète la structure du test."""

    # Titre par défaut
    if 'title' not in test_data or not test_data['title']:
        test_data['title'] = f"Test technique - {job_title}"

    # Description par défaut
    if 'description' not in test_data:
        test_data[
            'description'] = f"Évaluation des compétences techniques pour le poste de {job_title}. Ce test a été généré automatiquement en fonction des exigences du poste."

    # Durée par défaut
    if 'duration' not in test_data:
        test_data['duration'] = 60

    # Score de passage par défaut
    if 'passing_score' not in test_data:
        test_data['passing_score'] = 70

    # Questions par défaut
    if 'questions' not in test_data or not isinstance(test_data['questions'], list):
        test_data['questions'] = []

    # Valider chaque question
    for i, question in enumerate(test_data.get('questions', [])):
        # ID et ordre
        if 'id' not in question:
            question['id'] = f"q{i + 1}"
        if 'order' not in question:
            question['order'] = i + 1

        # Type de question
        if 'type' not in question:
            # Assigner un type basé sur l'index ou par défaut
            if i % 3 == 0 and 'mcq' in question_types:
                question['type'] = 'mcq'
            elif i % 3 == 1 and 'coding' in question_types:
                question['type'] = 'coding'
            elif i % 3 == 2 and 'open_ended' in question_types:
                question['type'] = 'open_ended'
            else:
                question['type'] = question_types[0] if question_types else 'mcq'

        # Points par défaut
        if 'points' not in question:
            if question.get('type') == 'coding':
                question['points'] = 2
            elif question.get('type') == 'open_ended':
                question['points'] = 3
            else:
                question['points'] = 1

        # Difficulté
        if 'difficulty' not in question:
            question['difficulty'] = difficulty

        # Compléter selon le type
        if question['type'] == 'mcq':
            if 'options' not in question or not question['options']:
                question['options'] = [
                    {"id": 1, "text": "Option A", "is_correct": True},
                    {"id": 2, "text": "Option B", "is_correct": False},
                    {"id": 3, "text": "Option C", "is_correct": False},
                    {"id": 4, "text": "Option D", "is_correct": False}
                ]
            if 'multiple_correct' not in question:
                question['multiple_correct'] = False

        elif question['type'] == 'coding':
            if 'language' not in question:
                question['language'] = 'python'
            if 'code_template' not in question:
                question['code_template'] = "# Écris ton code ici"
            if 'expected_output' not in question:
                question['expected_output'] = "Résultat attendu"
            if 'test_cases' not in question:
                question['test_cases'] = []

        elif question['type'] == 'open_ended':
            if 'max_length' not in question:
                question['max_length'] = 500
            if 'expected_keywords' not in question:
                question['expected_keywords'] = []

    # Limiter le nombre de questions
    test_data['questions'] = test_data['questions'][:num_questions]

    # S'assurer qu'il y a au moins des questions
    if not test_data['questions']:
        test_data['questions'] = create_default_questions(job_title, difficulty, question_types, min(5, num_questions))

    return test_data


def create_default_questions(job_title, difficulty, question_types, num_questions):
    """Crée des questions par défaut."""
    questions = []

    for i in range(num_questions):
        question_num = i + 1

        # Choisir le type de question
        if i % 3 == 0 and 'mcq' in question_types:
            q_type = 'mcq'
        elif i % 3 == 1 and 'coding' in question_types:
            q_type = 'coding'
        elif i % 3 == 2 and 'open_ended' in question_types:
            q_type = 'open_ended'
        else:
            q_type = question_types[0] if question_types else 'mcq'

        if q_type == 'mcq':
            questions.append({
                "id": f"q{question_num}",
                "type": "mcq",
                "question": f"Quelle est votre compréhension des compétences requises pour {job_title} ?",
                "points": 1,
                "difficulty": difficulty,
                "options": [
                    {"id": 1, "text": "Bonne compréhension, j'ai l'expérience nécessaire", "is_correct": True},
                    {"id": 2, "text": "Compréhension moyenne, certaines compétences à développer", "is_correct": False},
                    {"id": 3, "text": "Compréhension limitée, beaucoup à apprendre", "is_correct": False},
                    {"id": 4, "text": "Je ne suis pas sûr", "is_correct": False}
                ],
                "multiple_correct": False
            })

        elif q_type == 'coding':
            questions.append({
                "id": f"q{question_num}",
                "type": "coding",
                "question": f"Écrivez une fonction simple qui démontre votre approche de résolution de problème dans le contexte de {job_title}.",
                "points": 2,
                "difficulty": difficulty,
                "language": "python",
                "code_template": "def solution():\n    # Écris ta solution ici\n    pass",
                "expected_output": "Solution fonctionnelle avec une complexité raisonnable",
                "test_cases": []
            })

        elif q_type == 'open_ended':
            questions.append({
                "id": f"q{question_num}",
                "type": "open_ended",
                "question": f"Comment abordez-vous les défis techniques complexes dans votre travail quotidien, particulièrement en relation avec {job_title} ?",
                "points": 3,
                "difficulty": difficulty,
                "max_length": 500,
                "expected_keywords": ["analyse", "solution", "implémentation", "test", "optimisation"]
            })

    return questions


def clean_json_string(json_str):
    """Nettoie une chaîne JSON problématique."""
    import re

    # Chercher le JSON entre accolades
    pattern = r'\{.*\}'
    matches = re.findall(pattern, json_str, re.DOTALL)

    if matches:
        json_str = matches[0]

    # Supprimer les commentaires
    json_str = re.sub(r'//.*', '', json_str)
    json_str = re.sub(r'/\*.*?\*/', '', json_str, flags=re.DOTALL)

    # Protéger les chaînes existantes
    def protect_strings(match):
        content = match.group(1)
        content = content.replace('"', '##DOUBLEQUOTE##')
        content = content.replace("'", '##SINGLEQUOTE##')
        return f'"{content}"'

    # Protéger les chaînes entre guillemets doubles
    json_str = re.sub(r'"([^"]*)"', protect_strings, json_str)

    # Remplacer les guillemets simples par des doubles
    json_str = json_str.replace("'", '"')

    # Restaurer les guillemets protégés
    json_str = json_str.replace('##DOUBLEQUOTE##', '\\"')
    json_str = json_str.replace('##SINGLEQUOTE##', "'")

    # Échapper les sauts de ligne dans les chaînes
    lines = json_str.split('\n')
    result = []
    in_string = False

    for line in lines:
        new_line = ''
        i = 0
        while i < len(line):
            char = line[i]
            if char == '"':
                if i > 0 and line[i - 1] == '\\':
                    new_line += char
                else:
                    in_string = not in_string
                    new_line += char
            elif char == '\n' and in_string:
                new_line += '\\n'
            else:
                new_line += char
            i += 1
        result.append(new_line)

    json_str = '\n'.join(result)

    # Corriger les virgules manquantes
    json_str = re.sub(r'(\]|\})(\s*)\[', r'\1,\2[', json_str)
    json_str = re.sub(r'(\]|\})(\s*)\{', r'\1,\2{', json_str)

    # Supprimer les virgules traînantes
    json_str = re.sub(r',\s*([\]}])', r'\1', json_str)

    # Valider les propriétés JSON
    json_str = re.sub(r'("[\w_]+")\s*:\s*([^"{}\[\],\s]+)(?=\s*[,}])', r'\1: "\2"', json_str)

    return json_str


def create_robust_test(job_title, difficulty, question_types, num_questions):
    """Crée un test robuste avec plusieurs questions."""
    return {
        "title": f"Test technique - {job_title}",
        "description": f"Évaluation des compétences techniques pour le poste de {job_title}. Ce test couvre divers aspects du rôle.",
        "duration": 60,
        "passing_score": 70,
        "questions": create_default_questions(job_title, difficulty, question_types, min(num_questions, 10))
    }



def create_default_test(job_title, difficulty, question_types, num_questions):
    """Crée un test par défaut en cas d'échec de l'IA."""
    return create_robust_test(job_title, difficulty, question_types, num_questions)

@technical_test_bp.route('/api/jobs/<job_id>/technical-tests', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_job_technical_tests(job_id):
    """Récupère tous les tests techniques d'une offre d'emploi."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        # Vérifier que l'utilisateur a accès à cette offre
        job_ref = db.collection('jobs').document(job_id)
        job = job_ref.get()

        if not job.exists:
            return jsonify({'success': False, 'error': 'Offre non trouvée'}), 404

        job_data = job.to_dict()

        # Vérifier les permissions
        user_can_access = (
                session['uid'] == job_data.get('company_id') or  # Propriétaire
                session.get('account_type') == 'admin'  # Administrateur
        )

        if not user_can_access:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Récupérer les tests
        tests_query = db.collection('technical_tests') \
            .where('job_id', '==', job_id) \
            .order_by('created_at', direction='DESCENDING') \
            .stream()

        tests = []
        for doc in tests_query:
            test_data = doc.to_dict()
            test_data['id'] = doc.id
            tests.append(test_data)

        return jsonify({
            'success': True,
            'data': tests
        })

    except Exception as e:
        logger.error(f"Erreur récupération tests: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@technical_test_bp.route('/api/technical-tests/<test_id>', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_technical_test(test_id):
    """Récupère un test technique spécifique."""
    try:
        test_ref = db.collection('technical_tests').document(test_id)
        test_doc = test_ref.get()

        if not test_doc.exists:
            return jsonify({'success': False, 'error': 'Test non trouvé'}), 404

        test_data = test_doc.to_dict()
        test_data['id'] = test_id

        # Vérifier l'accès
        if test_data.get('is_public', False):
            # Test public - accessible à tous
            pass
        elif 'uid' not in session:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        else:
            # Vérifier si l'utilisateur est le propriétaire ou un admin
            is_owner = session['uid'] == test_data.get('company_id')
            is_admin = session.get('account_type') == 'admin'

            if not (is_owner or is_admin):
                return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        return jsonify({
            'success': True,
            'data': test_data
        })

    except Exception as e:
        logger.error(f"Erreur récupération test: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@technical_test_bp.route('/api/technical-tests/<test_id>', methods=['PUT'])
@cross_origin(supports_credentials=True)
def update_technical_test(test_id):
    """Met à jour un test technique."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()

        # Vérifier l'existence du test
        test_ref = db.collection('technical_tests').document(test_id)
        test_doc = test_ref.get()

        if not test_doc.exists:
            return jsonify({'success': False, 'error': 'Test non trouvé'}), 404

        test_data = test_doc.to_dict()

        # Vérifier les permissions
        if session['uid'] != test_data.get('company_id') and session.get('account_type') != 'admin':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Préparer les mises à jour
        updates = {
            'updated_at': datetime.now()
        }

        # Mettre à jour les champs fournis
        allowed_fields = [
            'title', 'description', 'duration', 'passing_score',
            'questions', 'is_public', 'allow_retake', 'show_results', 'status'
        ]

        for field in allowed_fields:
            if field in data:
                updates[field] = data[field]

        # Recalculer le total des points si les questions sont modifiées
        if 'questions' in updates:
            # Valider et corriger les points
            validated_questions = []
            for question in updates['questions']:
                validated_question = question.copy()

                # S'assurer que les points sont des nombres
                if 'points' in validated_question:
                    try:
                        validated_question['points'] = int(float(validated_question['points']))
                    except (ValueError, TypeError):
                        validated_question['points'] = 1

                # S'assurer que chaque question a des points
                if 'points' not in validated_question:
                    validated_question['points'] = 1

                validated_questions.append(validated_question)

            updates['questions'] = validated_questions
            total_points = sum(q.get('points', 1) for q in updates['questions'])
            updates['total_points'] = total_points

        # Appliquer les mises à jour
        test_ref.update(updates)

        # Récupérer le document mis à jour
        updated_test = test_ref.get().to_dict()
        updated_test['id'] = test_id

        return jsonify({
            'success': True,
            'message': 'Test mis à jour avec succès',
            'data': updated_test
        })

    except Exception as e:
        logger.error(f"Erreur mise à jour test: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@technical_test_bp.route('/api/technical-tests/<test_id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
def delete_technical_test(test_id):
    """Supprime un test technique."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        # Vérifier l'existence du test
        test_ref = db.collection('technical_tests').document(test_id)
        test_doc = test_ref.get()

        if not test_doc.exists:
            return jsonify({'success': False, 'error': 'Test non trouvé'}), 404

        test_data = test_doc.to_dict()

        # Vérifier les permissions
        if session['uid'] != test_data.get('company_id') and session.get('account_type') != 'admin':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Vérifier si le test a des candidatures
        # (optionnel: empêcher la suppression s'il y a des candidatures)

        # Supprimer le test
        test_ref.delete()

        return jsonify({
            'success': True,
            'message': 'Test supprimé avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur suppression test: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@technical_test_bp.route('/api/technical-tests/<test_id>/submit', methods=['POST'])
@cross_origin(supports_credentials=True)
def submit_technical_test(test_id):
    """Soumet une réponse à un test technique."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()
        answers = data.get('answers', [])

        # Récupérer le test
        test_ref = db.collection('technical_tests').document(test_id)
        test_doc = test_ref.get()

        if not test_doc.exists:
            return jsonify({'success': False, 'error': 'Test non trouvé'}), 404

        test_data = test_doc.to_dict()

        # Vérifier si le test est actif
        if test_data.get('status') != 'active':
            return jsonify({'success': False, 'error': 'Ce test n\'est plus actif'}), 400

        # Vérifier si l'utilisateur peut repasser le test
        user_id = session['uid']
        attempts_query = db.collection('test_attempts') \
            .where('test_id', '==', test_id) \
            .where('candidate_id', '==', user_id) \
            .stream()

        attempts = list(attempts_query)

        if attempts and not test_data.get('allow_retake', False):
            return jsonify({'success': False, 'error': 'Vous avez déjà passé ce test'}), 400

        # Évaluer les réponses
        total_score = 0
        max_score = test_data.get('total_points', 0)
        results = []

        for question in test_data.get('questions', []):
            user_answer = next(
                (a for a in answers if a.get('question_id') == question.get('id')),
                None
            )

            question_result = evaluate_question(question, user_answer)
            results.append(question_result)

            if question_result.get('is_correct', False):
                total_score += question.get('points', 1)

        # Calculer le pourcentage
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        passed = percentage >= test_data.get('passing_score', 70)

        # Enregistrer la tentative
        attempt_doc = {
            'test_id': test_id,
            'job_id': test_data.get('job_id'),
            'candidate_id': user_id,
            'candidate_name': session.get('name', ''),
            'candidate_email': session.get('email', ''),
            'score': total_score,
            'max_score': max_score,
            'percentage': percentage,
            'passed': passed,
            'results': results,
            'submitted_at': datetime.now(),
            'duration': data.get('duration', 0)  # temps passé en minutes
        }

        attempt_ref = db.collection('test_attempts').document()
        attempt_ref.set(attempt_doc)

        # Mettre à jour les statistiques du test
        test_ref.update({
            'candidate_count': test_data.get('candidate_count', 0) + 1,
            'average_score': calculate_new_average(
                test_data.get('average_score', 0),
                test_data.get('candidate_count', 0),
                percentage
            )
        })

        return jsonify({
            'success': True,
            'data': {
                'score': total_score,
                'max_score': max_score,
                'percentage': percentage,
                'passed': passed,
                'results': results,
                'show_results': test_data.get('show_results', True)
            }
        })

    except Exception as e:
        logger.error(f"Erreur soumission test: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


def evaluate_question(question, user_answer):
    """Évalue une réponse à une question."""
    result = {
        'question_id': question.get('id'),
        'question_type': question.get('type'),
        'points': question.get('points', 1),
        'user_answer': user_answer,
        'is_correct': False,
        'score_obtained': 0
    }

    # S'assurer que les points sont un nombre
    try:
        result['points'] = int(float(result['points']))
    except (ValueError, TypeError):
        result['points'] = 1

    if not user_answer:
        return result

    question_type = question.get('type')

    if question_type == 'mcq':
        # Pour les QCM
        correct_options = [opt['id'] for opt in question.get('options', []) if opt.get('is_correct', False)]
        user_selected = user_answer.get('selected_options', [])

        if question.get('multiple_correct', False):
            # Plusieurs réponses possibles
            # Score partiel possible
            correct_count = len(correct_options)
            user_correct = len([opt for opt in user_selected if opt in correct_options])

            if correct_count > 0:
                score_ratio = user_correct / correct_count
                result['is_correct'] = user_correct == correct_count and len(user_selected) == correct_count
                result['score_obtained'] = result['points'] * score_ratio
        else:
            # Une seule réponse possible
            result['is_correct'] = (
                    len(user_selected) == 1 and
                    user_selected[0] in correct_options
            )
            result['score_obtained'] = result['points'] if result['is_correct'] else 0

    elif question_type == 'true_false':
        # Pour Vrai/Faux
        correct_answer = question.get('correct_answer', True)
        user_response = user_answer.get('answer')

        result['is_correct'] = user_response == correct_answer
        result['score_obtained'] = result['points'] if result['is_correct'] else 0

    elif question_type == 'open_ended':
        # Pour les réponses ouvertes
        user_text = user_answer.get('answer', '').lower()
        expected_keywords = question.get('expected_keywords', [])

        if expected_keywords:
            # Vérifier la présence des mots-clés
            found_keywords = sum(1 for keyword in expected_keywords if keyword.lower() in user_text)
            keyword_ratio = found_keywords / len(expected_keywords) if expected_keywords else 0

            # Score basé sur les mots-clés trouvés
            result['score_obtained'] = result['points'] * keyword_ratio
            result['is_correct'] = keyword_ratio >= 0.7  # 70% des mots-clés trouvés
        else:
            # Pas de critères d'évaluation automatique
            result['score_obtained'] = 0
            result['is_correct'] = False
            result['needs_review'] = True

    elif question_type == 'coding':
        # Pour les exercices de code
        user_code = user_answer.get('code', '')
        expected_output = question.get('expected_output', '')

        # Ici, vous pourriez intégrer un évaluateur de code
        # Pour l'instant, on marque comme nécessitant une revue manuelle
        result['score_obtained'] = 0
        result['is_correct'] = False
        result['needs_review'] = True
        result['user_code'] = user_code

    return result


def calculate_new_average(current_avg, current_count, new_score):
    """Calcule une nouvelle moyenne."""
    if current_count == 0:
        return new_score

    total = current_avg * current_count + new_score
    return total / (current_count + 1)


@technical_test_bp.route('/api/jobs/<job_id>/details', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_job_details(job_id):
    """Récupère les détails d'une offre d'emploi."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        job_ref = db.collection('jobs').document(job_id)
        job_doc = job_ref.get()

        if not job_doc.exists:
            return jsonify({'success': False, 'error': 'Offre non trouvée'}), 404

        job_data = job_doc.to_dict()
        job_data['job_id'] = job_id

        # Convertir les dates
        if hasattr(job_data.get('created_at'), 'isoformat'):
            job_data['created_at'] = job_data['created_at'].isoformat()

        return jsonify({
            'success': True,
            'data': job_data
        })

    except Exception as e:
        logger.error(f"Erreur récupération détails job: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@technical_test_bp.route('/api/technical-tests/<test_id>/attempts', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_test_attempts(test_id):
    """Récupère les tentatives pour un test technique."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        # Vérifier que l'utilisateur est le propriétaire du test
        test_ref = db.collection('technical_tests').document(test_id)
        test_doc = test_ref.get()

        if not test_doc.exists:
            return jsonify({'success': False, 'error': 'Test non trouvé'}), 404

        test_data = test_doc.to_dict()

        if session['uid'] != test_data.get('company_id') and session.get('account_type') != 'admin':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Récupérer les tentatives
        attempts_query = db.collection('test_attempts') \
            .where('test_id', '==', test_id) \
            .order_by('submitted_at', direction='DESCENDING') \
            .stream()

        attempts = []
        for doc in attempts_query:
            attempt_data = doc.to_dict()
            attempt_data['id'] = doc.id

            # Formater la date
            if hasattr(attempt_data.get('submitted_at'), 'isoformat'):
                attempt_data['submitted_at'] = attempt_data['submitted_at'].isoformat()

            attempts.append(attempt_data)

        return jsonify({
            'success': True,
            'data': {
                'test': test_data,
                'attempts': attempts,
                'count': len(attempts)
            }
        })

    except Exception as e:
        logger.error(f"Erreur récupération tentatives: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@technical_test_bp.route('/api/company/technical-tests', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_company_technical_tests():
    """Récupère tous les tests techniques de l'entreprise connectée."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    try:
        # Récupérer tous les tests de l'entreprise
        tests_query = db.collection('technical_tests') \
            .where('company_id', '==', session['uid']) \
            .order_by('created_at', direction='DESCENDING') \
            .stream()

        tests = []
        for doc in tests_query:
            test_data = doc.to_dict()
            test_data['id'] = doc.id

            # Récupérer les informations du job associé
            if test_data.get('job_id'):
                try:
                    job_ref = db.collection('jobs').document(test_data['job_id'])
                    job = job_ref.get()
                    if job.exists:
                        job_data = job.to_dict()
                        test_data['job_title'] = job_data.get('title', '')
                        test_data['job_status'] = job_data.get('status', '')
                    else:
                        test_data['job_title'] = 'Offre supprimée'
                        test_data['job_status'] = 'deleted'
                except Exception as job_error:
                    logger.warning(f"Erreur récupération job {test_data['job_id']}: {job_error}")
                    test_data['job_title'] = 'Erreur chargement'
                    test_data['job_status'] = 'error'

            tests.append(test_data)

        return jsonify({
            'success': True,
            'data': tests,
            'count': len(tests)
        })

    except Exception as e:
        logger.error(f"Erreur récupération tests entreprise: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@technical_test_bp.route('/api/technical-tests/<test_id>/evaluate-ai', methods=['POST'])
@cross_origin(supports_credentials=True)
def evaluate_test_with_ai(test_id):
    """Évalue un test technique avec l'IA."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        data = request.get_json()
        attempt_id = data.get('attempt_id')

        if not attempt_id:
            return jsonify({'success': False, 'error': 'ID de tentative requis'}), 400

        # Récupérer la tentative
        attempt_ref = db.collection('test_attempts').document(attempt_id)
        attempt_doc = attempt_ref.get()

        if not attempt_doc.exists:
            return jsonify({'success': False, 'error': 'Tentative non trouvée'}), 404

        attempt_data = attempt_doc.to_dict()

        # Récupérer le test
        test_ref = db.collection('technical_tests').document(test_id)
        test_doc = test_ref.get()

        if not test_doc.exists:
            return jsonify({'success': False, 'error': 'Test non trouvé'}), 404

        test_data = test_doc.to_dict()

        # Vérifier les permissions
        if session['uid'] != test_data.get('company_id') and session.get('account_type') != 'admin':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Évaluer avec l'IA
        evaluation_results = evaluate_with_ai(test_data, attempt_data)

        # Mettre à jour la tentative
        attempt_ref.update({
            'ai_evaluation': evaluation_results,
            'ai_score': evaluation_results.get('total_score'),
            'ai_percentage': evaluation_results.get('percentage'),
            'ai_passed': evaluation_results.get('passed'),
            'evaluated_at': datetime.now(),
            'status': 'evaluated'
        })

        return jsonify({
            'success': True,
            'data': evaluation_results
        })

    except Exception as e:
        logger.error(f"Erreur évaluation IA: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


def evaluate_with_ai(test_data, attempt_data):
    """Évalue un test avec l'IA."""
    from ..ai.copilote import call_ia

    evaluation = {
        'total_score': 0,
        'max_score': test_data.get('total_points', 0),
        'question_evaluations': [],
        'feedback': '',
        'strengths': [],
        'weaknesses': [],
        'suggestions': []
    }

    questions = test_data.get('questions', [])
    answers = attempt_data.get('results', [])

    for question in questions:
        question_eval = {
            'question_id': question.get('id'),
            'question_text': question.get('question'),
            'question_type': question.get('type'),
            'points': question.get('points', 1),
            'ai_score': 0,
            'ai_feedback': ''
        }

        # Trouver la réponse du candidat
        user_answer = next(
            (a for a in answers if a.get('question_id') == question.get('id')),
            None
        )

        if user_answer:
            # Évaluer selon le type de question
            if question['type'] == 'mcq':
                question_eval = evaluate_mcq_with_ai(question, user_answer)
            elif question['type'] == 'open_ended':
                question_eval = evaluate_open_ended_with_ai(question, user_answer)
            elif question['type'] == 'coding':
                question_eval = evaluate_coding_with_ai(question, user_answer)
            elif question['type'] == 'true_false':
                question_eval = evaluate_true_false_with_ai(question, user_answer)

        evaluation['question_evaluations'].append(question_eval)
        evaluation['total_score'] += question_eval.get('ai_score', 0)

    # Calculer le pourcentage
    if evaluation['max_score'] > 0:
        evaluation['percentage'] = (evaluation['total_score'] / evaluation['max_score']) * 100
        evaluation['passed'] = evaluation['percentage'] >= test_data.get('passing_score', 70)
    else:
        evaluation['percentage'] = 0
        evaluation['passed'] = False

    # Générer un feedback global avec l'IA
    evaluation.update(generate_overall_feedback(evaluation, test_data))

    return evaluation


def evaluate_open_ended_with_ai(question, user_answer):
    """Évalue une question ouverte avec l'IA."""
    from ..ai.copilote import call_ia

    prompt = f"""
    Évalue la réponse suivante à une question d'entretien technique.

    Question: {question.get('question')}

    Réponse du candidat: {user_answer.get('answer', '')}

    Points maximum: {question.get('points', 1)}

    Critères d'évaluation:
    1. Pertinence par rapport à la question
    2. Profondeur technique
    3. Clarté de l'explication
    4. Exemples concrets (si applicable)

    Donne une note sur {question.get('points', 1)} points et un feedback détaillé.

    Format de réponse JSON:
    {{
        "score": <nombre entre 0 et points_max>,
        "feedback": "<feedback détaillé>",
        "strengths": ["<point fort 1>", "<point fort 2>"],
        "improvements": ["<amélioration 1>", "<amélioration 2>"]
    }}
    """

    try:
        ai_response = call_ia(prompt)
        # Parse la réponse JSON
        import json
        evaluation = json.loads(ai_response)

        return {
            'question_id': question.get('id'),
            'question_text': question.get('question'),
            'question_type': 'open_ended',
            'points': question.get('points', 1),
            'ai_score': evaluation.get('score', 0),
            'ai_feedback': evaluation.get('feedback', ''),
            'strengths': evaluation.get('strengths', []),
            'improvements': evaluation.get('improvements', [])
        }
    except Exception as e:
        logger.error(f"Erreur évaluation IA question ouverte: {e}")
        return {
            'question_id': question.get('id'),
            'question_text': question.get('question'),
            'question_type': 'open_ended',
            'points': question.get('points', 1),
            'ai_score': 0,
            'ai_feedback': 'Erreur lors de l\'évaluation automatique',
            'strengths': [],
            'improvements': ['Réponse non évaluée automatiquement']
        }


def evaluate_coding_with_ai(question, user_answer):
    """Évalue un exercice de code avec l'IA."""
    from ..ai.copilote import call_ia

    prompt = f"""
    Évalue le code suivant pour un exercice de programmation.

    Exercice: {question.get('question')}

    Code du candidat:
    ```{question.get('language', 'python')}
    {user_answer.get('code', '')}
    ```

    Sortie attendue: {question.get('expected_output', 'Non spécifié')}

    Points maximum: {question.get('points', 2)}

    Critères d'évaluation:
    1. Correction (le code fonctionne-t-il?)
    2. Lisibilité et style de code
    3. Efficacité algorithmique
    4. Gestion des cas limites
    5. Conformité aux bonnes pratiques

    Donne une note sur {question.get('points', 2)} points et un feedback technique.

    Format de réponse JSON:
    {{
        "score": <nombre entre 0 et points_max>,
        "feedback": "<feedback technique>",
        "correctness": <booléen>,
        "efficiency": "<commentaire sur l'efficacité>",
        "best_practices": ["<bonne pratique 1>", "<bonne pratique 2>"],
        "issues": ["<problème 1>", "<problème 2>"]
    }}
    """

    try:
        ai_response = call_ia(prompt)
        import json
        evaluation = json.loads(ai_response)

        return {
            'question_id': question.get('id'),
            'question_text': question.get('question'),
            'question_type': 'coding',
            'points': question.get('points', 2),
            'ai_score': evaluation.get('score', 0),
            'ai_feedback': evaluation.get('feedback', ''),
            'correctness': evaluation.get('correctness', False),
            'efficiency': evaluation.get('efficiency', ''),
            'best_practices': evaluation.get('best_practices', []),
            'issues': evaluation.get('issues', [])
        }
    except Exception as e:
        logger.error(f"Erreur évaluation IA code: {e}")
        return {
            'question_id': question.get('id'),
            'question_text': question.get('question'),
            'question_type': 'coding',
            'points': question.get('points', 2),
            'ai_score': 0,
            'ai_feedback': 'Erreur lors de l\'évaluation automatique',
            'correctness': False,
            'efficiency': '',
            'best_practices': [],
            'issues': ['Code non évalué automatiquement']
        }


def evaluate_mcq_with_ai(question, user_answer):
    """Évalue un QCM (déjà fait automatiquement)."""
    # Pour les QCM, l'évaluation est déjà automatique
    is_correct = user_answer.get('is_correct', False)
    score = question.get('points', 1) if is_correct else 0

    return {
        'question_id': question.get('id'),
        'question_text': question.get('question'),
        'question_type': 'mcq',
        'points': question.get('points', 1),
        'ai_score': score,
        'ai_feedback': 'Réponse correcte' if is_correct else 'Réponse incorrecte',
        'user_selected': user_answer.get('selected_options', []),
        'correct_options': [opt['id'] for opt in question.get('options', []) if opt.get('is_correct', False)]
    }


def evaluate_true_false_with_ai(question, user_answer):
    """Évalue une question Vrai/Faux."""
    correct_answer = question.get('correct_answer', True)
    user_response = user_answer.get('answer')
    is_correct = user_response == correct_answer
    score = question.get('points', 1) if is_correct else 0

    return {
        'question_id': question.get('id'),
        'question_text': question.get('question'),
        'question_type': 'true_false',
        'points': question.get('points', 1),
        'ai_score': score,
        'ai_feedback': f'Réponse: {user_response} | Correct: {correct_answer}',
        'is_correct': is_correct
    }


def generate_overall_feedback(evaluation, test_data):
    """Génère un feedback global avec l'IA."""
    from ..ai.copilote import call_ia

    prompt = f"""
    Génère un rapport d'évaluation pour un test technique.

    Score obtenu: {evaluation.get('total_score', 0)}/{evaluation.get('max_score', 0)} ({evaluation.get('percentage', 0):.1f}%)
    Score de passage: {test_data.get('passing_score', 70)}%
    Résultat: {'Réussi' if evaluation.get('passed', False) else 'Échoué'}

    Résumé des évaluations par question:
    {json.dumps(evaluation.get('question_evaluations', []), ensure_ascii=False, indent=2)}

    Génère un rapport professionnel avec:
    1. Un résumé général de la performance
    2. Les points forts du candidat
    3. Les points à améliorer
    4. Des suggestions de formation
    5. Une recommandation globale

    Format de réponse JSON:
    {{
        "overall_feedback": "<résumé général>",
        "strengths": ["<point fort 1>", "<point fort 2>", ...],
        "weaknesses": ["<point faible 1>", "<point faible 2>", ...],
        "training_suggestions": ["<suggestion 1>", "<suggestion 2>", ...],
        "recommendation": "<recommandation finale>"
    }}
    """

    try:
        ai_response = call_ia(prompt)
        import json
        return json.loads(ai_response)
    except Exception as e:
        logger.error(f"Erreur génération feedback global: {e}")
        return {
            'overall_feedback': 'Évaluation complétée',
            'strengths': [],
            'weaknesses': [],
            'training_suggestions': [],
            'recommendation': 'Consulter les résultats détaillés'
        }


@technical_test_bp.route('/api/technical-tests/<test_id>/attempts/<attempt_id>/grade', methods=['POST'])
@cross_origin(supports_credentials=True)
def manually_grade_attempt(test_id, attempt_id):
    """Note manuellement une tentative de test."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    try:
        data = request.get_json()
        grades = data.get('grades', {})
        feedback = data.get('feedback', '')

        # Récupérer la tentative
        attempt_ref = db.collection('test_attempts').document(attempt_id)
        attempt_doc = attempt_ref.get()

        if not attempt_doc.exists:
            return jsonify({'success': False, 'error': 'Tentative non trouvée'}), 404

        attempt_data = attempt_doc.to_dict()

        # Vérifier que le test appartient à l'entreprise
        test_ref = db.collection('technical_tests').document(test_id)
        test_doc = test_ref.get()

        if not test_doc.exists:
            return jsonify({'success': False, 'error': 'Test non trouvé'}), 404

        test_data = test_doc.to_dict()

        if session['uid'] != test_data.get('company_id'):
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Calculer le score total
        total_score = 0
        max_score = test_data.get('total_points', 0)

        for question in test_data.get('questions', []):
            question_id = question.get('id')
            if str(question_id) in grades:
                score = float(grades[str(question_id)])
                total_score += min(score, question.get('points', 1))

        # Calculer le pourcentage
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        passed = percentage >= test_data.get('passing_score', 70)

        # Mettre à jour la tentative
        update_data = {
            'manual_score': total_score,
            'manual_percentage': percentage,
            'manual_passed': passed,
            'manual_feedback': feedback,
            'manually_graded_by': session['uid'],
            'manually_graded_at': datetime.now(),
            'status': 'manually_graded',
            'grades': grades
        }

        attempt_ref.update(update_data)

        return jsonify({
            'success': True,
            'message': 'Test noté avec succès',
            'data': {
                'score': total_score,
                'max_score': max_score,
                'percentage': percentage,
                'passed': passed
            }
        })

    except Exception as e:
        logger.error(f"Erreur notation manuelle: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500



@technical_test_bp.route('/api/jobs/<job_id>/available-tests', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_available_tests_for_job(job_id):
    """Récupère les tests techniques disponibles pour une offre d'emploi."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    try:
        # Récupérer l'offre d'emploi
        job_ref = db.collection('jobs').document(job_id)
        job = job_ref.get()

        if not job.exists:
            return jsonify({'success': False, 'error': 'Offre non trouvée'}), 404

        # Récupérer les tests actifs pour cette offre
        tests_query = db.collection('technical_tests') \
            .where('job_id', '==', job_id) \
            .where('status', '==', 'active') \
            .order_by('created_at', direction='DESCENDING') \
            .stream()

        tests = []
        for doc in tests_query:
            test_data = doc.to_dict()
            test_data['id'] = doc.id
            tests.append(test_data)

        return jsonify({
            'success': True,
            'data': tests,
            'count': len(tests)
        })

    except Exception as e:
        logger.error(f"Erreur récupération tests disponibles: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500