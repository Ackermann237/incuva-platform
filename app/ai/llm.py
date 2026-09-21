# backend/app/ai/llm.py
"""Appel simple au modèle de langage (Hugging Face, comme le reste de la plateforme) et extraction de JSON."""
import json
import logging
import re

import requests
from flask import current_app

logger = logging.getLogger(__name__)

HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions"
DEFAULT_MODEL = "meta-llama/Llama-3.1-8B-Instruct:novita"


class LLMUnavailable(Exception):
    """Le modèle n'a pas pu répondre (clé absente, quota, réseau...)."""


def model_name():
    return current_app.config.get('JARVIS_MODEL') or DEFAULT_MODEL


def complete(system, user, max_tokens=1800, temperature=0.3, timeout=90):
    """Réponse texte du modèle. Lève LLMUnavailable en cas d'échec."""
    api_key = current_app.config.get('HUGGINGFACE_API_KEY')
    if not api_key:
        raise LLMUnavailable("Clé API Hugging Face non configurée")
    try:
        resp = requests.post(
            HF_CHAT_URL,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={'model': model_name(),
                  'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': user}],
                  'max_tokens': max_tokens, 'temperature': temperature, 'top_p': 0.9},
            timeout=timeout,
        )
    except requests.RequestException as e:
        raise LLMUnavailable(f"Modèle injoignable : {e}") from e
    if resp.status_code != 200:
        raise LLMUnavailable(f"Le modèle a répondu {resp.status_code} : {resp.text[:200]}")
    return resp.json().get('choices', [{}])[0].get('message', {}).get('content', '') or ''


def extract_json(text):
    """Premier objet JSON contenu dans la réponse du modèle (tolère le texte autour et les virgules finales)."""
    start, end = text.find('{'), text.rfind('}')
    if start == -1 or end <= start:
        return None
    candidate = text[start:end + 1]
    for attempt in (candidate, re.sub(r',\s*([}\]])', r'\1', candidate)):
        try:
            data = json.loads(attempt)
            return data if isinstance(data, dict) else None
        except ValueError:
            continue
    return None


FILLER_MARKERS = ("il n'y a pas de", "il n'y a pas d'", "il n'y a aucun", "il n'y a aucune", "pas nécessaire", "si nécessaire", "il est toujours important")


def is_filler(text):
    """Reconnaît les justifications creuses du modèle (« il n'y a pas de X, mais il est toujours important... »)."""
    lowered = str(text or '').lower()
    return any(marker in lowered for marker in FILLER_MARKERS)


def complete_json(system, user, **kwargs):
    """Réponse du modèle sous forme de dict ; None si le JSON est inexploitable. Lève LLMUnavailable si le modèle échoue."""
    return extract_json(complete(system, user, **kwargs))
