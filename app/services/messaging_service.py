from firebase_admin import firestore
from google.cloud.firestore_v1 import Increment
import logging
import datetime
import boto3
from flask import current_app
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)


class MessagingService:
    def __init__(self, db):
        self.db = db

    def create_chat(self, company_id, talent_user_id, service_id):
        """Create a new chat if not exists."""
        chat_data = {
            'participants': [company_id, talent_user_id],
            'serviceId': service_id,
            'lastMessage': '',
            'lastMessageDocumentName': None,
            'lastMessageRead': False,
            'lastMessageSenderId': '',
            'lastMessageTime': firestore.SERVER_TIMESTAMP,
            'lastMessageType': '',
            'unreadCount_' + company_id: 0,
            'unreadCount_' + talent_user_id: 0
        }
        chat_ref = self.db.collection('chats').add(chat_data)
        chat_id = chat_ref[1].id
        logger.info(f"Chat created: {chat_id}")
        return chat_id

    def get_existing_chat(self, user_id1, user_id2, service_id):
        """Check for existing chat."""
        chats_ref = self.db.collection('chats')
        query = chats_ref.where('participants', 'array_contains', user_id1).where('serviceId', '==', service_id).get()
        for doc in query:
            data = doc.to_dict()
            if user_id2 in data['participants']:
                return doc.id
        return None

    def send_message(self, chat_id, sender_id, receiver_id, content):
        """Send a text message in a chat."""
        message_data = {
            'content': content,
            'senderId': sender_id,
            'receiverId': receiver_id,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'isRead': False,
            'imageUrl': None,
            'videoUrl': None,
            'documentUrl': None,
            'documentName': None,
            'audioUrl': None,
            'type': 'text',
            'interview_details': None,
            'interview_id': None,
            'deletedFor': []
        }
        _, message_ref = self.db.collection('chats').document(chat_id).collection('messages').add(message_data)
        message_id = message_ref.id

        self.db.collection('chats').document(chat_id).update({
            'lastMessage': content,
            'lastMessageDocumentName': None,
            'lastMessageRead': False,
            'lastMessageSenderId': sender_id,
            'lastMessageTime': firestore.SERVER_TIMESTAMP,
            'lastMessageType': 'text',
            'unreadCount_' + receiver_id: Increment(1)
        })
        logger.info(f"Message sent in chat {chat_id}: {message_id}")
        return message_id

    def send_interview_message(self, chat_id, sender_id, receiver_id, interview_details):
        """Send an interview scheduling message with video call support."""
        message_data = {
            'content': '',
            'senderId': sender_id,
            'receiverId': receiver_id,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'isRead': False,
            'imageUrl': None,
            'videoUrl': None,
            'documentUrl': None,
            'documentName': None,
            'audioUrl': None,
            'type': 'interview',
            'interview_details': {
                'datetime': interview_details.get('datetime'),
                'type': interview_details.get('type'),
                'documents_to_bring': interview_details.get('documents_to_bring', []),
                'supplementary_document_url': interview_details.get('supplementary_document_url'),
                'supplementary_document_name': interview_details.get('supplementary_document_name'),
                'interview_id': interview_details.get('interview_id'),
                'channel_id': interview_details.get('channel_id')
            },
            'interview_id': interview_details.get('interview_id'),
            'deletedFor': []
        }
        _, message_ref = self.db.collection('chats').document(chat_id).collection('messages').add(message_data)
        message_id = message_ref.id

        self.db.collection('chats').document(chat_id).update({
            'lastMessage': 'Entretien planifié',
            'lastMessageDocumentName': None,
            'lastMessageRead': False,
            'lastMessageSenderId': sender_id,
            'lastMessageTime': firestore.SERVER_TIMESTAMP,
            'lastMessageType': 'interview',
            'unreadCount_' + receiver_id: Increment(1)
        })
        logger.info(
            f"Interview message sent in chat {chat_id}: {message_id}, interview_id: {interview_details.get('interview_id')}, channel_id: {interview_details.get('channel_id')}")
        return message_id

    def send_contract_message(self, chat_id, sender_id, receiver_id, contract_details):
        """
        Envoie un message de contrat dans le chat.
        """
        try:
            # Récupérer le nom de l'entreprise
            company_doc = self.db.collection('users').document(sender_id).get()
            company_name = company_doc.to_dict().get('companyName',
                                                     'Entreprise') if company_doc.exists else 'Entreprise'

            # Message affiché
            content = f"{company_name} vous a envoyé un contrat à signer."

            # Données du message
            message_data = {
                'senderId': sender_id,
                'receiverId': receiver_id,
                'content': content,
                'type': 'contract',  # ← CRUCIAL : type = "contract"
                'contract_link': contract_details['contract_link'],
                'contract_id': contract_details['contract_id'],
                'position': contract_details['position'],
                'timestamp': firestore.SERVER_TIMESTAMP,
                'isRead': False
            }

            # Ajouter le message
            _, message_ref = self.db.collection('chats').document(chat_id).collection('messages').add(message_data)
            message_id = message_ref.id

            # Mettre à jour lastMessage
            self.db.collection('chats').document(chat_id).update({
                'lastMessage': content,
                'lastMessageTimestamp': firestore.SERVER_TIMESTAMP,
                'unreadCount': firestore.Increment(1) if receiver_id != sender_id else 0
            })

            logger.info(f"Message de contrat envoyé : {message_id}")
            return message_id

        except Exception as e:
            logger.error(f"Erreur envoi message contrat : {str(e)}")
            raise e

    def send_not_selected_message(self, chat_id, sender_id, receiver_id, not_selected_details):
        """Send a message indicating the candidate was not selected."""
        message_data = {
            'content': '',
            'senderId': sender_id,
            'receiverId': receiver_id,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'isRead': False,
            'imageUrl': None,
            'videoUrl': None,
            'documentUrl': None,
            'documentName': None,
            'audioUrl': None,
            'type': 'not_selected',
            'not_selected_details': {
                'position': not_selected_details.get('position'),
                'job_id': not_selected_details.get('job_id')
            },
            'deletedFor': []
        }
        _, message_ref = self.db.collection('chats').document(chat_id).collection('messages').add(message_data)
        message_id = message_ref.id

        self.db.collection('chats').document(chat_id).update({
            'lastMessage': f'Candidature non retenue pour: {not_selected_details.get("position")}',
            'lastMessageDocumentName': None,
            'lastMessageRead': False,
            'lastMessageSenderId': sender_id,
            'lastMessageTime': firestore.SERVER_TIMESTAMP,
            'lastMessageType': 'not_selected',
            'unreadCount_' + receiver_id: Increment(1)
        })
        logger.info(
            f"Not selected message sent in chat {chat_id}: {message_id}, job_id: {not_selected_details.get('job_id')}")
        return message_id

    def update_interview_message(self, chat_id, message_id, sender_id, receiver_id, interview_details):
        """Update an existing interview message with video call support."""
        message_data = {
            'content': '',
            'senderId': sender_id,
            'receiverId': receiver_id,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'isRead': False,
            'imageUrl': None,
            'videoUrl': None,
            'documentUrl': None,
            'documentName': None,
            'audioUrl': None,
            'type': 'interview',
            'interview_details': {
                'datetime': interview_details.get('datetime'),
                'type': interview_details.get('type'),
                'documents_to_bring': interview_details.get('documents_to_bring', []),
                'supplementary_document_url': interview_details.get('supplementary_document_url'),
                'supplementary_document_name': interview_details.get('supplementary_document_name'),
                'interview_id': interview_details.get('interview_id'),
                'channel_id': interview_details.get('channel_id')
            },
            'interview_id': interview_details.get('interview_id'),
            'deletedFor': []
        }
        self.db.collection('chats').document(chat_id).collection('messages').document(message_id).set(message_data)
        self.db.collection('chats').document(chat_id).update({
            'lastMessage': 'Entretien planifié',
            'lastMessageDocumentName': None,
            'lastMessageRead': False,
            'lastMessageSenderId': sender_id,
            'lastMessageTime': firestore.SERVER_TIMESTAMP,
            'lastMessageType': 'interview',
            'unreadCount_' + receiver_id: Increment(1)
        })
        logger.info(
            f"Interview message updated in chat {chat_id}: {message_id}, interview_id: {interview_details.get('interview_id')}, channel_id: {interview_details.get('channel_id')}")
        return message_id

    def send_file(self, chat_id, sender_id, receiver_id, file, file_type):
        """Upload a file to AWS S3 and send a message with the URL."""
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
                region_name=current_app.config['S3_REGION']
            )
            bucket_name = current_app.config['S3_BUCKET']
            file_name = f"chats/{chat_id}/{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{secure_filename(file.filename)}"
            s3_client.upload_fileobj(
                file, bucket_name, file_name,
                ExtraArgs={'ContentType': file.content_type}
            )
            file_url = f"https://{bucket_name}.s3.{current_app.config['S3_REGION']}.amazonaws.com/{file_name}"

            # CORRECTION ICI : on utilise le bon type
            message_data = {
                'content': '',
                'senderId': sender_id,
                'receiverId': receiver_id,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'isRead': False,
                'imageUrl': None,
                'videoUrl': None,
                'documentUrl': None,
                'documentName': None,
                'audioUrl': None,
                'type': file_type,  # 'image', 'video' ou 'document'
                'interview_details': None,
                'interview_id': None,
                'deletedFor': []
            }

            last_message = ''
            last_message_type = file_type

            if file_type == 'image':
                message_data['imageUrl'] = file_url
                last_message = 'Image'
            elif file_type == 'video':
                message_data['videoUrl'] = file_url
                last_message = 'Vidéo'
            elif file_type == 'document':
                # Si c'est un fichier audio (webm, mp3, etc.), on le traite comme audio
                if file.filename.lower().endswith(('.webm', '.mp3', '.wav', '.ogg', '.m4a')):
                    message_data['audioUrl'] = file_url
                    message_data['type'] = 'audio'  # CHANGEMENT ICI : type = 'audio'
                    last_message = 'Message vocal'
                    last_message_type = 'audio'
                else:
                    message_data['documentUrl'] = file_url
                    message_data['documentName'] = file.filename
                    last_message = f'Document : {file.filename}'
                    last_message_type = 'document'

            _, message_ref = self.db.collection('chats').document(chat_id).collection('messages').add(message_data)
            message_id = message_ref.id

            self.db.collection('chats').document(chat_id).update({
                'lastMessage': last_message,
                'lastMessageDocumentName': file.filename if file_type in ['document', 'audio'] else None,
                'lastMessageRead': False,
                'lastMessageSenderId': sender_id,
                'lastMessageTime': firestore.SERVER_TIMESTAMP,
                'lastMessageType': last_message_type,
                'unreadCount_' + receiver_id: Increment(1)
            })

            logger.info(f"File sent in chat {chat_id}: {message_id}, type={file_type}")
            return message_id

        except Exception as e:
            logger.error(f"Error uploading file to S3: {str(e)}")
            raise

    def get_chats_for_user(self, user_id):
        """Get all chats for a user."""
        chats_ref = self.db.collection('chats').where('participants', 'array_contains', user_id).stream()
        chats = []
        for doc in chats_ref:
            data = doc.to_dict()
            other_participant = [p for p in data['participants'] if p != user_id][0]
            other_user_doc = self.db.collection('users').document(other_participant).get()
            other_name = other_user_doc.to_dict().get('name', other_user_doc.to_dict().get('companyName',
                                                                                           'Anonyme')) if other_user_doc.exists else 'Anonyme'
            last_message = data.get('lastMessage', '')
            if data.get('lastMessageType') == 'image':
                last_message = 'Image'
            elif data.get('lastMessageType') == 'video':
                last_message = 'Video'
            elif data.get('lastMessageType') == 'document':
                last_message = f'Document: {data.get("lastMessageDocumentName", "Document")}'
            elif data.get('lastMessageType') == 'audio':
                last_message = 'Message vocal'
            elif data.get('lastMessageType') == 'interview':
                last_message = 'Entretien planifié'
            elif data.get('lastMessageType') == 'contract':
                last_message = f'Proposition de contrat: {data.get("lastMessage", "")}'
            elif data.get('lastMessageType') == 'not_selected':
                last_message = f'Candidature non retenue: {data.get("lastMessage", "")}'
            chats.append({
                'chatId': doc.id,
                'otherParticipantName': other_name,
                'lastMessage': last_message,
                'lastMessageTime': data.get('lastMessageTime', datetime.datetime.now()),
                'unreadCount': data.get(f'unreadCount_{user_id}', 0),
                'serviceId': data.get('serviceId', ''),
                'lastMessageType': data.get('lastMessageType', '')
            })
        return chats

    def get_messages_for_chat(self, chat_id):
        """Get all messages for a chat."""
        messages_ref = self.db.collection('chats').document(chat_id).collection('messages').order_by(
            'timestamp').stream()
        messages = []
        for doc in messages_ref:
            data = doc.to_dict()
            data['messageId'] = doc.id
            messages.append(data)
        return messages

    def mark_messages_read(self, chat_id, user_id):
        """Mark messages as read for a user."""
        messages_ref = self.db.collection('chats').document(chat_id).collection('messages').where('receiverId', '==',
                                                                                                  user_id).where(
            'isRead', '==', False).stream()
        batch = self.db.batch()
        for doc in messages_ref:
            batch.update(doc.reference, {'isRead': True})
        batch.commit()
        self.db.collection('chats').document(chat_id).update({f'unreadCount_{user_id}': 0})

    def save_evaluation(self, interview_id, evaluation_data):
        """Save evaluation data for an interview."""
        try:
            self.db.collection('interviews').document(interview_id).update({
                'evaluation': evaluation_data,
                'status': 'evaluated',
                'evaluated_at': firestore.SERVER_TIMESTAMP
            })
            logger.info(f"Évaluation enregistrée pour interview_id: {interview_id}")
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde de l'évaluation pour interview_id {interview_id}: {str(e)}")
            raise

    def notify_call(self, interview_id, channel_id, caller_id, receiver_id, chat_id, join_link):
        """Create a call notification for a video or phone interview."""
        try:
            notification_data = {
                'interview_id': interview_id,
                'channel_id': channel_id,
                'caller_id': caller_id,
                'receiver_id': receiver_id,
                'chat_id': chat_id,
                'status': 'pending',
                'created_at': firestore.SERVER_TIMESTAMP,
                'join_link': join_link
            }
            notification_ref = self.db.collection('call_notifications').add(notification_data)
            notification_id = notification_ref[1].id
            logger.info(f"Call notification created: {notification_id} for interview_id: {interview_id}")
            return notification_id
        except Exception as e:
            logger.error(f"Error creating call notification for interview_id {interview_id}: {str(e)}")
            raise

    def end_call(self, interview_id, chat_id):
        """Update call notification status to ended."""
        try:
            notifications_ref = self.db.collection('call_notifications').where('interview_id', '==',
                                                                               interview_id).where('chat_id', '==',
                                                                                                   chat_id).where(
                'status', '==', 'pending').get()
            batch = self.db.batch()
            for doc in notifications_ref:
                batch.update(doc.reference, {'status': 'ended', 'ended_at': firestore.SERVER_TIMESTAMP})
            batch.commit()
            logger.info(f"Call notifications updated to ended for interview_id: {interview_id}")
        except Exception as e:
            logger.error(f"Error updating call notifications for interview_id {interview_id}: {str(e)}")
            raise
