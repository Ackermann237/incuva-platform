from firebase_admin import firestore
import logging
from flask import g

logger = logging.getLogger(__name__)


class FavoriteService:
    def __init__(self, db):
        self.db = db

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
                    # Conversion sécurisée des champs
                    talent_data = {
                        'id': talent['id'],
                        'name': talent.get('name', ''),
                        'email': talent.get('email', ''),
                        'profileImageUrl': talent.get('profileImageUrl', ''),
                        'userCountry': talent.get('userCountry', ''),
                        'title': talent.get('title', ''),
                        'originalTitle': talent.get('originalTitle', ''),
                        'description': talent.get('description', ''),
                        'location': talent.get('location', ''),
                        'country': talent.get('country', ''),
                        'price': talent.get('price', 0),
                        'currency': talent.get('currency', ''),
                        'user_uid': talent.get('user_uid', '')  # Important pour le chat
                    }

                    # Gestion des GeoPoint
                    coordinates = talent.get('coordinates')
                    if isinstance(coordinates, firestore.GeoPoint):
                        talent_data['coordinates'] = {
                            'latitude': round(coordinates.latitude, 4),
                            'longitude': round(coordinates.longitude, 4)
                        }

                    # Gestion des dates (si ce sont des Timestamp)
                    for field in ['startTime', 'endTime', 'registrationDate']:
                        if field in talent and talent[field]:
                            if isinstance(talent[field], firestore.server_timestamp.ServerTimestamp):
                                talent_data[field] = 'Non spécifié'
                            elif hasattr(talent[field], 'strftime'):
                                talent_data[field] = talent[field].strftime('%d/%m/%Y')
                            else:
                                talent_data[field] = str(talent[field])

                    talents.append(talent_data)

            logger.info(f"Fetched {len(talents)} favorites for company {company_id}")
            return talents
        except Exception as e:
            logger.error(f"Error fetching favorites for company {company_id}: {str(e)}", exc_info=True)
            return []

