"""Validation et nettoyage du profil d'un particulier avant enregistrement (route /auth/update_profile).

Seuls les champs connus sont acceptés, avec des types et des longueurs contrôlés. Les adresses affichées comme liens
(LinkedIn, CV, portfolio) doivent être en http(s) : une adresse « javascript: » enregistrée dans un profil serait exécutée
au clic d'un recruteur.
"""
import re

from .storage_urls import canonical

URL_PATTERN = re.compile(r'^https?://\S+$', re.IGNORECASE)

MAX_LIST_ITEMS = 50
MAX_RECORDS = 30

# Champs texte simples : nom du champ -> (longueur maximale, obligatoire si présent)
TEXT_FIELDS = {
    'first_name': (80, True),
    'name': (80, True),
    'phone': (30, False),
    'location': (80, False),
    'country': (80, False),
    'user_role': (40, False),
    'bio': (2000, False),
    'cvName': (200, False),
}

# Blocs répétables : champ -> {clé: longueur maximale}
RECORD_FIELDS = {
    'experience': {'title': 120, 'company': 120, 'start': 30, 'end': 30, 'description': 1500},
    'education': {'degree': 150, 'school': 150, 'start': 30, 'end': 30},
    'portfolio': {'title': 120, 'link': 300, 'fileUrl': 500, 'fileName': 200, 'fileType': 60, 'description': 500},
}
URL_KEYS = {'link', 'fileUrl'}

FIELD_LABELS = {'first_name': 'Le prénom', 'name': 'Le nom'}


def _text(value, limit):
    return str(value).strip()[:limit] if value is not None else ''


def _url(value, limit, label):
    value = _text(value, 4000)
    if value and not URL_PATTERN.match(value):
        raise ValueError(f"{label} doit être une adresse web commençant par http:// ou https://.")
    # Un fichier du stockage est enregistré sans signature (celle-ci expire) : elle est recalculée à chaque lecture
    return canonical(value)[:limit]


def _string_list(value, item_limit=60):
    if not isinstance(value, list):
        raise ValueError("Une liste est attendue.")
    seen, result = set(), []
    for item in value:
        text = _text(item, item_limit)
        if text and text.lower() not in seen:
            seen.add(text.lower())
            result.append(text)
    return result[:MAX_LIST_ITEMS]


def _records(value, keys, label):
    if not isinstance(value, list):
        raise ValueError(f"{label} : une liste est attendue.")
    records = []
    for item in value[:MAX_RECORDS]:
        if not isinstance(item, dict):
            continue
        record = {}
        for key, limit in keys.items():
            if key in URL_KEYS:
                record[key] = _url(item.get(key), limit, f"{label} : le lien")
            else:
                record[key] = _text(item.get(key), limit)
        if any(record.values()):  # on ignore les blocs entièrement vides
            records.append(record)
    return records


def clean_individual_profile(data):
    """Retourne les champs à enregistrer ; lève ValueError (message affichable) si une valeur est invalide."""
    result = {}

    for field, (limit, required) in TEXT_FIELDS.items():
        if field in data:
            value = _text(data[field], limit)
            if required and not value:
                raise ValueError(f"{FIELD_LABELS[field]} ne peut pas être vide.")
            result[field] = value

    if 'linkedin' in data:
        result['linkedin'] = _url(data['linkedin'], 300, "L'adresse LinkedIn")

    if 'cvUrl' in data:
        result['cvUrl'] = _url(data['cvUrl'], 1000, "L'adresse du CV") or None

    for field in ('skills', 'languages'):
        if field in data:
            result[field] = _string_list(data[field])

    for field, keys in RECORD_FIELDS.items():
        if field in data:
            result[field] = _records(data[field], keys, {'experience': 'Expérience', 'education': 'Formation', 'portfolio': 'Portfolio'}[field])

    if 'achievements' in data:
        result['achievements'] = _string_list(data['achievements'], item_limit=300)

    if not result:
        raise ValueError('Aucune donnée valide à mettre à jour')
    return result
