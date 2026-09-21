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
            # Un talent est un compte particulier (collection `users`), plus un prestataire (`providers`)
            talent_doc = self.db.collection('users').document(talent_id).get()
            favorite_docs = self.db.collection('favorites').where('company_id', '==', company_id) \
                .where('talent_id', '==', talent_id).limit(1).get()

            if not talent_doc.exists or talent_doc.to_dict().get('accountType') != 'individual':
                logger.error(f"Talent ID {talent_id} not found among individual users")
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
                # Les talents sont des comptes particuliers (collection `users`), même format que le marché des talents
                user_doc = self.db.collection('users').document(data['talent_id']).get()
                if not user_doc.exists:
                    continue

                user = user_doc.to_dict()
                bio = user.get('bio') or ''
                title = (bio[:60] + '...') if bio else 'Candidat disponible'
                talents.append({
                    'id': user_doc.id,
                    'name': f"{user.get('first_name', '')} {user.get('name', '')}".strip() or 'Anonyme',
                    'email': user.get('email', ''),
                    'profileImageUrl': user.get('profileImageUrl', ''),
                    'title': title,
                    'originalTitle': title,
                    'location': f"{user.get('location', 'Non renseignée')}, {user.get('country', '')}",
                    'country': user.get('country', ''),
                    'skills': user.get('skills', [])[:8],
                    'user_uid': user_doc.id  # Important pour le chat
                })

            logger.info(f"Fetched {len(talents)} favorites for company {company_id}")
            return talents
        except Exception as e:
            logger.error(f"Error fetching favorites for company {company_id}: {str(e)}", exc_info=True)
            return []

