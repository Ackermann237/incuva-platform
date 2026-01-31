from firebase_admin import firestore

db = firestore.client()

# Exposer db pour l'utiliser dans les routes
