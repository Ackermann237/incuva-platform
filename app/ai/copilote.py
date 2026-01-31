# backend/app/ai/copilote.py
import requests
from flask import current_app
import logging
import json

logger = logging.getLogger(__name__)


def generate_contract_content(prompt):
    """Génère le contenu d'un contrat via l'API Hugging Face Chat."""
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
                {
                    "role": "system",
                    "content": "Tu es un assistant juridique professionnel spécialisé dans la rédaction de contrats de travail."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.7,
            "top_p": 0.9
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            raise Exception(f"Erreur API Hugging Face: {response.text}")

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not content:
            raise Exception("Réponse vide de l'API Hugging Face")

        logger.info("Contenu du contrat généré avec succès ✅")
        return content

    except Exception as e:
        logger.error(f"Erreur lors de la génération du contenu: {str(e)}")
        raise


def call_ia(prompt):
    """Appeler l'IA pour des tâches générales."""
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
                {
                    "role": "system",
                    "content": """Tu es Jarvis, un assistant IA RH professionnel, sympathique et serviable.

                    Caractéristiques:
                    - Parle français naturellement
                    - Utilise des emojis appropriés
                    - Est professionnel pour les questions RH
                    - Est amical pour les conversations générales
                    - Fournit des réponses utiles et informatives
                    """
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 800,
            "temperature": 0.7,
            "top_p": 0.9,
            "presence_penalty": 0.1,
            "frequency_penalty": 0.1
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            raise Exception(f"Erreur API Hugging Face: {response.text}")

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not content:
            raise Exception("Réponse vide de l'API Hugging Face")

        logger.info("Réponse IA générée avec succès ✅")
        return content

    except requests.exceptions.Timeout:
        logger.error("Timeout lors de l'appel à l'IA")
        return "Désolé, le service IA met trop de temps à répondre. Veuillez réessayer."
    except Exception as e:
        logger.error(f"Erreur lors de l'appel à l'IA: {str(e)}")
        raise


def generate_bi_insights(prompt):
    """Génère des insights BI via l'IA."""
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
                {
                    "role": "system",
                    "content": """Tu es un data analyst professionnel spécialisé dans la gestion des ressources humaines.

                    Ta mission:
                    - Analyser les données RH
                    - Fournir des insights actionnables
                    - Proposer des recommandations concrètes
                    - Identifier des tendances et patterns
                    - Évaluer des risques et opportunités

                    Style:
                    - Professionnel et structuré
                    - Basé sur les données
                    - Orienté résultats
                    - En français
                    - Avec des métriques clés
                    """
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.6,  # Plus bas pour les analyses
            "top_p": 0.8,
            "presence_penalty": 0.0,
            "frequency_penalty": 0.0
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            raise Exception(f"Erreur API Hugging Face: {response.text}")

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not content:
            raise Exception("Réponse vide de l'API Hugging Face")

        logger.info("Insights BI générés avec succès ✅")
        return content

    except Exception as e:
        logger.error(f"Erreur lors de la génération des insights BI: {str(e)}")
        raise


def chat_general(prompt):
    """Fonction optimisée pour la conversation générale."""
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
                {
                    "role": "system",
                    "content": """Tu es Jarvis, un assistant IA RH.

                    Personnalité:
                    - Amical et approchable 👋
                    - Professionnel dans les sujets RH 💼
                    - Naturel dans les conversations 🗣️
                    - Serviable et attentionné 🤗
                    - Positif et encourageant ✨

                    Style de réponse:
                    - Utilise des emojis appropriés
                    - Réponds en français naturel
                    - Sois concis mais complet
                    - Encourage la conversation
                    - Offre ton aide pour les RH

                    Exemples de ton style:
                    "Bonjour ! 👋 Je suis ravi de discuter avec vous !"
                    "Je comprends votre question. 🤔 Voici ce que je peux vous dire..."
                    "En tant qu'assistant RH, je peux analyser... 📊"
                    "C'est une excellente question ! 💡"
                    "N'hésitez pas si vous avez d'autres questions ! 😊"
                    """
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 600,  # Plus court pour les conversations
            "temperature": 0.8,  # Plus créatif
            "top_p": 0.9,
            "presence_penalty": 0.2,
            "frequency_penalty": 0.2,
            "stream": False
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=20  # Timeout plus court pour les conversations
        )

        if response.status_code != 200:
            logger.error(f"Erreur API: {response.status_code} - {response.text}")
            return "Je suis désolé, j'ai rencontré un problème technique. Pouvez-vous réessayer ?"

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not content:
            logger.error("Réponse vide de l'API")
            return "Je n'ai pas pu générer de réponse. Pouvez-vous reformuler votre question ?"

        logger.info("Conversation générale générée avec succès ✅")
        return content

    except requests.exceptions.Timeout:
        logger.error("Timeout conversation générale")
        return "Je prends un peu plus de temps pour réfléchir... 🤔 En attendant, avez-vous d'autres questions ?"
    except Exception as e:
        logger.error(f"Erreur conversation générale: {str(e)}")
        return "Bonjour ! Je suis Jarvis, votre assistant RH. Je suis désolé, j'ai rencontré une difficulté. Comment puis-je vous aider ?"