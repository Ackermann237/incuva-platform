"""Utilitaires sur les documents utilisateur (collection Firestore `users`)."""


def display_name(user, default='Anonyme'):
    """Nom à afficher : nom de l'entreprise pour une entreprise, « Prénom Nom » pour un particulier."""
    if not user:
        return default
    if user.get('companyName'):
        return user['companyName']
    full_name = f"{user.get('first_name', '')} {user.get('name', '')}".strip()
    return full_name or user.get('name') or default
