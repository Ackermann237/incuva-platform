"""Tris côté Python pour éviter les index composites Firestore.

Un filtre `where` combiné à un `order_by` sur un autre champ exige un index composite, à créer à la main dans la
console Firebase (sinon : « 400 The query requires an index »). Les volumes par entreprise étant faibles, on
récupère les documents filtrés puis on les trie ici.
"""
from datetime import datetime, timezone


def _sort_key(doc, field):
    """Clé de tri comparable : les dates Firestore et les textes ISO (AAAA-MM-JJ...) se trient de la même façon."""
    value = doc.to_dict().get(field)
    if isinstance(value, datetime):
        if value.tzinfo:
            value = value.astimezone(timezone.utc)
        return value.strftime('%Y-%m-%dT%H:%M:%S.%f')
    if isinstance(value, str):
        return value
    return ''  # valeur absente : classée en dernier en tri décroissant


def sort_docs_desc(docs, field):
    """Documents triés du plus récent au plus ancien selon `field` (les valeurs absentes en dernier)."""
    return sorted(docs, key=lambda d: _sort_key(d, field), reverse=True)


def latest_doc(query, field):
    """Document le plus récent d'après `field`, ou None."""
    docs = sort_docs_desc(query.stream(), field)
    return docs[0] if docs and docs[0].to_dict().get(field) is not None else None
