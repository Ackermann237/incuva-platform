# backend/app/ai/TestAI.py
import requests
import json
import re
from flask import current_app
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)


class TestAI:
    """Classe pour gérer la génération de tests basés sur les offres d'emploi pour tous domaines."""

    def __init__(self, db=None):
        self.db = db
        self.domain_keywords = self._load_domain_keywords()

    def _load_domain_keywords(self) -> Dict[str, List[str]]:
        """Charge les mots-clés pour identifier les domaines professionnels."""
        return {
            # Informatique et technologie
            'informatique': [
                'développeur', 'programmeur', 'ingénieur logiciel', 'devops', 'data scientist',
                'analyste', 'architecte', 'admin système', 'réseau', 'cybersécurité',
                'frontend', 'backend', 'fullstack', 'mobile', 'web', 'cloud', 'ai', 'ml'
            ],
            # Marketing et communication
            'marketing': [
                'marketing', 'communication', 'publicité', 'brand', 'marque', 'social media',
                'seo', 'sem', 'content', 'stratégie marketing', 'digital', 'e-commerce',
                'growth', 'acquisition', 'retention', 'analytics', 'kpi', 'roi'
            ],
            # Ventes
            'ventes': [
                'commercial', 'vente', 'business development', 'account manager', 'sales',
                'chiffre d\'affaires', 'prospection', 'négociation', 'client', 'partenariat'
            ],
            # Santé et médecine
            'santé': [
                'médecin', 'infirmier', 'pharmacien', 'kinésithérapeute', 'psychologue',
                'dentiste', 'vétérinaire', 'radiologue', 'anesthésiste', 'chirurgien',
                'santé publique', 'laboratoire', 'biologie', 'médical', 'paramédical'
            ],
            # Sciences et recherche
            'science': [
                'chercheur', 'scientifique', 'physicien', 'chimiste', 'biologiste',
                'géologue', 'astronome', 'mathématicien', 'statisticien', 'laboratoire',
                'recherche', 'innovation', 'développement', 'r&d'
            ],
            # Ingénierie et construction
            'ingénierie': [
                'ingénieur', 'génie civil', 'mécanique', 'électrique', 'automobile',
                'aéronautique', 'construction', 'bâtiment', 'architecture', 'design industriel',
                'qualité', 'production', 'maintenance', 'technicien'
            ],
            # Finance et comptabilité
            'finance': [
                'comptable', 'auditeur', 'analyste financier', 'contrôleur de gestion',
                'trésorier', 'risk manager', 'banquier', 'assureur', 'fiscaliste',
                'finance', 'comptabilité', 'audit', 'budget', 'investissement'
            ],
            # Ressources humaines
            'rh': [
                'ressources humaines', 'recruteur', 'hr', 'talent acquisition', 'formation',
                'développement des compétences', 'paie', 'relations sociales', 'rh business partner',
                'recrutement', 'onboarding', 'carrière', 'performance'
            ],
            # Juridique
            'juridique': [
                'avocat', 'juriste', 'notaire', 'huissier', 'droit', 'légal', 'conformité',
                'règlementation', 'contrat', 'litige', 'propriété intellectuelle'
            ],
            # Éducation
            'éducation': [
                'enseignant', 'professeur', 'formateur', 'éducateur', 'pédagogue',
                'conseiller pédagogique', 'directeur d\'école', 'éducation nationale'
            ],
            # Art et design
            'art': [
                'designer', 'graphiste', 'illustrateur', 'photographe', 'vidéaste',
                'motion designer', 'ui/ux', 'créatif', 'artistique', 'direction artistique'
            ]
        }

    def analyze_job_details(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyse les détails d'une offre d'emploi pour extraire les informations clés.

        Args:
            job_data: Les données de l'offre d'emploi

        Returns:
            Dict contenant les informations analysées
        """
        try:
            analysis = {
                'job_title': job_data.get('title', ''),
                'primary_domain': 'général',
                'sub_domains': [],
                'experience_level': 'intermediate',
                'required_skills': [],
                'key_responsibilities': [],
                'job_type': 'permanent',
                'industry_specific_terms': []
            }

            # Extraire le titre
            title = job_data.get('title', '').lower()
            analysis['job_title'] = job_data.get('title', '')

            # Identifier le domaine principal
            analysis['primary_domain'] = self._identify_domain(title, job_data)

            # CORRECTION : Ajouter job_data comme deuxième argument
            analysis['experience_level'] = self._determine_experience_level(title, job_data)

            # Extraire les compétences requises
            required_skills = job_data.get('required_skills', [])
            if required_skills:
                analysis['required_skills'] = required_skills

            # Analyser la description pour les termes spécifiques
            description = job_data.get('description', '').lower()
            analysis['industry_specific_terms'] = self._extract_industry_terms(
                description, analysis['primary_domain']
            )

            # Analyser les missions
            missions = job_data.get('missions', [])
            if missions:
                analysis['key_responsibilities'] = missions

                # Identifier les sous-domaines
                for mission in missions:
                    sub_domain = self._identify_sub_domain(mission, analysis['primary_domain'])
                    if sub_domain and sub_domain not in analysis['sub_domains']:
                        analysis['sub_domains'].append(sub_domain)

            # Analyser le type de contrat
            contract_type = job_data.get('contract_type', '').lower()
            if any(word in contract_type for word in ['cdi', 'permanent', 'indéterminé']):
                analysis['job_type'] = 'permanent'
            elif any(word in contract_type for word in ['cdd', 'temporaire', 'contractuel']):
                analysis['job_type'] = 'temporary'
            elif any(word in contract_type for word in ['stage', 'internship', 'apprentissage']):
                analysis['job_type'] = 'internship'
            elif any(word in contract_type for word in ['freelance', 'consultant', 'indépendant']):
                analysis['job_type'] = 'freelance'

            # Nettoyer les listes
            analysis['sub_domains'] = list(set(analysis['sub_domains']))
            analysis['required_skills'] = list(set(analysis['required_skills']))
            analysis['industry_specific_terms'] = list(set(analysis['industry_specific_terms']))

            return analysis

        except Exception as e:
            logger.error(f"Erreur lors de l'analyse de l'offre d'emploi: {e}")
            return {}

    def _identify_domain(self, title: str, job_data: Dict[str, Any]) -> str:
        """Identifie le domaine professionnel de l'offre."""
        title_lower = title.lower()
        description = job_data.get('description', '').lower()

        # Vérifier chaque domaine
        for domain, keywords in self.domain_keywords.items():
            for keyword in keywords:
                if keyword in title_lower or keyword in description:
                    return domain

        # Si aucun domaine spécifique n'est identifié
        return 'général'

    def _determine_experience_level(self, title: str, job_data: Dict[str, Any]) -> str:
        """Détermine le niveau d'expérience requis avec plus de précision."""
        title_lower = title.lower()
        description = job_data.get('description', '').lower()
        required_experience = job_data.get('required_experience', '')

        # Mots-clés par niveau
        junior_keywords = [
            'junior', 'débutant', 'entry level', 'starter', 'stagiaire', 'apprenti',
            'alternant', '0-1 ans', '1 an', 'première expérience', 'formation',
            'reconversion', 'no experience required'
        ]

        intermediate_keywords = [
            'intermédiaire', '2-5 ans', '3 ans', '4 ans', 'confirmé',
            'expérimenté', 'mid-level', 'senior débutant'
        ]

        senior_keywords = [
            'senior', 'lead', 'principal', 'chef', 'head', 'directeur', 'manager',
            '5+ ans', '7 ans', '10 ans', 'expert', 'specialist', 'architect',
            'master', 'guru', 'responsable', 'coordinateur', 'superviseur'
        ]

        expert_keywords = [
            'expert', 'specialist', 'architect', 'consultant senior',
            'director', 'vp', 'vice president', 'c-level', 'cto', 'cpo',
            '10+ ans', '15 ans', '20 ans', 'thought leader', 'guru'
        ]

        # Vérifier dans l'ordre décroissant
        all_text = f"{title_lower} {description} {required_experience}".lower()

        for keyword in expert_keywords:
            if keyword in all_text:
                return 'expert'

        for keyword in senior_keywords:
            if keyword in all_text:
                return 'senior'

        for keyword in intermediate_keywords:
            if keyword in all_text:
                return 'intermediate'

        for keyword in junior_keywords:
            if keyword in all_text:
                return 'junior'

        # Par défaut
        return 'intermediate'

    def _get_mcq_guidance(self, level: str) -> str:
        """Retourne des conseils pour les QCM selon le niveau."""
        guidance = {
            'junior': 'Questions sur définitions, concepts de base, syntaxe élémentaire',
            'intermediate': 'Questions sur application des concepts, patterns courants, best practices',
            'senior': 'Questions sur architecture, optimisation, trade-offs, décisions techniques',
            'expert': 'Questions sur recherche, innovation, tendances émergentes, vision stratégique'
        }
        return guidance.get(level, guidance['intermediate'])

    def _get_practical_guidance(self, level: str) -> str:
        """Retourne des conseils pour les exercices pratiques."""
        guidance = {
            'junior': 'Exercices simples, bien définis, avec contexte détaillé',
            'intermediate': 'Problèmes réels nécessitant analyse et conception',
            'senior': 'Systèmes complexes avec contraintes multiples et optimisation',
            'expert': 'Problèmes de recherche ou transformationnels avec innovation requise'
        }
        return guidance.get(level, guidance['intermediate'])

    def _get_open_ended_guidance(self, level: str) -> str:
        """Retourne des conseils pour les questions ouvertes."""
        guidance = {
            'junior': 'Questions sur compréhension et explication des concepts',
            'intermediate': 'Questions sur expérience pratique et résolution de problèmes',
            'senior': 'Questions sur leadership, mentorat et prise de décision stratégique',
            'expert': 'Questions sur vision, innovation et impact à long terme'
        }
        return guidance.get(level, guidance['intermediate'])


    def _extract_industry_terms(self, description: str, domain: str) -> List[str]:
        """Extrait les termes spécifiques à l'industrie."""
        # Liste de termes communs par domaine
        domain_terms = {
            'informatique': [
                'algorithm', 'framework', 'api', 'database', 'server', 'cloud',
                'devops', 'agile', 'scrum', 'git', 'docker', 'kubernetes',
                'ci/cd', 'testing', 'debugging', 'optimization'
            ],
            'marketing': [
                'campaign', 'conversion', 'engagement', 'audience', 'segment',
                'branding', 'positioning', 'market research', 'competitor analysis',
                'content strategy', 'social media', 'influencer', 'viral'
            ],
            'santé': [
                'diagnostic', 'treatment', 'patient care', 'clinical', 'protocol',
                'hygiene', 'sanitation', 'epidemiology', 'pharmacology', 'anatomy',
                'physiology', 'pathology', 'therapy', 'rehabilitation'
            ],
            'science': [
                'hypothesis', 'experiment', 'methodology', 'data analysis',
                'publication', 'peer review', 'laboratory', 'sample', 'control',
                'variable', 'theory', 'model', 'simulation', 'observation'
            ],
            'finance': [
                'balance sheet', 'income statement', 'cash flow', 'audit',
                'compliance', 'risk assessment', 'portfolio', 'investment',
                'valuation', 'forecast', 'budget', 'financial modeling'
            ]
        }

        # Extraire les termes du domaine spécifique
        terms = []
        if domain in domain_terms:
            for term in domain_terms[domain]:
                if term in description:
                    terms.append(term)

        return terms[:10]  # Limiter à 10 termes

    def _identify_sub_domain(self, mission: str, primary_domain: str) -> Optional[str]:
        """Identifie le sous-domaine basé sur la mission."""
        mission_lower = mission.lower()

        sub_domain_map = {
            'informatique': {
                'frontend': ['interface', 'ui', 'ux', 'react', 'angular', 'vue', 'javascript'],
                'backend': ['server', 'api', 'database', 'node', 'python', 'java', 'php'],
                'devops': ['deployment', 'infrastructure', 'cloud', 'docker', 'kubernetes'],
                'data': ['data', 'analytics', 'machine learning', 'ai', 'database'],
                'mobile': ['mobile', 'android', 'ios', 'flutter', 'react native']
            },
            'marketing': {
                'digital': ['digital', 'online', 'web', 'social media', 'seo'],
                'content': ['content', 'copywriting', 'blog', 'article', 'storytelling'],
                'brand': ['brand', 'identity', 'positioning', 'awareness'],
                'analytics': ['analytics', 'data', 'metrics', 'kpi', 'roi'],
                'strategy': ['strategy', 'planning', 'campaign', 'budget']
            },
            'santé': {
                'clinical': ['patient', 'treatment', 'diagnosis', 'examination'],
                'research': ['research', 'study', 'trial', 'publication'],
                'management': ['management', 'administration', 'coordination'],
                'preventive': ['prevention', 'education', 'awareness', 'screening']
            }
        }

        if primary_domain in sub_domain_map:
            for sub_domain, keywords in sub_domain_map[primary_domain].items():
                for keyword in keywords:
                    if keyword in mission_lower:
                        return sub_domain

        return None

    def generate_test_from_job(self, job_data: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Génère un test basé sur l'analyse de l'offre d'emploi.

        Args:
            job_data: Les données de l'offre d'emploi
            config: Configuration pour la génération du test

        Returns:
            Dict contenant le test généré
        """
        try:
            # Analyser l'offre d'emploi
            job_analysis = self.analyze_job_details(job_data)

            # Construire le prompt basé sur l'analyse
            prompt = self._build_test_generation_prompt(job_analysis, config, job_data)

            # Appeler l'IA pour générer le test
            ai_response = self._call_test_ai(prompt, job_analysis['primary_domain'])

            # Parser et valider la réponse
            test_data = self._parse_ai_test_response(ai_response, job_analysis, config)

            # Compléter avec les métadonnées
            test_data = self._enrich_test_data(test_data, job_data, config, job_analysis)

            return test_data

        except Exception as e:
            logger.error(f"Erreur lors de la génération du test: {e}")
            # Retourner un test par défaut en cas d'erreur
            return self._create_default_test(job_data, config)

    def _build_test_generation_prompt(self, job_analysis: Dict[str, Any],
                                      config: Dict[str, Any],
                                      job_data: Dict[str, Any]) -> str:
        """
        Construit un prompt détaillé pour la génération de test adapté au domaine.
        """
        # Configuration du test
        difficulty = config.get('difficulty', 'medium')
        question_types = config.get('question_types', ['mcq', 'open_ended'])
        num_questions = min(config.get('number_of_questions', 10), 30)
        include_explanations = config.get('include_explanations', True)
        custom_prompt = config.get('customPrompt', '')
        experience_level = config.get('experienceLevel', job_analysis.get('experience_level', 'intermediate'))
        test_style = config.get('testStyle', 'mixed')

        # Mapper les niveaux
        difficulty_map = {
            'easy': 'débutant (concepts fondamentaux, connaissances de base)',
            'medium': 'intermédiaire (application des connaissances, cas pratiques)',
            'hard': 'avancé (analyse complexe, prise de décision, situations critiques)'
        }

        experience_map = {
            'junior': 'junior (0-2 ans d\'expérience) - Focus sur les connaissances théoriques de base',
            'intermediate': 'intermédiaire (2-5 ans) - Focus sur l\'application pratique et la résolution de problèmes',
            'senior': 'senior (5+ ans) - Focus sur l\'expertise approfondie, le leadership et la stratégie',
            'expert': 'expert (8+ ans) - Focus sur l\'innovation, la recherche et le développement de pointe'
        }

        # Obtenir la description complète
        job_description = job_data.get('description', 'Non spécifié')

        # Construire le prompt spécifique au domaine
        prompt = f"""Tu es un expert en recrutement et évaluation professionnelle spécialisé dans tous les domaines.

# CONTEXTE DU POSTE ANALYSÉ
**Domaine professionnel:** {job_analysis.get('primary_domain', 'général').title()}
**Titre du poste:** {job_analysis.get('job_title', 'Poste non spécifié')}
**Niveau d'expérience requis:** {experience_map.get(experience_level, 'intermédiaire (2-5 ans)')}

**Description du poste:**
{job_description[:1500]}

**Compétences requises identifiées:**
{self._format_list(job_analysis.get('required_skills', []))}

**Responsabilités principales:**
{self._format_list(job_analysis.get('key_responsibilities', []))}

**Termes spécifiques au domaine:**
{self._format_list(job_analysis.get('industry_specific_terms', []))}

# CONFIGURATION DU TEST
**Niveau de difficulté:** {difficulty_map.get(difficulty, 'intermédiaire')}
**Nombre de questions:** {num_questions}
**Style du test:** {test_style}
**Types de questions:** {', '.join(question_types)}

# DIRECTIVES DE GÉNÉRATION SPÉCIFIQUES AU DOMAINE
1. Les questions doivent être SPÉCIFIQUEMENT adaptées au domaine "{job_analysis.get('primary_domain', 'général')}"
2. La difficulté doit correspondre au niveau d'expérience "{experience_level}" pour ce domaine
3. Inclure des scénarios RÉELS que le candidat pourrait rencontrer dans ce poste
4. Les questions doivent évaluer à la fois:
   - Les connaissances techniques/spécifiques du domaine
   - Les compétences pratiques d'application
   - Le jugement professionnel et l'éthique
   - Les compétences transversales (communication, résolution de problèmes)
5. Utiliser la terminologie et les concepts spécifiques au domaine

"""

        # Ajouter les directives personnalisées si fournies
        if custom_prompt:
            prompt += f"\n# INSTRUCTIONS PERSONNALISÉES\n{custom_prompt}\n"

        # Ajouter la répartition des questions adaptée au domaine
        prompt += f"\n# RÉPARTITION DES QUESTIONS ({num_questions} questions total)\n"

        # Adapter la répartition selon les types de questions demandés
        if 'mcq' in question_types:
            mcq_count = max(2, int(num_questions * 0.4))
            prompt += f"- Questions à choix multiple (QCM): {mcq_count} questions\n"
            prompt += "  - 40% connaissances théoriques et concepts fondamentaux\n"
            prompt += "  - 40% cas pratiques et application des connaissances\n"
            prompt += "  - 20% éthique professionnelle et bonnes pratiques\n"

        # Pour les domaines non-techniques, proposer "problem_solving" au lieu de "coding"
        if 'coding' in question_types and job_analysis.get('primary_domain') == 'informatique':
            coding_count = max(2, int(num_questions * 0.3))
            prompt += f"- Exercices pratiques/spécifiques au domaine: {coding_count} questions\n"
            prompt += "  - 50% résolution de problèmes spécifiques\n"
            prompt += "  - 30% analyse de situations réelles\n"
            prompt += "  - 20% prise de décision dans des contextes complexes\n"
        elif 'coding' in question_types:
            # Pour les domaines non-informatiques, transformer en "problem_solving"
            problem_count = max(2, int(num_questions * 0.3))
            prompt += f"- Exercices de résolution de problèmes: {problem_count} questions\n"
            prompt += "  - 50% analyse de cas concrets du domaine\n"
            prompt += "  - 30% prise de décision en situation réelle\n"
            prompt += "  - 20% développement de solutions innovantes\n"

        if 'open_ended' in question_types:
            open_count = max(1, int(num_questions * 0.3))
            prompt += f"- Questions à réponse ouverte: {open_count} questions\n"
            prompt += "  - 50% réflexion critique et analyse approfondie\n"
            prompt += "  - 30% communication des idées et justification\n"
            prompt += "  - 20% vision stratégique et prospective\n"

        # Instructions de format adaptées
        prompt += """
# FORMAT DE RÉPONSE ATTENDU
Tu dois répondre UNIQUEMENT avec un objet JSON valide au format suivant:

{
    "title": "Titre du test d'évaluation",
    "description": "Description détaillée adaptée au domaine et au poste",
    "duration": 60,
    "passing_score": 70,
    "questions": [
        {
            "id": "q1",
            "type": "mcq",
            "question": "Énoncé de la question adaptée au domaine spécifique",
            "points": 1,
            "difficulty": "easy|medium|hard",
            "explanation": "Explication détaillée avec références aux concepts du domaine",
            "options": [
                {"id": 1, "text": "Option 1", "is_correct": true},
                {"id": 2, "text": "Option 2", "is_correct": false},
                {"id": 3, "text": "Option 3", "is_correct": false},
                {"id": 4, "text": "Option 4", "is_correct": false}
            ],
            "multiple_correct": false,
            "domain_focus": ["Compétence 1", "Compétence 2"]  // Compétences/spécificités concernées
        },
        {
            "id": "q2",
            "type": "open_ended",
            "question": "Question ouverte sur un aspect critique du domaine",
            "points": 3,
            "difficulty": "medium",
            "explanation": "Ce qui est attendu dans la réponse",
            "max_length": 500,
            "expected_keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3"],
            "domain_focus": ["Aspect spécifique 1", "Aspect spécifique 2"]
        }
    ]
}

# IMPORTANT - ADAPTATION AU DOMAINE
1. Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire
2. ADAPTE chaque question au domaine spécifique "{job_analysis.get('primary_domain', 'général')}"
3. Pour chaque question, indique les compétences/spécificités concernées dans "domain_focus"
4. Les questions doivent être PRATIQUES, RÉALISTES et UTILES pour évaluer un candidat pour CE POSTE SPÉCIFIQUE
5. Inclure des questions sur:
   - Les connaissances fondamentales du domaine
   - Les situations courantes rencontrées dans ce poste
   - Les défis spécifiques au domaine
   - Les bonnes pratiques professionnelles
   - L'éthique et la déontologie du métier
6. Utiliser la terminologie et les concepts EXACTS du domaine

Génère maintenant le test d'évaluation JSON adapté à cette offre spécifique:
"""
        # INSTRUCTIONS SPÉCIFIQUES POUR LES QUESTIONS A CHOIX MULTIPLES
        prompt += """
            # IMPORTANT - RÈGLES POUR LES QUESTIONS À CHOIX MULTIPLE (QCM)
            1. Pour chaque question MCQ, inclure EXACTEMENT 4 options
            2. EXACTEMENT UNE SEULE OPTION DOIT ÊTRE CORRECTE (sauf si spécifié autrement)
            3. Les 3 autres options doivent être INCORRECTES mais plausibles
            4. Distribuer les bonnes réponses de manière aléatoire (25% A, 25% B, 25% C, 25% D)
            5. Éviter les patterns prévisibles
            6. Marquer clairement dans le JSON: "is_correct": true pour UNE seule option par question
            7. Pour les questions où plusieurs réponses sont possibles, utiliser "multiple_correct": true
            8. Si "multiple_correct": true, alors 2-3 options peuvent être correctes (jamais 4)

            # RÉPARTITION DES BONNES RÉPONSES POUR LES QCM À RÉPONSE UNIQUE:
            - 25% des questions: bonne réponse = option A
            - 25% des questions: bonne réponse = option B  
            - 25% des questions: bonne réponse = option C
            - 25% des questions: bonne réponse = option D

            # EXEMPLE CORRECT DE FORMAT MCQ:
            {
                "type": "mcq",
                "question": "Quel est le meilleur framework pour...",
                "options": [
                    {"id": 1, "text": "React", "is_correct": true},    // UNE SEULE correcte
                    {"id": 2, "text": "Angular", "is_correct": false}, // 3 incorrectes
                    {"id": 3, "text": "Vue", "is_correct": false},
                    {"id": 4, "text": "Svelte", "is_correct": false}
                ],
                "multiple_correct": false  // Une seule réponse correcte
            }

            # EXEMPLE POUR MCQ MULTIPLE RÉPONSES:
            {
                "type": "mcq",
                "question": "Quels sont les avantages de...",
                "options": [
                    {"id": 1, "text": "Avantage 1", "is_correct": true},   // 2-3 correctes
                    {"id": 2, "text": "Avantage 2", "is_correct": true},
                    {"id": 3, "text": "Faux avantage", "is_correct": false},
                    {"id": 4, "text": "Faux avantage", "is_correct": false}
                ],
                "multiple_correct": true  // Plusieurs réponses correctes
            }
            """



        return prompt

    def _call_test_ai(self, prompt: str, domain: str) -> str:
        """
        Appelle l'API Hugging Face pour générer le test avec un système prompt adapté.
        """
        try:
            api_key = current_app.config.get('HUGGINGFACE_API_KEY')
            if not api_key:
                raise Exception("Clé API Hugging Face non configurée")

            # Adapter le message système au domaine
            system_message = f"""Tu es un expert en recrutement et évaluation professionnelle spécialisé dans le domaine {domain}. 
Tu génères des tests d'évaluation pertinents, précis et adaptés aux spécificités de chaque métier.
Tu es capable de créer des questions techniques, pratiques et comportementales appropriées."""

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": "meta-llama/Llama-3.1-8B-Instruct:novita",
                "messages": [
                    {
                        "role": "system",
                        "content": system_message
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 4000,
                "temperature": 0.7,
                "top_p": 0.9
            }

            response = requests.post(
                "https://router.huggingface.co/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=80
            )

            if response.status_code != 200:
                logger.error(f"Erreur API Hugging Face: {response.text}")
                raise Exception(f"Erreur API Hugging Face: {response.status_code}")

            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

            if not content:
                raise Exception("Réponse vide de l'API Hugging Face")

            return content

        except requests.exceptions.Timeout:
            logger.error("Timeout lors de l'appel à l'API Hugging Face")
            raise Exception("Délai d'attente dépassé pour la génération du test")
        except Exception as e:
            logger.error(f"Erreur lors de l'appel à l'IA: {e}")
            raise

    def _parse_ai_test_response(self, ai_response: str, job_analysis: Dict[str, Any],
                                config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse et valide la réponse JSON de l'IA.
        """
        try:
            # Nettoyer la réponse
            ai_response = ai_response.strip()

            # Chercher le JSON
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1

            if start_idx == -1 or end_idx == 0:
                logger.error("Aucun JSON trouvé dans la réponse IA")
                raise ValueError("Format de réponse invalide")

            json_str = ai_response[start_idx:end_idx]
            json_str = self._clean_json_string(json_str)

            # Parser le JSON
            test_data = json.loads(json_str)

            # Valider la structure de base
            if 'questions' not in test_data or not isinstance(test_data['questions'], list):
                raise ValueError("Structure de test invalide: 'questions' manquant ou invalide")

            # Valider et compléter chaque question
            validated_questions = []
            for i, question in enumerate(test_data['questions']):
                validated_question = self._validate_question(question, i, job_analysis, config)
                validated_questions.append(validated_question)

            test_data['questions'] = validated_questions

            # S'assurer que le nombre de questions correspond à la configuration
            num_questions = config.get('number_of_questions', 10)
            test_data['questions'] = test_data['questions'][:num_questions]

            return test_data

        except json.JSONDecodeError as e:
            logger.error(f"Erreur de parsing JSON: {e}")
            logger.error(f"JSON problématique: {json_str[:200]}...")
            raise ValueError("Format JSON invalide dans la réponse IA")
        except Exception as e:
            logger.error(f"Erreur lors du parsing de la réponse IA: {e}")
            raise

    def _validate_question(self, question: Dict[str, Any], index: int,
                           job_analysis: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valide et complète une question individuelle.
        """
        validated = question.copy()

        # ID et ordre
        if 'id' not in validated:
            validated['id'] = f"q{index + 1}"
        validated['order'] = index + 1

        # Type de question
        if 'type' not in validated:
            # Déterminer le type basé sur l'index
            question_types = config.get('question_types', ['mcq', 'open_ended'])
            type_index = index % len(question_types)
            validated['type'] = question_types[type_index]

        # Points par défaut - S'ASSURER QUE C'EST UN NOMBRE
        if 'points' not in validated:
            if validated['type'] in ['coding', 'problem_solving']:
                validated['points'] = 2
            elif validated['type'] == 'open_ended':
                validated['points'] = 3
            else:
                validated['points'] = 1
        else:
            # S'assurer que les points sont un nombre
            try:
                validated['points'] = int(float(validated['points']))
            except (ValueError, TypeError):
                # Valeur par défaut si conversion échoue
                if validated['type'] in ['coding', 'problem_solving']:
                    validated['points'] = 2
                elif validated['type'] == 'open_ended':
                    validated['points'] = 3
                else:
                    validated['points'] = 1

        # Difficulté
        if 'difficulty' not in validated:
            validated['difficulty'] = config.get('difficulty', 'medium')

        # Focus sur le domaine
        if 'domain_focus' not in validated:
            # Utiliser les compétences requises de l'analyse de l'offre
            validated['domain_focus'] = job_analysis.get('required_skills', [])[:3]

        # Compléter selon le type
        if validated['type'] == 'mcq':
            if 'options' not in validated or not validated['options']:
                validated['options'] = [
                    {"id": 1, "text": "Option correcte", "is_correct": True},
                    {"id": 2, "text": "Option incorrecte", "is_correct": False},
                    {"id": 3, "text": "Option incorrecte", "is_correct": False},
                    {"id": 4, "text": "Option incorrecte", "is_correct": False}
                ]
            if 'multiple_correct' not in validated:
                validated['multiple_correct'] = False

            # S'assurer qu'au moins une option est correcte
            if not any(opt.get('is_correct', False) for opt in validated['options']):
                validated['options'][0]['is_correct'] = True

        elif validated['type'] in ['coding', 'problem_solving']:
            # Pour les questions de résolution de problème
            if 'problem_statement' not in validated:
                validated['problem_statement'] = "Décrivez votre approche pour résoudre ce problème"
            if 'expected_approach' not in validated:
                validated['expected_approach'] = "Approche méthodique et structurée"
            if 'evaluation_criteria' not in validated:
                validated['evaluation_criteria'] = [
                    "Compréhension du problème",
                    "Méthodologie de résolution",
                    "Pertinence de la solution",
                    "Clarté de l'explication"
                ]

        elif validated['type'] == 'open_ended':
            if 'max_length' not in validated:
                validated['max_length'] = 500
            if 'expected_keywords' not in validated:
                validated['expected_keywords'] = validated.get('domain_focus', [])[:5]

        # Explication si demandée
        if config.get('include_explanations', True) and 'explanation' not in validated:
            validated[
                'explanation'] = f"Explication pour la question sur {', '.join(validated.get('domain_focus', ['ce domaine']))}"

        return validated

    def _enrich_test_data(self, test_data: Dict[str, Any], job_data: Dict[str, Any],
                          config: Dict[str, Any], job_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ajoute les métadonnées au test.
        """
        enriched = test_data.copy()

        # Titre par défaut
        if 'title' not in enriched or not enriched['title']:
            enriched['title'] = f"Test d'évaluation - {job_data.get('title', 'Poste')}"

        # Description par défaut
        if 'description' not in enriched:
            job_title = job_data.get('title', 'ce poste')
            domain = job_analysis.get('primary_domain', 'professionnel').title()
            enriched['description'] = f"""Évaluation adaptée au poste de {job_title} dans le domaine {domain}.
Ce test a été généré automatiquement en fonction des exigences spécifiques du poste et évalue les compétences nécessaires pour réussir dans ce rôle."""

        # Durée par défaut
        if 'duration' not in enriched:
            num_questions = len(enriched.get('questions', []))
            enriched['duration'] = min(120, max(30, num_questions * 5))  # 5 minutes par question en moyenne

        # Score de passage par défaut
        if 'passing_score' not in enriched:
            difficulty = config.get('difficulty', 'medium')
            if difficulty == 'easy':
                enriched['passing_score'] = 60
            elif difficulty == 'hard':
                enriched['passing_score'] = 80
            else:
                enriched['passing_score'] = 70

        # Métadonnées enrichies
        enriched['job_based'] = True
        enriched['job_title'] = job_data.get('title')
        enriched['job_domain'] = job_analysis.get('primary_domain')
        enriched['generated_with_ai'] = True
        enriched['config_used'] = {
            'difficulty': config.get('difficulty'),
            'question_types': config.get('question_types'),
            'experience_level': config.get('experienceLevel'),
            'domain': job_analysis.get('primary_domain')
        }

        return enriched

    def _create_default_test(self, job_data: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crée un test par défaut en cas d'échec de l'IA.
        """
        job_title = job_data.get('title', 'Poste')
        difficulty = config.get('difficulty', 'medium')
        question_types = config.get('question_types', ['mcq', 'open_ended'])
        num_questions = min(config.get('number_of_questions', 10), 20)

        # Questions par défaut adaptées
        required_skills = job_data.get('required_skills', ['Compétences professionnelles'])

        questions = []
        for i in range(num_questions):
            question_type = question_types[i % len(question_types)]

            if question_type == 'mcq':
                questions.append({
                    "id": f"q{i + 1}",
                    "type": "mcq",
                    "question": f"Parmi ces options, laquelle représente la meilleure pratique professionnelle pour {required_skills[0] if required_skills else 'ce domaine'} ?",
                    "points": 1,
                    "difficulty": difficulty,
                    "explanation": "Cette option représente la meilleure pratique standard dans cette profession.",
                    "options": [
                        {"id": 1, "text": "Bonne pratique standard", "is_correct": True},
                        {"id": 2, "text": "Approche moins efficace", "is_correct": False},
                        {"id": 3, "text": "Mauvaise pratique", "is_correct": False},
                        {"id": 4, "text": "Approche obsolète", "is_correct": False}
                    ],
                    "multiple_correct": False,
                    "domain_focus": required_skills[:2]
                })
            elif question_type == 'open_ended':
                questions.append({
                    "id": f"q{i + 1}",
                    "type": "open_ended",
                    "question": f"Comment abordez-vous les défis professionnels dans {required_skills[0] if required_skills else 'votre domaine'} ? Décrivez votre processus.",
                    "points": 3,
                    "difficulty": difficulty,
                    "explanation": "Nous recherchons une approche structurée et méthodique adaptée à la profession.",
                    "max_length": 500,
                    "expected_keywords": ["analyse", "planification", "exécution", "évaluation", "amélioration"],
                    "domain_focus": required_skills[:2]
                })

        return {
            "title": f"Test d'évaluation - {job_title}",
            "description": f"Évaluation des compétences professionnelles pour le poste de {job_title}. Adapté aux exigences spécifiques.",
            "duration": 60,
            "passing_score": 70,
            "questions": questions,
            "job_based": True,
            "generated_with_ai": True,
            "config_used": config
        }

    def _clean_json_string(self, json_str: str) -> str:
        """Nettoie une chaîne JSON problématique."""
        import re

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

    def _format_list(self, items: List[str]) -> str:
        """Formate une liste pour l'affichage."""
        if not items:
            return "- Aucune spécifiée"
        return "\n".join([f"- {item}" for item in items[:10]])  # Limiter à 10 items


# Fonction utilitaire pour l'importation
def generate_technical_test(job_data: Dict[str, Any], config: Dict[str, Any], db=None) -> Dict[str, Any]:
    """
    Fonction d'interface pour générer un test technique.

    Args:
        job_data: Données de l'offre d'emploi
        config: Configuration pour la génération
        db: Instance de base de données (optionnel)

    Returns:
        Test technique généré
    """
    test_ai = TestAI(db=db)
    return test_ai.generate_test_from_job(job_data, config)