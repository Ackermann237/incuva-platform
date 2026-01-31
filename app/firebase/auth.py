from firebase_admin import auth


def create_user_with_email_and_password(email, password):
    # Créer un utilisateur avec Firebase Admin
    user = auth.create_user(
        email=email,
        password=password
    )
    return user


def sign_in_with_email_and_password(email, password):
    # La vérification de la connexion doit être faite côté client avec Firebase Auth
    # Ici, on peut seulement vérifier l'existence de l'utilisateur
    try:
        user = auth.get_user_by_email(email)
        return user
    except auth.UserNotFoundError:
        raise Exception("User not found or invalid credentials")
