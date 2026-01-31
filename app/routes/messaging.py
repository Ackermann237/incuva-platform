import hashlib

from flask import Blueprint, render_template, session, redirect, url_for, request, flash, jsonify, g, current_app
import logging
import datetime
import boto3
from werkzeug.utils import secure_filename
from firebase_admin import firestore
import json
import uuid
import requests

logger = logging.getLogger(__name__)
messaging_bp = Blueprint('messaging', __name__, url_prefix='/messaging', template_folder='templates/messaging')


@messaging_bp.route('/inbox', methods=['GET'])
def api_inbox():
    """Retourne la liste des chats de l'utilisateur."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    try:
        chats = g.messaging_service.get_chats_for_user(user_id)
        return jsonify({'success': True, 'chats': chats}), 200
    except Exception as e:
        logger.error(f"Erreur récupération inbox pour {user_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@messaging_bp.route('/conversation/<chat_id>', methods=['GET'])
def api_conversation(chat_id):
    """Retourne les informations d'une conversation."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    chat_doc = g.db.collection('chats').document(chat_id).get()
    if not chat_doc.exists:
        return jsonify({'success': False, 'error': 'Conversation non trouvée'}), 404

    chat_data = chat_doc.to_dict()
    if user_id not in chat_data['participants']:
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    # Identifier l'autre participant
    other_id = [p for p in chat_data['participants'] if p != user_id][0]
    other_user_doc = g.db.collection('users').document(other_id).get()
    other_data = other_user_doc.to_dict()

    if other_data.get('accountType') == 'company':
        other_name = other_data.get('companyName') or other_data.get('name', 'Anonyme')
    else:
        other_name = other_data.get('name', 'Anonyme')

    # Messages
    try:
        messages = g.messaging_service.get_messages_for_chat(chat_id)
        g.messaging_service.mark_messages_read(chat_id, user_id)

        # Récupérons le type de compte
        current_user_doc = g.db.collection('users').document(user_id).get()
        current_user_doc = g.db.collection('users').document(user_id).get()
        current_user_data = current_user_doc.to_dict()
        current_user_name = current_user_data.get('name', 'Moi')
        if current_user_data.get('accountType') == 'company':
            current_user_name = current_user_data.get('companyName') or current_user_name
        current_account_type = current_user_doc.to_dict().get('accountType',
                                                              'individual') if current_user_doc.exists else 'individual'
        return jsonify({
            'success': True,
            'chat_id': chat_id,
            'messages': messages,
            'otherParticipantName': other_name,
            'serviceId': chat_data.get('serviceId'),
            'other_participant_id': other_id,
            'current_account_type': current_account_type,
            'current_user_id': user_id,
            'current_user_name': current_user_name,
            'firebase_config': {
                'apiKey': current_app.config.get('FIREBASE_API_KEY'),
                'authDomain': current_app.config.get('FIREBASE_AUTH_DOMAIN'),
                'projectId': current_app.config.get('FIREBASE_PROJECT_ID'),
                'storageBucket': current_app.config.get('FIREBASE_STORAGE_BUCKET'),
                'messagingSenderId': current_app.config.get('FIREBASE_MESSAGING_SENDER_ID'),
                'appId': current_app.config.get('FIREBASE_APP_ID')
            },
            'agora_app_id': current_app.config.get('AGORA_APP_ID')
        }), 200
    except Exception as e:
        logger.error(f"Erreur récupération conversation {chat_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@messaging_bp.route('/messages/<chat_id>', methods=['GET'])
def api_get_messages(chat_id):
    """Retourne les messages d'une conversation, optionnellement depuis lastMessageId."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    last_message_id = request.args.get('lastMessageId', '')

    chat_doc = g.db.collection('chats').document(chat_id).get()
    if not chat_doc.exists or user_id not in chat_doc.to_dict()['participants']:
        return jsonify({'success': False, 'error': 'Conversation non trouvée ou accès non autorisé'}), 403

    try:
        messages = []
        query = g.db.collection('chats').document(chat_id).collection('messages').order_by('timestamp')
        if last_message_id:
            last_doc = g.db.collection('chats').document(chat_id).collection('messages').document(last_message_id).get()
            if last_doc.exists:
                query = query.start_after(last_doc)

        for doc in query.stream():
            msg = doc.to_dict()
            msg['messageId'] = doc.id
            msg['timestamp'] = msg['timestamp'].isoformat() if msg.get('timestamp') else None
            messages.append(msg)

        return jsonify({'success': True, 'messages': messages}), 200
    except Exception as e:
        logger.error(f"Erreur récupération messages {chat_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@messaging_bp.route('/start_conversation', methods=['POST'])
def api_start_conversation():
    """Démarre ou récupère une conversation entre une entreprise et un candidat pour un job."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    company_id = session['uid']
    data = request.get_json()
    candidate_id = data.get('candidate_id')
    job_id = data.get('job_id')

    if not candidate_id or not job_id:
        return jsonify({'success': False, 'error': 'Paramètres manquants (candidate_id ou job_id)'}), 400

    try:
        job_doc = g.db.collection('jobs').document(job_id).get()
        if not job_doc.exists or job_doc.to_dict()['company_id'] != company_id:
            return jsonify({'success': False, 'error': 'Offre non trouvée ou accès non autorisé'}), 403

        chat_id = g.messaging_service.get_existing_chat(company_id, candidate_id, job_id)
        if not chat_id:
            chat_id = g.messaging_service.create_chat(company_id, candidate_id, job_id)

        return jsonify({'success': True, 'chat_id': chat_id}), 200
    except Exception as e:
        logger.error(f"Erreur start_conversation: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@messaging_bp.route('/send_message', methods=['POST'])
def send_message():
    if 'uid' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    data = request.json
    chat_id = data.get('chat_id')
    content = data.get('content')
    receiver_id = data.get('receiver_id')

    if not chat_id or not content or not receiver_id:
        return jsonify({'error': 'Paramètres manquants'}), 400

    try:
        message_id = g.messaging_service.send_message(chat_id, user_id, receiver_id, content)
        return jsonify({'success': True, 'message_id': message_id}), 200
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du message : {str(e)}")
        return jsonify({'error': str(e)}), 500


@messaging_bp.route('/send_file', methods=['POST'])
def send_file():
    if 'uid' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    # AJOUT DES LOGS DÉTAILLÉS
    logger.info("=== DÉBUT ENVOI FICHIER ===")
    logger.info(f"Form data reçu: {dict(request.form)}")
    logger.info(f"Files reçu: {list(request.files.keys())}")
    logger.info(f"Contenu de 'file': {request.files.get('file')}")

    user_id = session['uid']
    chat_id = request.form.get('chat_id')
    receiver_id = request.form.get('receiver_id')
    file_type = request.form.get('file_type')
    file = request.files.get('file')

    logger.info(f"chat_id: {chat_id}")
    logger.info(f"receiver_id: {receiver_id}")
    logger.info(f"file_type: {file_type}")
    logger.info(f"file présent: {file is not None}")
    if file:
        logger.info(f"Nom fichier: {file.filename}, taille: {getattr(file, 'content_length', 'inconnu')}")
        file.seek(0)  # <-- IMPORTANT : remettre au début
        # SUPPRIME TOUTE LIGNE AVEC file.read() ici !!!

    # Vérification taille plus propre
    if file and getattr(file, 'content_length', 0) == 0:
        # On teste si on peut lire un octet
        first_byte = file.stream.read(1)
        file.stream.seek(0)
        if not first_byte:
            return jsonify({'error': 'Fichier vide ou corrompu'}), 400
        # Fichier non vide, mais content_length manquant → on accepte quand même
    else:
        if file and getattr(file, 'content_length', 0) == 0:
            return jsonify({'error': 'Fichier vide ou corrompu'}), 400

    missing = []
    if not chat_id: missing.append('chat_id')
    if not receiver_id: missing.append('receiver_id')
    if not file_type: missing.append('file_type')
    if not file: missing.append('file')

    if missing:
        logger.warning(f"Paramètres manquants: {missing}")
        return jsonify({'error': f'Paramètres manquants: {", ".join(missing)}'}), 400

    if not chat_id or not receiver_id or not file_type or not file:
        return jsonify({'error': 'Paramètres manquants (chat_id, receiver_id, file_type, ou file)'}), 400

    if file_type not in ['image', 'video', 'document']:
        return jsonify({'error': 'Type de fichier non valide'}), 400

    allowed_extensions = {
        'image': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'video': ['mp4', 'mov', 'avi'],
        'document': ['pdf', 'doc', 'docx', 'webm', 'mp3', 'wav', 'ogg', 'm4a']
    }
    file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    if file_ext not in allowed_extensions[file_type]:
        return jsonify({'error': f'Extension de fichier non autorisée pour {file_type}'}), 400

    try:
        message_id = g.messaging_service.send_file(chat_id, user_id, receiver_id, file, file_type)
        return jsonify({'success': True, 'message_id': message_id}), 200
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du fichier : {str(e)}")
        return jsonify({'error': str(e)}), 500


@messaging_bp.route('/interview_details/<interview_id>', methods=['GET'])
def get_interview_details(interview_id):
    if 'uid' not in session:
        logger.error(f"Tentative d'accès non authentifié à interview_details pour interview_id: {interview_id}")
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    logger.info(f"Récupération des détails de l'entretien pour interview_id: {interview_id}, user_id: {user_id}")
    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            logger.error(f"Entretien non trouvé dans Firestore pour interview_id: {interview_id}")
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        logger.debug(f"Détails de l'entretien récupérés: {interview_data}")
        if interview_data['company_id'] != user_id and interview_data['candidate_id'] != user_id:
            logger.error(
                f"Accès non autorisé: utilisateur {user_id} n'est pas le company_id {interview_data['company_id']} ni le candidate_id {interview_data['candidate_id']} pour interview_id: {interview_id}")
            return jsonify({'error': 'Accès non autorisé à cet entretien'}), 403

        return jsonify({
            'success': True,
            'interview': {
                'chat_id': interview_data.get('chat_id'),  # AJOUTÉ ICI
                'datetime': interview_data['datetime'].strftime('%Y-%m-%d %H:%M') if interview_data.get('datetime') else '',
                'type': interview_data.get('type', 'in_person'),
                'documents_to_bring': interview_data.get('documents_to_bring', []),
                'supplementary_document_url': interview_data.get('supplementary_document_url'),
                'supplementary_document_name': interview_data.get('supplementary_document_name'),
                'message_id': interview_data.get('message_id'),
                'channel_id': interview_data.get('channel_id'),
                'company_id': interview_data.get('company_id'),
                'candidate_id': interview_data.get('candidate_id'),
            }
        }), 200
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des détails de l'entretien {interview_id}: {str(e)}")
        return jsonify({'error': f"Erreur serveur: {str(e)}"}), 500


@messaging_bp.route('/schedule_interview', methods=['POST'])
def schedule_interview():
    if 'uid' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    chat_id = request.form.get('chat_id')
    receiver_id = request.form.get('receiver_id')
    interview_id = request.form.get('interview_id')
    message_id = request.form.get('message_id')
    datetime_str = request.form.get('datetime')
    interview_type = request.form.get('type')
    documents_to_bring = request.form.get('documents_to_bring')
    supplementary_document = request.files.get('supplementary_document')

    if not all([chat_id, receiver_id, datetime_str, interview_type]):
        return jsonify({'error': 'Paramètres manquants'}), 400

    if interview_type not in ['in_person', 'video', 'phone']:
        return jsonify({'error': 'Type d\'entretien non valide'}), 400

    try:
        documents_to_bring = json.loads(documents_to_bring) if documents_to_bring else []
        interview_datetime = datetime.datetime.strptime(datetime_str.replace("T", " "), "%Y-%m-%d %H:%M")
        if interview_datetime < datetime.datetime.now():
            return jsonify({'error': 'La date de l\'entretien doit être dans le futur'}), 400

        user_doc = g.db.collection('users').document(user_id).get()
        if not user_doc.exists or user_doc.to_dict().get('accountType') != 'company':
            return jsonify({'error': 'Seules les entreprises peuvent planifier des entretiens'}), 403

        chat_doc = g.db.collection('chats').document(chat_id).get()
        chat_data = chat_doc.to_dict()
        if not chat_doc.exists or user_id not in chat_data.get('participants', []):
            return jsonify({'error': 'Conversation non trouvée ou accès non autorisé'}), 403

        job_id = chat_data.get('serviceId')
        if not job_id:
            return jsonify({'error': 'Aucun service lié à ce chat'}), 400

        supplementary_document_url = None
        supplementary_document_name = None
        if supplementary_document:
            file_ext = supplementary_document.filename.rsplit('.', 1)[1].lower() if '.' in supplementary_document.filename else ''
            if file_ext not in ['pdf', 'doc', 'docx']:
                return jsonify({'error': 'Extension de fichier non autorisée'}), 400

            s3_client = boto3.client(
                's3',
                aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
                region_name=current_app.config['S3_REGION']
            )
            bucket_name = current_app.config['S3_BUCKET']
            file_name = f"interviews/{chat_id}/{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{secure_filename(supplementary_document.filename)}"
            s3_client.upload_fileobj(
                supplementary_document,
                bucket_name,
                file_name,
                ExtraArgs={'ContentType': supplementary_document.content_type}
            )
            supplementary_document_url = f"https://{bucket_name}.s3.{current_app.config['S3_REGION']}.amazonaws.com/{file_name}"
            supplementary_document_name = supplementary_document.filename

        channel_id = str(uuid.uuid4()) if interview_type in ['video', 'phone'] else None

        interview_data = {
            'chat_id': chat_id,
            'company_id': user_id,
            'candidate_id': receiver_id,
            'job_id': job_id,
            'datetime': interview_datetime,
            'type': interview_type,
            'documents_to_bring': documents_to_bring,
            'supplementary_document_url': supplementary_document_url,
            'supplementary_document_name': supplementary_document_name,
            'status': 'scheduled',
            'created_at': firestore.SERVER_TIMESTAMP,
            'channel_id': channel_id
        }

        if interview_id:
            g.db.collection('interviews').document(interview_id).update(interview_data)
            interview_ref_id = interview_id
        else:
            write_result, interview_ref = g.db.collection('interviews').add(interview_data)
            interview_ref_id = interview_ref.id

        message_id = g.messaging_service.send_interview_message(
            chat_id=chat_id,
            sender_id=user_id,
            receiver_id=receiver_id,
            interview_details={
                'datetime': datetime_str,
                'type': interview_type,
                'documents_to_bring': documents_to_bring,
                'supplementary_document_url': supplementary_document_url,
                'supplementary_document_name': supplementary_document_name,
                'interview_id': interview_ref_id,
                'channel_id': channel_id
            }
        )

        g.db.collection('interviews').document(interview_ref_id).update({'message_id': message_id})

        logger.info(f"Interview {'updated' if interview_id else 'scheduled'}: {interview_ref_id}")
        return jsonify({
            'success': True,
            'message_id': message_id,
            'interview_id': interview_ref_id  # <‑‑ AJOUT
        }), 200

    except Exception as e:
        logger.error(f"Erreur lors de la planification de l'entretien : {str(e)}")
        return jsonify({'error': str(e)}), 500


# === CHAT DÉDIÉ À L’ENTRETIEN ===
@messaging_bp.route('/interview_chat/<interview_id>', methods=['GET'])
def get_interview_chat(interview_id):
    if 'uid' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    user_id = session['uid']
    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        if interview_data['company_id'] != user_id and interview_data['candidate_id'] != user_id:
            return jsonify({'error': 'Accès refusé'}), 403

        messages_ref = g.db.collection('interview_chats').document(interview_id).collection('messages')\
            .order_by('timestamp').stream()

        messages = []
        for doc in messages_ref:
            msg = doc.to_dict()
            msg['messageId'] = doc.id
            if msg.get('timestamp'):
                msg['timestamp'] = msg['timestamp'].isoformat()
            messages.append(msg)

        return jsonify({'success': True, 'messages': messages}), 200
    except Exception as e:
        logger.error(f"Erreur lecture chat entretien {interview_id}: {e}")
        return jsonify({'error': str(e)}), 500


@messaging_bp.route('/send_interview_chat_message', methods=['POST'])
def send_interview_message():
    if 'uid' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    user_id = session['uid']
    data = request.get_json()
    interview_id = data.get('interview_id')
    content = data.get('content')

    if not interview_id or not content:
        return jsonify({'error': 'Paramètres manquants'}), 400

    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        if interview_data['company_id'] != user_id and interview_data['candidate_id'] != user_id:
            return jsonify({'error': 'Accès refusé'}), 403

        msg_data = {
            'senderId': user_id,
            'content': content.strip(),
            'timestamp': firestore.SERVER_TIMESTAMP
        }

        g.db.collection('interview_chats').document(interview_id).collection('messages').add(msg_data)
        return jsonify({'success': True}), 200
    except Exception as e:
        logger.error(f"Erreur envoi message entretien: {e}")
        return jsonify({'error': str(e)}), 500

@messaging_bp.route('/cancel_interview/<interview_id>', methods=['POST'])
def cancel_interview(interview_id):
    if 'uid' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    data = request.json
    chat_id = data.get('chat_id')
    requester_id = data.get('user_id')

    if not chat_id or requester_id != user_id:
        return jsonify({'error': 'Paramètres manquants ou utilisateur non autorisé'}), 400

    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            logger.error(f"Entretien non trouvé : {interview_id}")
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        if interview_data['company_id'] != user_id:
            logger.error(
                f"Accès non autorisé : utilisateur {user_id} n'est pas le company_id {interview_data['company_id']} pour l'entretien {interview_id}")
            return jsonify({'error': 'Accès non autorisé à cet entretien'}), 403

        g.db.collection('interviews').document(interview_id).update({'status': 'cancelled'})

        message_id = interview_data.get('message_id')
        if message_id:
            g.db.collection('chats').document(chat_id).collection('messages').document(message_id).update({
                'type': 'text',
                'content': 'L\'entretien a été annulé. Souhaitez-vous re-planifier ?',
                'interview_details': None,
                'timestamp': firestore.SERVER_TIMESTAMP
            })

        return jsonify({'success': True}), 200
    except Exception as e:
        logger.error(f"Erreur lors de l'annulation de l'entretien {interview_id} : {str(e)}")
        return jsonify({'error': str(e)}), 500


@messaging_bp.route('/mark_candidate_not_selected/<interview_id>', methods=['POST'])
def mark_candidate_not_selected(interview_id):
    if 'uid' not in session:
        logger.error(
            f"Tentative d'accès non authentifié à mark_candidate_not_selected pour interview_id: {interview_id}")
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    data = request.json
    chat_id = data.get('chat_id')
    requester_id = data.get('user_id')

    if not chat_id or requester_id != user_id:
        logger.error(f"Paramètres manquants ou utilisateur non autorisé pour interview_id: {interview_id}")
        return jsonify({'error': 'Paramètres manquants ou utilisateur non autorisé'}), 400

    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            logger.error(f"Entretien non trouvé : {interview_id}")
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        if interview_data['company_id'] != user_id:
            logger.error(
                f"Accès non autorisé : utilisateur {user_id} n'est pas le company_id {interview_data['company_id']} pour l'entretien {interview_id}")
            return jsonify({'error': 'Accès non autorisé à cet entretien'}), 403

        job_doc = g.db.collection('jobs').document(interview_data['job_id']).get()
        if not job_doc.exists:
            logger.error(f"Offre d'emploi non trouvée pour job_id: {interview_data['job_id']}")
            return jsonify({'error': 'Offre d\'emploi non trouvée'}), 404

        job_data = job_doc.to_dict()
        not_selected_details = {
            'position': job_data.get('title', 'Poste non spécifié'),
            'job_id': interview_data['job_id']
        }

        message_id = g.messaging_service.send_not_selected_message(
            chat_id=chat_id,
            sender_id=user_id,
            receiver_id=interview_data['candidate_id'],
            not_selected_details=not_selected_details
        )

        g.db.collection('interviews').document(interview_id).update({
            'status': 'not_selected',
            'not_selected_at': firestore.SERVER_TIMESTAMP
        })

        logger.info(f"Candidat marqué comme non retenu pour interview_id: {interview_id}, message_id: {message_id}")
        return jsonify({'success': True, 'message_id': message_id}), 200
    except Exception as e:
        logger.error(f"Erreur lors du marquage du candidat comme non retenu pour interview_id {interview_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


@messaging_bp.route('/save_evaluation/<interview_id>', methods=['POST'])
def save_evaluation(interview_id):
    if 'uid' not in session:
        logger.error(f"Tentative d'accès non authentifié à save_evaluation pour interview_id: {interview_id}")
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    evaluation_data = request.json
    logger.info(f"Sauvegarde de l'évaluation pour interview_id: {interview_id}, user_id: {user_id}")

    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            logger.error(f"Entretien non trouvé dans Firestore pour interview_id: {interview_id}")
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        if interview_data['company_id'] != user_id:
            logger.error(
                f"Accès non autorisé: utilisateur {user_id} n'est pas le company_id {interview_data['company_id']}")
            return jsonify({'error': 'Accès non autorisé à cet entretien'}), 403

        required_keys = ['checklist', 'notes_technical', 'notes_softskills', 'technical_score', 'communication_score',
                         'evaluated_at']
        if not all(key in evaluation_data for key in required_keys):
            logger.error(f"Données d'évaluation incomplètes pour interview_id: {interview_id}")
            return jsonify({'error': 'Données d\'évaluation incomplètes'}), 400

        checklist_keys = ['presentation', 'technical_questions', 'company_discussion']
        if not all(key in evaluation_data['checklist'] for key in checklist_keys):
            logger.error(f"Checklist incomplète pour interview_id: {interview_id}")
            return jsonify({'error': 'Checklist d\'évaluation incomplète'}), 400

        if not (1 <= evaluation_data['technical_score'] <= 10 and 1 <= evaluation_data['communication_score'] <= 10):
            logger.error(f"Scores d'évaluation hors limites pour interview_id: {interview_id}")
            return jsonify({'error': 'Les scores doivent être compris entre 1 et 10'}), 400

        g.messaging_service.save_evaluation(interview_id, evaluation_data)
        logger.info(f"Évaluation enregistrée pour interview_id: {interview_id}")
        return jsonify({'success': True}), 200
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde de l'évaluation pour interview_id {interview_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


@messaging_bp.route('/notify_call', methods=['POST'])
def notify_call():
    if 'uid' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    data = request.json
    interview_id = data.get('interview_id')
    channel_id = data.get('channel_id')
    caller_id = data.get('caller_id')
    receiver_id = data.get('receiver_id')
    chat_id = data.get('chat_id')

    if not all([interview_id, channel_id, caller_id, receiver_id, chat_id]):
        return jsonify({'error': 'Paramètres manquants'}), 400

    if caller_id != user_id:
        return jsonify({'error': 'Utilisateur non autorisé à initier l\'appel'}), 403

    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            logger.error(f"Entretien non trouvé : {interview_id}")
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        if interview_data['company_id'] != user_id or interview_data['candidate_id'] != receiver_id:
            logger.error(f"Accès non autorisé pour l'entretien {interview_id}")
            return jsonify({'error': 'Accès non autorisé à cet entretien'}), 403

        # Generate Agora token for the candidate
        app_id = current_app.config['AGORA_APP_ID']
        app_certificate = current_app.config['AGORA_APP_CERTIFICATE']
        expiration_time = 3600  # 1 hour
        current_timestamp = int(datetime.datetime.now().timestamp())
        candidate_token = generate_agora_token(app_id, app_certificate, channel_id, receiver_id, current_timestamp,
                                               expiration_time)

        # Create a secure join link
        join_link = f"/messaging/join_call/{interview_id}/{channel_id}/{receiver_id}/{candidate_token}"

        # Send notification and message with the join link
        notification_id = g.messaging_service.notify_call(
            interview_id=interview_id,
            channel_id=channel_id,
            caller_id=caller_id,
            receiver_id=receiver_id,
            chat_id=chat_id,
            join_link=join_link
        )

        # Send a message to the chat with the join link
        message_content = f"Appel vidéo démarré. Rejoignez l'entretien ici : {request.host_url.rstrip('/')}{join_link}"
        g.messaging_service.send_message(
            chat_id=chat_id,
            sender_id=user_id,
            receiver_id=receiver_id,
            content=message_content
        )

        logger.info(f"Notification d'appel créée: {notification_id} pour interview_id: {interview_id}")
        return jsonify({'success': True, 'notification_id': notification_id, 'join_link': join_link}), 200
    except Exception as e:
        logger.error(
            f"Erreur lors de la création de la notification d'appel pour interview_id {interview_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


@messaging_bp.route('/end_call', methods=['POST'])
def end_call():
    if 'uid' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    data = request.json
    interview_id = data.get('interview_id')
    chat_id = data.get('chat_id')

    if not interview_id or not chat_id:
        return jsonify({'error': 'Paramètres manquants (interview_id ou chat_id)'}), 400

    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            logger.error(f"Entretien non trouvé : {interview_id}")
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        if interview_data['company_id'] != user_id and interview_data['candidate_id'] != user_id:
            logger.error(f"Accès non autorisé pour l'entretien {interview_id}")
            return jsonify({'error': 'Accès non autorisé à cet entretien'}), 403

        g.messaging_service.end_call(interview_id, chat_id)
        logger.info(f"Appel terminé pour interview_id: {interview_id}")
        return jsonify({'success': True}), 200
    except Exception as e:
        logger.error(f"Erreur lors de la terminaison de l'appel pour interview_id {interview_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


def generate_agora_uid(firebase_uid):
    """Convertit un Firebase UID en entier valide pour Agora (1 à 2³¹-1)"""
    # Hash SHA-1 → 160 bits → on prend les 31 premiers bits
    hash_bytes = hashlib.sha1(firebase_uid.encode('utf-8')).digest()
    uid = int.from_bytes(hash_bytes[:4], 'big')  # 4 octets = 32 bits
    uid = uid & 0x7FFFFFFF  # Masque 31 bits
    return uid if uid > 0 else 1  # Agora refuse 0


@messaging_bp.route('/get_video_token/<interview_id>', methods=['POST'])
def get_video_token(interview_id):
    if 'uid' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        if interview_data['company_id'] != user_id and interview_data['candidate_id'] != user_id:
            return jsonify({'error': 'Accès non autorisé'}), 403

        channel_id = interview_data.get('channel_id')
        if not channel_id:
            return jsonify({'error': 'Aucun canal disponible'}), 400

        app_id = current_app.config['AGORA_APP_ID']
        app_certificate = current_app.config['AGORA_APP_CERTIFICATE']

        # UID UNIQUE MÊME SI MÊME UTILISATEUR + MÊME COMPTE OUVERT PLUSIEURS FOIS
        # On combine l'UID Firebase + timestamp + random
        import random
        base = abs(hash(user_id + str(datetime.datetime.now().second) + str(random.randint(1, 1000))))
        uid_int = (base % 4294967294) + 1  # 1 à 2^32-2

        expiration_time = 3600
        current_timestamp = int(datetime.datetime.now().timestamp())
        token = generate_agora_token(app_id, app_certificate, channel_id, uid_int, current_timestamp, expiration_time)

        return jsonify({
            'success': True,
            'token': token,
            'channel_id': channel_id,
            'app_id': app_id,
            'uid': uid_int
        }), 200

    except Exception as e:
        logger.error(f"Erreur génération token: {str(e)}")
        return jsonify({'error': str(e)}), 500


@messaging_bp.route('/api/join_call/<interview_id>/<channel_id>/<user_id>/<token>', methods=['GET'])
def join_call(interview_id, channel_id, user_id, token):
    if 'uid' not in session:
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    if session['uid'] != user_id:
        return jsonify({'error': 'Utilisateur non autorisé'}), 403

    try:
        interview_doc = g.db.collection('interviews').document(interview_id).get()
        if not interview_doc.exists:
            logger.error(f"Entretien non trouvé : {interview_id}")
            return jsonify({'error': 'Entretien non trouvé'}), 404

        interview_data = interview_doc.to_dict()
        if interview_data['candidate_id'] != user_id:
            logger.error(
                f"Accès non autorisé : utilisateur {user_id} n'est pas le candidat pour l'entretien {interview_id}")
            return jsonify({'error': 'Accès non autorisé à cet entretien'}), 403

        if interview_data['channel_id'] != channel_id:
            logger.error(f"Canal non valide pour l'entretien {interview_id}")
            return jsonify({'error': 'Canal non valide'}), 400

        # Validate token (simplified validation placeholder)
        # (You might include more sophisticated validation logic here)
        is_token_valid = True  # Add logic for token validation as necessary
        if not is_token_valid:
            return jsonify({'error': 'Token invalide'}), 401

        response_data = {
            'interview_id': interview_id,
            'channel_id': channel_id,
            'user_id': user_id,
            'token': token,
            'agora_app_id': current_app.config.get('AGORA_APP_ID'),
            'firebase_config': {
                'apiKey': current_app.config.get('FIREBASE_API_KEY'),
                'authDomain': current_app.config.get('FIREBASE_AUTH_DOMAIN'),
                'projectId': current_app.config.get('FIREBASE_PROJECT_ID'),
                'storageBucket': current_app.config.get('FIREBASE_STORAGE_BUCKET'),
                'messagingSenderId': current_app.config.get('FIREBASE_MESSAGING_SENDER_ID'),
                'appId': current_app.config.get('FIREBASE_APP_ID')
            }
        }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Erreur lors de l'accès à l'appel pour interview_id {interview_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


def generate_agora_token(app_id, app_certificate, channel_name, uid, current_timestamp, expiration_time):
    from agora_token_builder.RtcTokenBuilder import RtcTokenBuilder

    PUBLISHER_ROLE = 1
    token = RtcTokenBuilder.buildTokenWithUid(
        app_id,
        app_certificate,
        channel_name,
        uid,
        PUBLISHER_ROLE,
        current_timestamp + expiration_time
    )
    return token
