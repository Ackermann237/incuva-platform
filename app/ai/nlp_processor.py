# backend/app/ai/nlp_processor.py
import spacy
from sentence_transformers import SentenceTransformer, util
import torch
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging
import re
from langdetect import detect, DetectorFactory
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Pour la cohérence des résultats de détection de langue
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)


class NLUProcessor:
    """Processeur avancé de compréhension du langage naturel"""

    def __init__(self):
        self.nlp_fr = None
        self.sentence_model = None
        self.rh_intents = None
        self.conversation_intents = None
        self._initialize_models()

    def _initialize_models(self):
        """Initialiser les modèles NLP"""
        try:
            # Charger spaCy pour le français
            try:
                self.nlp_fr = spacy.load("fr_core_news_md")
            except:
                logger.info("Téléchargement du modèle spaCy français...")
                import subprocess
                subprocess.run(["python", "-m", "spacy", "download", "fr_core_news_md"])
                self.nlp_fr = spacy.load("fr_core_news_md")

            # Charger le modèle de similarité sémantique
            self.sentence_model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

            # Définir les intentions RH
            self.rh_intents = self._define_rh_intents()

            # Définir les intentions de conversation
            self.conversation_intents = self._define_conversation_intents()

            # Télécharger les ressources NLTK
            try:
                nltk.data.find('tokenizers/punkt')
                nltk.data.find('corpora/stopwords')
            except:
                nltk.download('punkt')
                nltk.download('stopwords')
                nltk.download('punkt_tab')

            logger.info("✅ Modèles NLP initialisés avec succès")

        except Exception as e:
            logger.error(f"❌ Erreur initialisation NLP: {str(e)}")
            raise

    def _define_rh_intents(self) -> Dict[str, List[str]]:
        """Définir les intentions spécifiques aux RH"""
        return {
            'burnout_risk': [
                "burnout", "risque", "stress", "épuisement", "fatigue",
                "surcharge", "dépression", "mal-être", "santé mentale",
                "charge de travail", "heures supplémentaires", "surmenage"
            ],
            'recruitment_anomalies': [
                "recrutement", "embauche", "candidat", "processus",
                "anomalie", "problème", "erreur", "dysfonctionnement",
                "offre d'emploi", "entretien", "sélection", "poste"
            ],
            'planning_optimization': [
                "planning", "horaire", "shifts", "emploi du temps",
                "optimiser", "améliorer", "réorganiser", "équilibrer",
                "charge", "répartition", "congés", "disponibilités"
            ],
            'absence_trends': [
                "absence", "congé", "maladie", "arrêt", "présentéisme",
                "tendance", "statistique", "fréquence", "motif",
                "absentéisme", "retard", "départ anticipé"
            ],
            'employee_analysis': [
                "employé", "salarié", "collaborateur", "équipe",
                "performance", "productivité", "compétence", "évaluation",
                "département", "service", "poste", "fonction"
            ],
            'salary_analysis': [
                "salaire", "paie", "rémunération", "augmentation",
                "prime", "bonus", "coût", "budget", "masse salariale",
                "grille", "niveau", "échelon"
            ],
            'contract_analysis': [
                "contrat", "cdi", "cdd", "intérim", "stage",
                "alternance", "renouvellement", "rupture", "résiliation",
                "durée", "période d'essai", "clause"
            ],
            'training_needs': [
                "formation", "compétence", "développement", "apprentissage",
                "besoin", "qualification", "certification", "diplôme",
                "montée en compétence", "évolution", "carrière"
            ]
        }

    def _define_conversation_intents(self) -> Dict[str, List[str]]:
        """Définir les intentions de conversation générale"""
        return {
            'greeting': [
                "bonjour", "bonsoir", "salut", "coucou", "hello", "hi",
                "ça va", "comment vas-tu", "comment allez-vous",
                "bien et toi", "enchanté", "ravi"
            ],
            'farewell': [
                "au revoir", "à bientôt", "à plus", "bye", "ciao",
                "bonne journée", "bonne soirée", "à demain", "à tout à l'heure"
            ],
            'thanks': [
                "merci", "merci beaucoup", "je vous remercie",
                "c'est gentil", "avec plaisir", "de rien", "pas de quoi"
            ],
            'introduction': [
                "qui es-tu", "ton nom", "présente-toi", "tu t'appelles comment",
                "qu'est-ce que tu es", "tu es qui", "ta fonction"
            ],
            'capabilities': [
                "que peux-tu faire", "tes capacités", "tu sais faire quoi",
                "comment peux-tu m'aider", "fonctionnalités", "services"
            ],
            'small_talk': [
                "comment ça va", "tu vas bien", "ça va et toi",
                "beau temps", "il fait beau", "il pleut",
                "quel jour", "quelle heure", "week-end", "vacances"
            ],
            'joke_request': [
                "blague", "histoire drôle", "fais-moi rire",
                "anecdote", "histoire", "raconte", "divertis-moi"
            ],
            'help_request': [
                "peux-tu m'aider", "j'ai besoin d'aide", "aide-moi",
                "je ne comprends pas", "explique-moi", "conseille-moi"
            ]
        }

    def detect_language(self, text: str) -> str:
        """Détecter la langue du texte"""
        try:
            return detect(text)
        except:
            return "fr"  # Par défaut français

    def preprocess_text(self, text: str) -> str:
        """Prétraiter le texte"""
        # Convertir en minuscules
        text = text.lower()

        # Supprimer les caractères spéciaux (garder les accents français)
        text = re.sub(r'[^\w\sàâäéèêëîïôöùûüÿçñ\-]', ' ', text)

        # Supprimer les espaces multiples
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    def extract_entities(self, text: str) -> Dict:
        """Extraire les entités nommées"""
        doc = self.nlp_fr(text)

        entities = {
            'persons': [],
            'organizations': [],
            'dates': [],
            'numbers': [],
            'positions': [],
            'departments': []
        }

        for ent in doc.ents:
            if ent.label_ == 'PER':
                entities['persons'].append(ent.text)
            elif ent.label_ == 'ORG':
                entities['organizations'].append(ent.text)
            elif ent.label_ == 'DATE':
                entities['dates'].append(ent.text)
            elif ent.label_ == 'CARDINAL':
                entities['numbers'].append(ent.text)

        # Détection spécifique RH
        position_keywords = ['manager', 'directeur', 'ingénieur', 'technicien',
                             'assistant', 'commercial', 'administratif', 'rh']
        department_keywords = ['rh', 'commercial', 'technique', 'production',
                               'marketing', 'finance', 'informatique', 'logistique']

        for token in doc:
            if token.text in position_keywords:
                entities['positions'].append(token.text)
            if token.text in department_keywords:
                entities['departments'].append(token.text)

        return entities

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculer la similarité sémantique entre deux textes"""
        embeddings1 = self.sentence_model.encode(text1, convert_to_tensor=True)
        embeddings2 = self.sentence_model.encode(text2, convert_to_tensor=True)

        cosine_scores = util.pytorch_cos_sim(embeddings1, embeddings2)
        return cosine_scores.item()

    def classify_intent(self, query: str) -> Dict:
        """Classifier l'intention de la requête"""
        query_lower = self.preprocess_text(query)

        # Vérifier d'abord si c'est une conversation générale
        conversation_score = self._score_conversation_intent(query_lower)
        rh_score = self._score_rh_intent(query_lower)

        # Déterminer le type principal
        if conversation_score > rh_score:
            intent_type = 'conversation'
            intent_details = self._get_conversation_intent_details(query_lower)
        else:
            intent_type = 'rh'
            intent_details = self._get_rh_intent_details(query_lower)

        # Extraire les entités
        entities = self.extract_entities(query)

        # Détecter la langue
        language = self.detect_language(query)

        # Calculer la confiance
        confidence = max(conversation_score, rh_score)

        return {
            'type': intent_type,
            'details': intent_details,
            'confidence': confidence,
            'entities': entities,
            'language': language,
            'processed_query': query_lower
        }

    def _score_conversation_intent(self, query: str) -> float:
        """Noter l'intention de conversation"""
        scores = []

        for intent, keywords in self.conversation_intents.items():
            # Vérifier la présence directe de mots-clés
            keyword_matches = sum(1 for keyword in keywords if keyword in query)

            if keyword_matches > 0:
                # Score basé sur le nombre de mots-clés correspondants
                score = min(keyword_matches / len(keywords) * 2, 1.0)
                scores.append(score)

        # Vérifier les patterns de conversation
        conversation_patterns = [
            r'^bonjour.*',
            r'^salut.*',
            r'^ça va.*',
            r'^merci.*',
            r'^au revoir.*',
            r'^qui es.*',
            r'^blague.*',
            r'^histoire.*'
        ]

        for pattern in conversation_patterns:
            if re.match(pattern, query):
                scores.append(0.8)

        return max(scores) if scores else 0.0

    def _score_rh_intent(self, query: str) -> float:
        """Noter l'intention RH"""
        scores = []

        for intent, keywords in self.rh_intents.items():
            # Vérifier la présence directe de mots-clés
            keyword_matches = sum(1 for keyword in keywords if keyword in query)

            if keyword_matches > 0:
                # Score basé sur le nombre de mots-clés correspondants
                score = min(keyword_matches / len(keywords) * 2, 1.0)
                scores.append(score)

        # Vérifier les patterns RH
        rh_patterns = [
            r'.*employé.*',
            r'.*salaire.*',
            r'.*planning.*',
            r'.*absence.*',
            r'.*contrat.*',
            r'.*formation.*',
            r'.*recrutement.*',
            r'.*analyse.*'
        ]

        for pattern in rh_patterns:
            if re.search(pattern, query):
                scores.append(0.6)

        return max(scores) if scores else 0.0

    def _get_conversation_intent_details(self, query: str) -> Dict:
        """Obtenir les détails de l'intention de conversation"""
        intent_details = {
            'primary_intent': 'unknown',
            'secondary_intents': [],
            'keywords_found': []
        }

        # Trouver l'intention principale
        max_score = 0
        for intent, keywords in self.conversation_intents.items():
            matches = [kw for kw in keywords if kw in query]
            if matches:
                score = len(matches) / len(keywords)
                if score > max_score:
                    max_score = score
                    intent_details['primary_intent'] = intent
                    intent_details['keywords_found'] = matches

        # Trouver les intentions secondaires
        for intent, keywords in self.conversation_intents.items():
            if intent != intent_details['primary_intent']:
                matches = [kw for kw in keywords if kw in query]
                if matches:
                    intent_details['secondary_intents'].append(intent)

        return intent_details

    def _get_rh_intent_details(self, query: str) -> Dict:
        """Obtenir les détails de l'intention RH"""
        intent_details = {
            'primary_intent': 'general_analysis',
            'secondary_intents': [],
            'keywords_found': [],
            'data_needs': []
        }

        # Trouver l'intention principale
        max_score = 0
        for intent, keywords in self.rh_intents.items():
            matches = [kw for kw in keywords if kw in query]
            if matches:
                score = len(matches) / len(keywords)
                if score > max_score:
                    max_score = score
                    intent_details['primary_intent'] = intent
                    intent_details['keywords_found'] = matches

        # Déterminer les besoins en données
        data_mapping = {
            'burnout_risk': ['employees', 'absences', 'planning'],
            'recruitment_anomalies': ['recruitment', 'contracts', 'employees'],
            'planning_optimization': ['planning', 'employees'],
            'absence_trends': ['absences', 'employees'],
            'employee_analysis': ['employees', 'planning', 'absences'],
            'salary_analysis': ['employees', 'contracts'],
            'contract_analysis': ['contracts', 'employees'],
            'training_needs': ['employees']
        }

        if intent_details['primary_intent'] in data_mapping:
            intent_details['data_needs'] = data_mapping[intent_details['primary_intent']]

        # Trouver les intentions secondaires
        for intent, keywords in self.rh_intents.items():
            if intent != intent_details['primary_intent']:
                matches = [kw for kw in keywords if kw in query]
                if matches:
                    intent_details['secondary_intents'].append(intent)

        return intent_details

    def generate_response_template(self, intent_result: Dict, data_context: Dict = None) -> str:
        """Générer un template de réponse basé sur l'intention"""
        intent_type = intent_result['type']
        details = intent_result['details']

        if intent_type == 'conversation':
            return self._generate_conversation_response(details)
        else:
            return self._generate_rh_response(details, data_context)

    def _generate_conversation_response(self, intent_details: Dict) -> str:
        """Générer une réponse de conversation"""
        primary_intent = intent_details['primary_intent']

        responses = {
            'greeting': "👋 Bonjour ! Je suis Jarvis, votre assistant IA RH. Je suis ravi de discuter avec vous !",
            'farewell': "👋 Au revoir ! Ce fut un plaisir d'échanger avec vous. N'hésitez pas à revenir !",
            'thanks': "🤗 Avec plaisir ! Je suis là pour vous aider à tout moment.",
            'introduction': "🤖 Je suis Jarvis, un assistant IA spécialisé en ressources humaines. Je peux analyser vos données RH ou simplement discuter !",
            'capabilities': "💡 Je peux : analyser des données RH, détecter des risques, optimiser le planning, et bien sûr discuter de manière naturelle !",
            'small_talk': "😊 Je vais très bien, merci ! En tant qu'IA, je suis toujours prêt à aider. Et vous, comment allez-vous ?",
            'joke_request': "😄 Pourquoi les RH n'ont-ils pas peur des fantômes ? Parce qu'ils sont habitués à gérer des esprits d'équipe !",
            'help_request': "🔍 Bien sûr ! Je peux vous aider avec des analyses RH ou répondre à vos questions. De quoi avez-vous besoin ?",
            'unknown': "💭 Je suis content que vous souhaitiez discuter ! Comment puis-je vous aider aujourd'hui ?"
        }

        return responses.get(primary_intent, responses['unknown'])

    def _generate_rh_response(self, intent_details: Dict, data_context: Dict) -> str:
        """Générer une réponse RH"""
        primary_intent = intent_details['primary_intent']

        # Vérifier si on a les données nécessaires
        data_available = True
        if data_context:
            for data_type in intent_details.get('data_needs', []):
                if data_type not in data_context or len(data_context[data_type]) == 0:
                    data_available = False
                    break

        responses = {
            'burnout_risk': {
                'available': "📊 Analyse des risques de burnout\n\nJe vais analyser vos données pour identifier les employés à risque...",
                'unavailable': "⚠️ Analyse des risques de burnout\n\nJe peux analyser les risques de burnout, mais j'ai besoin d'accès aux données employés, absences et planning."
            },
            'recruitment_anomalies': {
                'available': "🔍 Détection d'anomalies RH\n\nJe recherche les anomalies dans vos processus de recrutement...",
                'unavailable': "⚠️ Détection d'anomalies RH\n\nPour analyser les anomalies de recrutement, j'ai besoin des données de recrutement et de contrats."
            },
            'planning_optimization': {
                'available': "📅 Optimisation du planning\n\nJ'analyse votre planning actuel pour proposer des optimisations...",
                'unavailable': "⚠️ Optimisation du planning\n\nPour optimiser le planning, j'ai besoin des données de planning et d'employés."
            },
            'absence_trends': {
                'available': "📈 Analyse des tendances d'absences\n\nJ'examine les patterns d'absences dans votre entreprise...",
                'unavailable': "⚠️ Analyse des tendances d'absences\n\nPour analyser les absences, j'ai besoin des données d'absences et d'employés."
            },
            'general_analysis': {
                'available': "🤖 Analyse RH générale\n\nJe vais analyser toutes vos données RH pour fournir des insights...",
                'unavailable': "🤖 Analyse RH générale\n\nJe peux analyser vos données RH. Quels aspects souhaitez-vous examiner ?"
            }
        }

        intent_response = responses.get(primary_intent, responses['general_analysis'])

        if data_available:
            return intent_response['available']
        else:
            return intent_response['unavailable']

    def extract_key_phrases(self, text: str, top_n: int = 5) -> List[str]:
        """Extraire les phrases clés du texte"""
        doc = self.nlp_fr(text)

        # Score basé sur la longueur, les entités et les mots-clés
        phrases = []
        for sent in doc.sents:
            score = 0
            score += len(sent) * 0.1  # Poids pour la longueur

            # Bonus pour les entités
            sent_entities = [ent.text for ent in sent.ents]
            score += len(sent_entities) * 2

            # Bonus pour les mots-clés RH
            rh_keywords = set([kw for sublist in self.rh_intents.values() for kw in sublist])
            sent_keywords = [token.text for token in sent if token.text in rh_keywords]
            score += len(sent_keywords) * 1.5

            phrases.append((sent.text, score))

        # Trier par score et retourner les top_n
        phrases.sort(key=lambda x: x[1], reverse=True)
        return [phrase[0] for phrase in phrases[:top_n]]

    def analyze_sentiment(self, text: str) -> Dict:
        """Analyser le sentiment du texte"""
        # Version simplifiée - en production, utiliser un modèle dédié
        positive_words = ['bon', 'excellent', 'super', 'génial', 'parfait', 'merci', 'bravo']
        negative_words = ['mauvais', 'problème', 'erreur', 'déçu', 'nul', 'insatisfait']

        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)

        total = positive_count + negative_count
        if total == 0:
            return {'sentiment': 'neutral', 'score': 0.0}

        score = (positive_count - negative_count) / total

        if score > 0.3:
            sentiment = 'positive'
        elif score < -0.3:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'

        return {
            'sentiment': sentiment,
            'score': score,
            'positive_words': positive_count,
            'negative_words': negative_count
        }


# Singleton pour le processeur NLP
_nlp_processor = None


def get_nlp_processor() -> NLUProcessor:
    """Obtenir l'instance singleton du processeur NLP"""
    global _nlp_processor
    if _nlp_processor is None:
        _nlp_processor = NLUProcessor()
    return _nlp_processor