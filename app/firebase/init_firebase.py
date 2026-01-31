# firebase/init_firebase.py
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Chemin vers le fichier JSON
cred_path = os.path.join(os.path.dirname(__file__), "incuva_cred.json")

# Initialiser Firebase si ce n'est pas déjà fait
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_app = firebase_admin.initialize_app(cred)
else:
    firebase_app = firebase_admin.get_app()

# Créer le client Firestore après initialisation
db = firestore.client()
