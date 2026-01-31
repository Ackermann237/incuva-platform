from firebase_admin import firestore
import logging
from flask import g
from google.cloud.firestore_v1 import GeoPoint

logger = logging.getLogger(__name__)


class FavoriteService:
    def __init__(self, db):
        self.db = db

    def serialize_firestore(data):
        """Convertit les objets Firestore non-JSON (GeoPoint, Timestamp...) en valeurs sérialisables."""
        from google.cloud.firestore_v1 import GeoPoint
        from google.cloud.firestore import DocumentReference
        import datetime

        serialized = {}

        for k, v in data.items():
            # Fix GeoPoint
            if isinstance(v, GeoPoint):
                serialized[k] = {"lat": v.latitude, "lng": v.longitude}

            # Fix Firestore timestamp
            elif isinstance(v, datetime.datetime):
                serialized[k] = v.isoformat()

            # Fix nested dict
            elif isinstance(v, dict):
                serialized[k] = data.serialize_firestore(v)

            # Fix list
            elif isinstance(v, list):
                serialized[k] = [
                    data.serialize_firestore(i) if isinstance(i, dict) else i
                    for i in v
                ]

            else:
                serialized[k] = v

        return serialized

    def add_favorite(self, company_id, talent_id):
        """Add a talent to the company's favorites if not already added."""
        logger.debug(f"Attempting to add favorite: company_id={company_id}, talent_id={talent_id}")
        try:
            # Batch check for provider existence and favorite status
            batch = self.db.batch()
            provider_ref = self.db.collection('providers').document(talent_id)
            favorite_query = self.db.collection('favorites').where('company_id', '==', company_id).where('talent_id',
                                                                                                         '==',
                                                                                                         talent_id).limit(
                1)

            # Execute queries
            provider_doc = provider_ref.get()
            favorite_docs = favorite_query.get()

            if not provider_doc.exists:
                logger.error(f"Talent ID {talent_id} not found in providers collection")
                raise Exception(f"Talent with ID {talent_id} not found")

            if len(favorite_docs) > 0:
                logger.info(f"Talent {talent_id} already in favorites for company {company_id}")
                return False  # Already in favorites

            # Add to favorites
            favorite_data = {
                'company_id': company_id,
                'talent_id': talent_id,
                'added_at': firestore.SERVER_TIMESTAMP
            }
            self.db.collection('favorites').add(favorite_data)
            logger.info(f"Favorite added: company {company_id}, talent {talent_id}")
            return True
        except Exception as e:
            logger.error(f"Error adding favorite for company {company_id}, talent {talent_id}: {str(e)}")
            raise Exception(f"Failed to add favorite: {str(e)}")

    def remove_favorite(self, company_id, talent_id):
        """Remove a talent from the company's favorites."""
        try:
            favorite_ref = self.db.collection('favorites').where('company_id', '==', company_id).where('talent_id',
                                                                                                       '==',
                                                                                                       talent_id).limit(
                1).get()
            if len(favorite_ref) == 0:
                logger.info(f"Talent {talent_id} not found in favorites for company {company_id}")
                return False  # Not in favorites
            for doc in favorite_ref:
                doc.reference.delete()
            logger.info(f"Favorite removed: company {company_id}, talent {talent_id}")
            return True
        except Exception as e:
            logger.error(f"Error removing favorite for company {company_id}, talent {talent_id}: {str(e)}")
            raise Exception(f"Failed to remove favorite: {str(e)}")

    def get_favorite_count(self, company_id):
        """Get the number of favorites for a company."""
        try:
            favorites_ref = self.db.collection('favorites').where('company_id', '==', company_id)
            count = len(list(favorites_ref.stream()))
            logger.debug(f"Favorite count for company {company_id}: {count}")
            return count
        except Exception as e:
            logger.error(f"Error fetching favorite count for company {company_id}: {str(e)}")
            return 0

    def get_favorites(self, company_id):
        """Fetch all talents in favorites for a company."""
        try:
            favorites_ref = self.db.collection('favorites').where('company_id', '==', company_id)
            favorites_docs = favorites_ref.stream()
            talents = []
            for doc in favorites_docs:
                data = doc.to_dict()
                talent = g.talent_service.get_talent_by_id(data['talent_id'])
                if talent:
                    serialized = self.serialize_firestore(talent)
                    talents.append(serialized)
                else:
                    logger.warning(f"Talent ID {data['talent_id']} not found in providers collection")
            logger.info(f"Fetched {len(talents)} favorites for company {company_id}")
            return talents
        except Exception as e:
            logger.error(f"Error fetching favorites for company {company_id}: {str(e)}")
            return []