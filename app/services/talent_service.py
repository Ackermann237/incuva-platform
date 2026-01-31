from firebase_admin import firestore
from datetime import datetime
import logging

try:
    from google.cloud.firestore_v1.types.document import Timestamp
except ImportError:
    Timestamp = None  # Fallback if Timestamp import fails

logger = logging.getLogger(__name__)

class TalentService:
    def __init__(self, db):
        self.db = db

    def to_datetime(self, value):
        """Convertit Timestamp, str ISO, ou '9:30 AM' → datetime"""
        if hasattr(value, 'to_datetime'):  # Firestore Timestamp
            return value.to_datetime()
        elif isinstance(value, datetime):
            return value
        elif isinstance(value, str):
            value = value.strip()
            # Cas 1: "9:30 AM" ou "09:30"
            try:
                return datetime.strptime(value, "%I:%M %p").replace(year=datetime.utcnow().year,
                                                                     month=datetime.utcnow().month,
                                                                     day=datetime.utcnow().day)
            except ValueError:
                pass
            # Cas 2: "09:30"
            try:
                time_obj = datetime.strptime(value, "%H:%M")
                today = datetime.utcnow().date()
                return datetime.combine(today, time_obj.time())
            except ValueError:
                pass
            # Cas 3: ISO string
            try:
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
            except:
                logger.warning(f"Format de date invalide: {value}")
                return datetime.utcnow()
        return datetime.utcnow()

    def geo_point_to_dict(self, geo_point):
        """Convertit firestore.GeoPoint → dict sérialisable"""
        if geo_point is None:
            return None
        return {
            "latitude": geo_point.latitude,
            "longitude": geo_point.longitude
        }

    def get_available_talents(self, search_query=None):
        try:
            providers_ref = self.db.collection('providers')
            providers = providers_ref.stream()

            talents = []
            for provider in providers:
                data = provider.to_dict()
                provider_id = provider.id

                # --- Localisation ---
                location_ref = providers_ref.document(provider_id).collection('location') \
                    .order_by('timestamp', direction=firestore.Query.DESCENDING).limit(1)
                coordinates = None
                for loc in location_ref.stream():
                    loc_data = loc.to_dict()
                    coordinates = loc_data.get('coordinates')
                    break

                # --- Utilisateur ---
                user_uid = data.get('userUid', '')
                user_data = {}
                if user_uid:
                    user_doc = self.db.collection('users').document(user_uid).get()
                    if user_doc.exists:
                        user_data = user_doc.to_dict()

                # --- Conversion sécurisée ---
                talent_data = {
                    'id': provider_id,
                    'userUid': user_uid,
                    'name': user_data.get('name', 'Anonyme'),
                    'email': user_data.get('email', ''),
                    'profileImageUrl': user_data.get('profileImageUrl', ''),
                    'title': data.get('title', 'Talent'),
                    'originalTitle': data.get('originalTitle', ''),
                    'description': data.get('description', ''),
                    'location': data.get('location', 'Non spécifié'),
                    'country': data.get('country', ''),
                    'price': float(data.get('price', 0)) if data.get('price') else 0,
                    'currency': data.get('currency', 'EUR'),
                    'startTime': self.to_datetime(data.get('startTime', '09:00')).strftime('%H:%M'),
                    'endTime': self.to_datetime(data.get('endTime', '18:00')).strftime('%H:%M'),
                    'registrationDate': self.to_datetime(data.get('registrationDate', datetime.utcnow())).strftime('%d/%m/%Y'),
                    'coordinates': self.geo_point_to_dict(coordinates)
                }

                # --- Filtre recherche ---
                if search_query:
                    search_lower = search_query.lower()
                    if (search_lower not in talent_data['title'].lower() and
                        search_lower not in talent_data['name'].lower() and
                        search_lower not in talent_data['location'].lower()):
                        continue

                talents.append(talent_data)

            return talents

        except Exception as e:
            logger.error(f"Erreur TalentService.get_available_talents: {str(e)}", exc_info=True)
            return []

    def get_talent_by_id(self, talent_id):
        """Fetch a single talent by ID, including user data."""
        try:
            provider_doc = self.db.collection('providers').document(talent_id).get()
            if not provider_doc.exists:
                return None

            data = provider_doc.to_dict()
            provider_id = provider_doc.id

            # Fetch the latest location from the location sub-collection
            location_ref = self.db.collection('providers').document(provider_id).collection('location').order_by(
                'timestamp',
                direction=firestore.Query.DESCENDING).limit(1)
            location_docs = location_ref.stream()
            coordinates = None
            for loc in location_docs:
                loc_data = loc.to_dict()
                coordinates = loc_data.get('coordinates')
                break

            # Fetch user data from the users collection using userUid
            user_uid = data.get('userUid', '')
            user_data = {}
            if user_uid:
                user_doc = self.db.collection('users').document(user_uid).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                else:
                    print(f"No user found for userUid: {user_uid}")

            talent_data = {
                'id': provider_id,
                'userUid': user_uid,
                'name': user_data.get('name', 'Non spécifié'),
                'email': user_data.get('email', 'Non spécifié'),
                'profileImageUrl': user_data.get('profileImageUrl', ''),
                'userCountry': user_data.get('country', 'Non spécifié'),
                'title': data.get('title', ''),
                'originalTitle': data.get('originalTitle', ''),
                'description': data.get('description', ''),
                'location': data.get('location', ''),
                'country': data.get('country', ''),
                'price': data.get('price', 0),
                'currency': data.get('currency', ''),
                'startTime': self.to_datetime(data.get('startTime', datetime.utcnow())),
                'endTime': self.to_datetime(data.get('endTime', datetime.utcnow())),
                'registrationDate': self.to_datetime(data.get('registrationDate', datetime.utcnow())),
                'coordinates': coordinates
            }

            return talent_data
        except Exception as e:
            print(f"Error fetching talent by ID {talent_id}: {e}")
            return None
