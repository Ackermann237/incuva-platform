from datetime import datetime

from flask import Blueprint, session, request, jsonify
from firebase_admin import firestore
from collections import defaultdict
import os
from werkzeug.utils import secure_filename
from ..services.job_service import JobService
from ..services.recruitment_service import RecruitmentService
from ..services.favorite_service import FavoriteService
from ..ai.copilote import generate_bi_insights
from ..firebase.init_firebase import db
import logging

logger = logging.getLogger(__name__)

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')


@dashboard_bp.route('/user_dashboard', methods=['GET'])
def user_dashboard_api():
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    user_doc = db.collection('users').document(session['uid']).get()
    if not user_doc.exists:
        logger.warning(f"User {session['uid']} not found in Firestore")
        return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404

    user = user_doc.to_dict()
    job_service = JobService(db)
    recruitment_service = RecruitmentService(db)
    favorite_service = FavoriteService(db)

    response_data = {'user': user}

    if user.get('accountType') == 'individual':
        # 🔹 Jobs recommandés
        jobs = job_service.get_jobs_by_company(None, limit=4)
        response_data['jobs'] = jobs

        # 🔹 Candidatures
        applications = recruitment_service.get_user_applications(session['uid'])
        response_data['applications'] = applications

        # 🔹 Entretiens, taux de réussite, posts sociaux et points fidélité (mock)
        response_data.update({
            'interviews': [],
            'success_rate': 0,
            'social_posts': [],
            'loyalty_points': 0,
            'discounts': 0,
        })

        # 🔹 Vérifier existence d'une position
        position_ref = db.collection('users').document(session['uid']).collection('position').limit(1).get()
        response_data['has_position'] = len(position_ref) > 0

    else:
        # 🔹 Metrics entreprise
        metrics = recruitment_service.get_recruitment_metrics(session['uid'])
        favorite_count = favorite_service.get_favorite_count(session['uid'])
        applications = recruitment_service.get_all_applications(session['uid'])
        response_data.update({
            'metrics': metrics,
            'favorite_count': favorite_count,
            'applications': applications,
        })

        # 🔹 Vérifier existence d'une position
        position_ref = db.collection('users').document(session['uid']).collection('position').limit(1).get()
        response_data['has_position'] = len(position_ref) > 0

        # 🔹 Contrats
        agreements_ref = db.collection('contracts').where('company_id', '==', session['uid']).stream()
        agreements = []
        for contract_doc in agreements_ref:
            contract_data = contract_doc.to_dict()
            contract_data['contract_id'] = contract_doc.id
            candidate_doc = db.collection('users').document(contract_data['candidate_id']).get()
            contract_data['candidate_name'] = candidate_doc.to_dict().get('name', 'Anonyme') if candidate_doc.exists else 'Anonyme'
            agreements.append(contract_data)
        response_data['agreements'] = agreements
        response_data['agreements_count'] = len(agreements)

        # 🔹 Entretiens et refus
        interviews_ref = db.collection('interviews').where('company_id', '==', session['uid']).stream()
        interviews = []
        rejections = []
        for interview_doc in interviews_ref:
            interview_data = interview_doc.to_dict()
            interview_data['interview_id'] = interview_doc.id

            candidate_doc = db.collection('users').document(interview_data['candidate_id']).get()
            interview_data['candidate_name'] = candidate_doc.to_dict().get('name', 'Anonyme') if candidate_doc.exists else 'Anonyme'

            job_doc = db.collection('jobs').document(interview_data['job_id']).get()
            interview_data['job_title'] = job_doc.to_dict().get('title', 'Poste inconnu') if job_doc.exists else 'Poste inconnu'

            interviews.append(interview_data)
            if interview_data.get('status') == 'not_selected':
                rejections.append(interview_data)

        response_data['interviews'] = interviews
        response_data['rejections'] = rejections
        response_data['rejections_count'] = len(rejections)

        # 🔹 Stats pour graphiques
        applications_ref = db.collection('applications').where('company_id', '==', session['uid']).stream()
        applications_stats = defaultdict(int)
        for app_doc in applications_ref:
            app_data = app_doc.to_dict()
            created_at = app_data.get('created_at')
            if created_at:
                date_key = created_at.strftime('%Y-%m-%d')
                applications_stats[date_key] += 1

        interviews_ref = db.collection('interviews').where('company_id', '==', session['uid']).stream()
        interviews_stats = defaultdict(int)
        for int_doc in interviews_ref:
            int_data = int_doc.to_dict()
            created_at = int_data.get('created_at')
            if created_at:
                date_key = created_at.strftime('%Y-%m-%d')
                interviews_stats[date_key] += 1

        response_data['applications_stats'] = dict(applications_stats)
        response_data['interviews_stats'] = dict(interviews_stats)

    return jsonify({'success': True, 'data': response_data})


#  Mettre à jour le profil utilisateur
@dashboard_bp.route('/update_profile', methods=['POST'])
def update_profile_api():
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Veuillez vous connecter.'}), 401

    user_doc = db.collection('users').document(session['uid']).get()
    if not user_doc.exists:
        return jsonify({'success': False, 'error': 'Utilisateur non trouvé.'}), 404

    user = user_doc.to_dict()
    updates = {}
    data = request.form  # pour formulaire multipart/form-data

    if user.get('accountType') == 'individual':
        updates['name'] = data.get('name')
        updates['email'] = data.get('email')
        updates['country'] = data.get('country')
        updates['location'] = data.get('location')
        updates['userRole'] = data.get('user_role')
    else:
        updates['city'] = data.get('city')
        updates['companyName'] = data.get('company_name')
        updates['companySize'] = data.get('company_size')
        updates['country'] = data.get('country')
        updates['industry'] = data.get('industry')

    # Image de profil
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and file.filename:
            filename = secure_filename(file.filename)
            save_path = os.path.join('app/static/uploads', filename)
            file.save(save_path)
            updates['profileImageUrl'] = f'/static/uploads/{filename}'

    try:
        db.collection('users').document(session['uid']).update(updates)
        logger.info(f"Profil mis à jour pour {session['uid']}")
        return jsonify({'success': True, 'message': 'Profil mis à jour avec succès !'})
    except Exception as e:
        logger.error(f"Erreur update_profile {session['uid']}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


#  Enregistrer la position de l'utilisateur
@dashboard_bp.route('/save_position', methods=['POST'])
def save_position_api():
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Veuillez vous connecter.'}), 401

    data = request.json
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if latitude is None or longitude is None:
        return jsonify({'success': False, 'error': 'Latitude ou longitude manquante.'}), 400

    try:
        db.collection('users').document(session['uid']).collection('position').add({
            'coordinates': firestore.GeoPoint(float(latitude), float(longitude)),
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        logger.info(f"Position sauvegardée pour {session['uid']}: lat={latitude}, lng={longitude}")
        return jsonify({'success': True, 'message': 'Position enregistrée avec succès.'})
    except Exception as e:
        logger.error(f"Erreur save_position {session['uid']}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# 🔹 Récupérer la liste des jobs pour l'utilisateur
@dashboard_bp.route('/job_list_user', methods=['GET'])
def job_list_user_api():
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Veuillez vous connecter.'}), 401

    try:
        job_service = JobService(db)
        jobs = job_service.get_jobs_by_company(None, limit=None)
        jobs_serialized = [
            {
                'job_id': job['job_id'],
                'title': job.get('title'),
                'description': job.get('description'),
                'company_id': job.get('company_id'),
                'location': job.get('location'),
                'created_at': job.get('created_at').isoformat() if job.get('created_at') else None
            }
            for job in jobs
        ]
        return jsonify({'success': True, 'jobs': jobs_serialized})
    except Exception as e:
        logger.error(f"Erreur job_list_user {session['uid']}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@dashboard_bp.route('/data_analysis', methods=['GET', 'POST'])
def data_analysis_api():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    company_id = session['uid']

    try:
        # 🔹 Applications
        applications_ref = db.collection('applications').where('company_id', '==', company_id).stream()
        applications = []
        for app in applications_ref:
            app_data = app.to_dict()
            app_data['application_id'] = app.id
            candidate_doc = db.collection('users').document(app_data['candidate_id']).get()
            app_data['candidate_name'] = candidate_doc.to_dict().get('name', 'Anonyme') if candidate_doc.exists else 'Anonyme'
            job_doc = db.collection('jobs').document(app_data['job_id']).get()
            app_data['position'] = job_doc.to_dict().get('title', 'Poste inconnu') if job_doc.exists else 'Poste inconnu'
            applications.append(app_data)

        # 🔹 Entretiens
        interviews_ref = db.collection('interviews').where('company_id', '==', company_id).stream()
        interviews = []
        for intv in interviews_ref:
            intv_data = intv.to_dict()
            intv_data['interview_id'] = intv.id
            candidate_doc = db.collection('users').document(intv_data['candidate_id']).get()
            intv_data['candidate_name'] = candidate_doc.to_dict().get('name', 'Anonyme') if candidate_doc.exists else 'Anonyme'
            job_doc = db.collection('jobs').document(intv_data['job_id']).get()
            intv_data['job_title'] = job_doc.to_dict().get('title', 'Poste inconnu') if job_doc.exists else 'Poste inconnu'
            interviews.append(intv_data)

        # 🔹 Contrats
        contracts_ref = db.collection('contracts').where('company_id', '==', company_id).stream()
        contracts = []
        for contr in contracts_ref:
            contr_data = contr.to_dict()
            contr_data['contract_id'] = contr.id
            candidate_doc = db.collection('users').document(contr_data['candidate_id']).get()
            contr_data['candidate_name'] = candidate_doc.to_dict().get('name', 'Anonyme') if candidate_doc.exists else 'Anonyme'
            job_id = contr_data.get('job_id')
            if job_id:
                job_doc = db.collection('jobs').document(job_id).get()
                contr_data['position'] = job_doc.to_dict().get('title', 'Poste inconnu') if job_doc.exists else 'Poste inconnu'
            else:
                contr_data['position'] = 'Non spécifié'
            contracts.append(contr_data)

        # 🔹 Statistiques
        applications_stats = defaultdict(int)
        for app in applications:
            created_at = app.get('submitted_at')
            if created_at:
                date_key = created_at.strftime('%Y-%m-%d')
                applications_stats[date_key] += 1

        interviews_stats = defaultdict(int)
        for intv in interviews:
            datetime_field = intv.get('datetime')
            if datetime_field:
                date_key = datetime_field.strftime('%Y-%m-%d')
                interviews_stats[date_key] += 1

        contracts_stats = defaultdict(int)
        for contr in contracts:
            created_at = contr.get('created_at')
            if created_at:
                date_key = created_at.strftime('%Y-%m-%d')
                contracts_stats[date_key] += 1

        # 🔹 Génération des insights IA
        insights = ""
        if request.method == 'POST':
            period = request.json.get('period', 'month')
            try:
                prompt = f"Analyse les données RH pour l'entreprise : {len(applications)} candidatures, {len(interviews)} entretiens, {len(contracts)} contrats sur la période {period}. Fournis des insights et recommandations."
                insights = generate_bi_insights(prompt)
            except Exception as e:
                logger.error(f"Erreur lors de la génération des insights IA : {str(e)}")

        return jsonify({
            'success': True,
            'applications': applications,
            'interviews': interviews,
            'contracts': contracts,
            'applications_stats': dict(applications_stats),
            'interviews_stats': dict(interviews_stats),
            'contracts_stats': dict(contracts_stats),
            'insights': insights
        })

    except Exception as e:
        logger.error(f"Erreur dans data_analysis_api : {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@dashboard_bp.route('/recent_activity', methods=['GET'])
def get_recent_activity():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    company_id = session['uid']
    now = datetime.now()
    activity = []

    try:
        # 1. Dernière candidature
        apps_ref = db.collection('applications')\
            .where('company_id', '==', company_id)\
            .order_by('applied_at', direction=firestore.Query.DESCENDING)\
            .limit(1)
        for doc in apps_ref.stream():
            app = doc.to_dict()
            candidate_doc = db.collection('users').document(app['candidate_id']).get()
            candidate_name = "Anonyme"
            if candidate_doc.exists:
                u = candidate_doc.to_dict()
                candidate_name = f"{u.get('firstName', '')} {u.get('lastName', '')}".strip() or u.get('name', 'Anonyme')

            time_ago = "Maintenant"
            if app.get('applied_at'):
                delta = now - app['applied_at'].to_datetime().replace(tzinfo=None)
                if delta.days > 0:
                    time_ago = f"Il y a {delta.days} jour{'s' if delta.days > 1 else ''}"
                elif delta.seconds > 3600:
                    time_ago = f"Il y a {delta.seconds // 3600} heure{'s' if delta.seconds // 3600 > 1 else ''}"
                elif delta.seconds > 60:
                    time_ago = f"Il y a {delta.seconds // 60} minute{'s' if delta.seconds // 60 > 1 else ''}"

            activity.append({
                'type': 'application',
                'title': 'Nouvelle candidature reçue',
                'candidate': candidate_name,
                'time': time_ago,
                'icon': 'UserCheck',
                'color': 'text-blue-600 bg-blue-50'
            })

        # 2. Dernier entretien programmé
        interviews_ref = db.collection('interviews')\
            .where('company_id', '==', company_id)\
            .where('status', '==', 'scheduled')\
            .order_by('datetime', direction=firestore.Query.DESCENDING)\
            .limit(1)
        for doc in interviews_ref.stream():
            iv = doc.to_dict()
            candidate_doc = db.collection('users').document(iv['candidate_id']).get()
            candidate_name = "Anonyme"
            if candidate_doc.exists:
                u = candidate_doc.to_dict()
                candidate_name = f"{u.get('firstName', '')} {u.get('lastName', '')}".strip() or u.get('name', 'Anonyme')

            time_ago = "Bientôt"
            if iv.get('datetime'):
                delta = iv['datetime'].to_datetime().replace(tzinfo=None) - now
                if delta.days > 0:
                    time_ago = f"Dans {delta.days} jour{'s' if delta.days > 1 else ''}"
                elif delta.seconds > 3600:
                    time_ago = f"Dans {delta.seconds // 3600} heure{'s' if delta.seconds // 3600 > 1 else ''}"

            activity.append({
                'type': 'interview',
                'title': 'Entretien programmé',
                'candidate': candidate_name,
                'time': time_ago,
                'icon': 'Calendar',
                'color': 'text-purple-600 bg-purple-50'
            })

        # 3. Dernier contrat signé
        contracts_ref = db.collection('contracts')\
            .where('company_id', '==', company_id)\
            .where('status', '==', 'accepted')\
            .order_by('created_at', direction=firestore.Query.DESCENDING)\
            .limit(1)
        for doc in contracts_ref.stream():
            contract = doc.to_dict()
            candidate_doc = db.collection('users').document(contract['candidate_id']).get()
            candidate_name = "Anonyme"
            if candidate_doc.exists:
                u = candidate_doc.to_dict()
                candidate_name = f"{u.get('firstName', '')} {u.get('lastName', '')}".strip() or u.get('name', 'Anonyme')

            time_ago = "Récemment"
            if contract.get('created_at'):
                delta = now - contract['created_at'].to_datetime().replace(tzinfo=None)
                if delta.days == 0:
                    time_ago = "Aujourd'hui"
                elif delta.days == 1:
                    time_ago = "Hier"
                else:
                    time_ago = f"Il y a {delta.days} jours"

            activity.append({
                'type': 'contract',
                'title': 'Contrat signé',
                'candidate': candidate_name,
                'time': time_ago,
                'icon': 'CheckCircle',
                'color': 'text-green-600 bg-green-50'
            })

        # Trier par date décroissante et garder les 3 plus récents
        activity = sorted(activity, key=lambda x: x.get('time', ''), reverse=True)[:3]

        return jsonify({'success': True, 'activity': activity})

    except Exception as e:
        logger.error(f"Erreur recent_activity: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500