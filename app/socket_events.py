# app/socket_events.py
from flask import request, session
from flask_socketio import emit, join_room, leave_room
import logging

logger = logging.getLogger(__name__)

def init_socket_events(socketio, app):
    @socketio.on('connect')
    def handle_connect():
        if 'uid' not in session:
            return False  # Rejette la connexion si non authentifié
        user_id = session['uid']
        logger.info(f"User {user_id} connecté via WebSocket")
        emit('connected', {'data': 'Connected'})

    @socketio.on('join_chat')
    def handle_join_chat(data):
        if 'uid' not in session:
            return
        chat_id = data.get('chat_id')
        if chat_id:
            join_room(chat_id)
            logger.info(f"User {session['uid']} a rejoint le chat {chat_id}")
            emit('joined_chat', {'chat_id': chat_id})

    @socketio.on('leave_chat')
    def handle_leave_chat(data):
        if 'uid' not in session:
            return
        chat_id = data.get('chat_id')
        if chat_id:
            leave_room(chat_id)
            logger.info(f"User {session['uid']} a quitté le chat {chat_id}")

    @socketio.on('typing')
    def handle_typing(data):
        if 'uid' not in session:
            return
        chat_id = data.get('chat_id')
        is_typing = data.get('is_typing', False)
        if chat_id:
            emit('user_typing', {
                'user_id': session['uid'],
                'is_typing': is_typing
            }, room=chat_id, include_self=False)

    @socketio.on('disconnect')
    def handle_disconnect():
        logger.info(f"User {session.get('uid', 'unknown')} déconnecté")