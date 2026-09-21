"""Accès aux fichiers du stockage S3 (CV, lettres de motivation, portfolio).

Le bucket est privé (accès public bloqué) : l'adresse « brute » d'un fichier renvoie une erreur 403 dans le navigateur.
Les adresses sont donc enregistrées sans signature en base, et signées (lecture, 1 heure) à la volée dans les réponses JSON
de l'API. Ainsi chaque écran qui affiche un CV, une pièce jointe ou une image de portfolio fonctionne sans être modifié,
et aucune signature périmée n'est stockée.
"""
import json
import logging
from urllib.parse import unquote, urlparse

import boto3
from flask import current_app

logger = logging.getLogger(__name__)

SIGNED_LIFETIME_SECONDS = 3600
MAX_REWRITTEN_BYTES = 4_000_000


def _hosts():
    bucket, region = current_app.config.get('S3_BUCKET'), current_app.config.get('S3_REGION')
    if not bucket:
        return set(), None
    hosts = {f"{bucket}.s3.amazonaws.com"}
    if region:
        hosts.add(f"{bucket}.s3.{region}.amazonaws.com")
    return hosts, bucket


def is_storage_url(url):
    if not isinstance(url, str) or not url.startswith('https://'):
        return False
    hosts, _ = _hosts()
    try:
        return (urlparse(url).hostname or '').lower() in hosts
    except ValueError:
        return False


def canonical(url):
    """Adresse sans signature ni paramètre : c'est celle-ci qui est enregistrée en base."""
    if not is_storage_url(url):
        return url
    parsed = urlparse(url)
    return f"https://{parsed.hostname}{parsed.path}"


def _client():
    client = current_app.extensions.get('s3_url_signer')
    if client is None:
        client = boto3.client(
            's3',
            aws_access_key_id=current_app.config.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=current_app.config.get('AWS_SECRET_ACCESS_KEY'),
            region_name=current_app.config.get('S3_REGION'),
        )
        current_app.extensions['s3_url_signer'] = client
    return client


def sign(url):
    """Adresse de lecture valable 1 heure ; renvoie l'adresse d'origine si elle n'est pas dans notre stockage."""
    if not is_storage_url(url):
        return url
    _, bucket = _hosts()
    try:
        key = unquote(urlparse(url).path.lstrip('/'))
        return _client().generate_presigned_url(
            ClientMethod='get_object', Params={'Bucket': bucket, 'Key': key}, ExpiresIn=SIGNED_LIFETIME_SECONDS)
    except Exception as e:
        logger.error(f"Signature de lecture impossible : {e}")
        return url


def sign_deep(value):
    """Signe toutes les adresses du stockage contenues dans une structure JSON (dict, liste, texte)."""
    if isinstance(value, str):
        return sign(canonical(value)) if is_storage_url(value) else value
    if isinstance(value, list):
        return [sign_deep(item) for item in value]
    if isinstance(value, dict):
        # `upload_url` est déjà une adresse signée pour ENVOYER un fichier (PUT) : la remplacer casserait le dépôt
        return {key: (item if key == 'upload_url' else sign_deep(item)) for key, item in value.items()}
    return value


def sign_json_response(response):
    """Hook after_request : signe les adresses de fichiers présentes dans les réponses JSON de l'API."""
    try:
        if not response.is_json or response.direct_passthrough or response.status_code >= 400:
            return response
        hosts, _ = _hosts()
        if not hosts:
            return response
        raw = response.get_data(as_text=True)
        if len(raw) > MAX_REWRITTEN_BYTES or not any(host in raw for host in hosts):
            return response
        response.set_data(json.dumps(sign_deep(json.loads(raw)), ensure_ascii=False))
    except Exception as e:  # ne jamais casser une réponse à cause de la signature
        logger.error(f"Réécriture des adresses de fichiers impossible : {e}")
    return response
