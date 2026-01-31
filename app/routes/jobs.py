from firebase_admin import firestore
from flask import Blueprint, session, request, g, jsonify
from datetime import datetime, timedelta
import logging
import os
import boto3
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
from flask import current_app


jobs_bp = Blueprint('jobs', __name__, url_prefix='/jobs')

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
UPLOAD_FOLDER = 'app/static/uploads/resumes'

# Configuration du logger
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

db = firestore.client()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@jobs_bp.route('/apply/<job_id>', methods=['POST'])
def apply_job_api(job_id):
    """Handle job application submission via FormData, supportant LdM facultative (texte ou fichier)."""

    if 'uid' not in session or session.get('account_type') != 'individual':
        return jsonify({'success': False, 'error': 'Accès non autorisé ou utilisateur non connecté'}), 401

    user_id = session['uid']

    user_doc = g.db.collection('users').document(user_id).get()
    if not user_doc.exists or user_doc.to_dict().get('accountType') != 'individual':
        return jsonify({'success': False, 'error': 'Seuls les utilisateurs individuels peuvent postuler'}), 403

    job_doc = g.db.collection('jobs').document(job_id).get()
    if not job_doc.exists:
        return jsonify({'success': False, 'error': 'Offre non trouvée'}), 404

    # Récupérer les fichiers et champs
    resume = request.files.get('resume')

    # NOUVEAU: Récupérer soit le fichier, soit le texte de motivation
    motivation_text = request.form.get('motivation_text', '').strip()
    motivation_file = request.files.get('motivation_file')

    skills = request.form.get('skills', '')
    experience = request.form.get('experience', '')
    phone = request.form.get('phone', '')

    # Validation CV (Obligatoire)
    if not resume or not allowed_file(resume.filename):
        return jsonify({'success': False, 'error': 'Votre CV est obligatoire. Utilisez PDF, DOC ou DOCX.'}), 400

    # Validation LdM (Facultatif, mais vérif des formats si présent)
    motivation_content = motivation_text
    motivation_url = None

    if motivation_file:
        if not motivation_file.filename.lower().endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Le fichier de motivation doit être un PDF.'}), 400
        motivation_content = "Fichier PDF joint"  # Indicateur pour le service

    # Validation minimale si le texte est saisi
    if motivation_text and len(motivation_text) > 0 and len(motivation_text) < 50:
        return jsonify({'success': False,
                        'error': 'Si vous saisissez une lettre de motivation, elle doit faire au moins 50 caractères.'}), 400

    # --- Upload des Fichiers sur S3 ---
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
            region_name=current_app.config['S3_REGION']
        )
        bucket = current_app.config['S3_BUCKET']

        # 1. Upload du CV
        resume_filename = secure_filename(resume.filename)
        resume_key = f"resumes/{user_id}/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{resume_filename}"
        s3_client.upload_fileobj(resume, bucket, resume_key)
        resume_url = f"https://{bucket}.s3.{current_app.config['S3_REGION']}.amazonaws.com/{resume_key}"

        # 2. Upload de la Lettre de Motivation (si fichier)
        if motivation_file:
            motivation_filename = secure_filename(motivation_file.filename)
            motivation_key = f"motivations/{user_id}/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{motivation_filename}"
            s3_client.upload_fileobj(motivation_file, bucket, motivation_key)
            motivation_url = f"https://{bucket}.s3.{current_app.config['S3_REGION']}.amazonaws.com/{motivation_key}"
            motivation_content = None  # Le contenu sera l'URL

    except ClientError as e:
        return jsonify({'success': False, 'error': f'Erreur upload S3: {str(e)}'}), 500

    # 3. Soumission de la Candidature
    try:
        application_id = g.recruitment_service.create_application(
            user_id,
            job_id,
            resume_url,
            motivation_url if motivation_url else motivation_content,  # Envoi de l'URL ou du texte
            skills,
            experience,
            phone
        )
        return jsonify({
            'success': True,
            'message': 'Candidature soumise avec succès!',
            'application_id': application_id,
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': f'Erreur lors de la soumission: {str(e)}'}), 500


@jobs_bp.route('/api/create_job', methods=['POST'])
def api_create_job():
    """Créer une offre d'emploi via API."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    user_id = session['uid']
    data = request.get_json()

    # Récupération de TOUS les champs du frontend
    title = data.get('title')
    description = data.get('description')
    location = data.get('location')
    salary_range = data.get('salary_range')
    contract_type = data.get('contract_type')
    work_hours = data.get('work_hours')  # Nouveau: heures de travail
    remote_policy = data.get('remote_policy')  # Nouveau: politique télétravail
    experience_level = data.get('experience_level')  # Nouveau: niveau expérience
    education_level = data.get('education_level')  # Nouveau: niveau éducation
    department = data.get('department')  # Nouveau: département
    employment_type = data.get('employment_type')  # Nouveau: type d'emploi
    required_skills = data.get('required_skills', [])
    benefits = data.get('benefits', [])  # Nouveau: avantages
    country = data.get('country')
    city = data.get('city')
    missions = data.get('missions', [])
    immediate_start = data.get('immediate_start', False)  # Nouveau: début immédiat
    visa_sponsorship = data.get('visa_sponsorship', False)  # Nouveau: sponsorship visa

    # Validation des champs obligatoires
    if not all([title, description, location, salary_range, contract_type]):
        return jsonify({'success': False,
                        'error': 'Les champs Titre, Description, Localisation, Salaire et Type de contrat sont obligatoires.'}), 400

    if not missions or not any(m.strip() for m in missions):
        return jsonify({'success': False, 'error': 'Au moins une mission est obligatoire.'}), 400

    if not required_skills:
        return jsonify({'success': False, 'error': 'Au moins une compétence est obligatoire.'}), 400

    try:
        # --- Construction de la description complète ---
        full_description = f"{description}"

        # Ajout des missions
        if missions and len(missions) > 0:
            missions_text = "\n\n**Missions principales:**\n" + "\n".join([f"- {m}" for m in missions if m.strip()])
            full_description += missions_text

        # Ajout des compétences
        if required_skills and len(required_skills) > 0:
            skills_text = "\n\n**Compétences requises:**\n" + "\n".join([f"- {s}" for s in required_skills])
            full_description += skills_text

        # Ajout des avantages
        if benefits and len(benefits) > 0:
            benefits_text = "\n\n**Avantages:**\n" + "\n".join([f"- {b}" for b in benefits])
            full_description += benefits_text

        # Ajout des informations complémentaires
        full_description += f"\n\n**Type de contrat:** {contract_type}"

        if work_hours:
            full_description += f"\n**Horaires:** {work_hours}h/semaine"

        if remote_policy:
            remote_map = {
                'full_remote': '100% Télétravail',
                'hybrid': 'Hybride (2-3 jours/semaine)',
                'flexible': 'Flexible',
                'office_only': 'Présentiel uniquement'
            }
            full_description += f"\n**Télétravail:** {remote_map.get(remote_policy, remote_policy)}"

        if experience_level:
            exp_map = {
                'internship': 'Stage',
                'junior': 'Junior (0-2 ans)',
                'mid': 'Confirmé (2-5 ans)',
                'senior': 'Senior (5-10 ans)',
                'expert': 'Expert (10+ ans)',
                'entry': 'Débutant accepté'
            }
            full_description += f"\n**Expérience requise:** {exp_map.get(experience_level, experience_level)}"

        if education_level:
            edu_map = {
                'none': 'Non requis',
                'high_school': 'Baccalauréat',
                'associate': 'Bac+2',
                'bachelor': 'Licence/Bac+3',
                'master': 'Master/Bac+5',
                'phd': 'Doctorat',
                'other': 'Autre'
            }
            full_description += f"\n**Éducation:** {edu_map.get(education_level, education_level)}"

        if employment_type:
            emp_map = {
                'full_time': 'Temps plein',
                'part_time': 'Temps partiel',
                'contract': 'Contractuel',
                'temporary': 'Temporaire',
                'internship': 'Stage',
                'apprenticeship': 'Apprentissage'
            }
            full_description += f"\n**Type d'emploi:** {emp_map.get(employment_type, employment_type)}"

        if department:
            full_description += f"\n**Département:** {department}"

        if immediate_start:
            full_description += f"\n**Début:** Immédiat possible"

        if visa_sponsorship:
            full_description += f"\n**Visa:** Sponsorship possible"

        if city and country:
            full_description += f"\n**Lieu:** {city}, {country}"

        # Appel au service avec tous les nouveaux paramètres
        job_id = g.job_service.create_job(
            company_id=user_id,
            title=title,
            description=full_description,
            location=location,
            salary_range=salary_range,
            contract_type=contract_type,
            work_hours=work_hours,
            remote_policy=remote_policy,
            experience_level=experience_level,
            education_level=education_level,
            department=department,
            employment_type=employment_type,
            required_skills=required_skills,
            benefits=benefits,
            country=country,
            city=city,
            missions=missions,
            immediate_start=immediate_start,
            visa_sponsorship=visa_sponsorship,
            raw_description=description  # Conserver la description originale
        )

        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': 'Offre publiée avec succès!'
        })

    except Exception as e:
        return jsonify({'success': False, 'error': f"Erreur lors de la création de l'offre: {str(e)}"}), 500



@jobs_bp.route('/api/job_list', methods=['GET'])
def api_job_list():
    """Récupérer la liste des offres d'une entreprise via API."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    user_id = session['uid']
    try:
        jobs = g.job_service.get_jobs_by_company(user_id, limit=None)
        return jsonify({'success': True, 'jobs': jobs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@jobs_bp.route('/api/job_detail/<job_id>', methods=['GET'])
def api_job_detail(job_id):
    """Récupérer les détails d'une offre via API."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    user_doc = g.db.collection('users').document(user_id).get()
    if not user_doc.exists:
        return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404

    try:
        job_doc = g.db.collection('jobs').document(job_id).get()
        if not job_doc.exists:
            return jsonify({'success': False, 'error': 'Offre non trouvée'}), 404

        job = job_doc.to_dict()
        job['job_id'] = job_id
        # Convertir created_at en string ISO
        if hasattr(job.get('created_at'), 'to_datetime'):
            job['created_at'] = job['created_at'].to_datetime().isoformat()
        elif isinstance(job.get('created_at'), datetime):
            job['created_at'] = job['created_at'].isoformat()
        else:
            job['created_at'] = datetime.now().isoformat()

        return jsonify({'success': True, 'job': job})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@jobs_bp.route('/delete_job/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    """Delete a job and update metrics."""
    if 'uid' not in session or 'account_type' not in session:
        logger.warning("No user session found, redirecting to login")
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    if not user_id:
        logger.warning("No user_id in session, redirecting to login")
        return jsonify({'error': 'ID utilisateur manquant'}), 401

    # Check if the user is a company
    user_doc = g.db.collection('users').document(user_id).get()
    if not user_doc.exists or user_doc.to_dict().get('accountType') != 'company':
        logger.warning(f"User {user_id} is not a company or does not exist")
        return jsonify({'error': 'Seules les entreprises peuvent supprimer des offres'}), 403

    job_doc = g.db.collection('jobs').document(job_id).get()
    if not job_doc.exists:
        logger.error(f"Job {job_id} not found")
        return jsonify({'error': 'Offre non trouvée'}), 404

    job = job_doc.to_dict()
    if job['company_id'] != user_id:
        logger.warning(f"User {user_id} not authorized to delete job {job_id}")
        return jsonify({'error': 'Vous n\'êtes pas autorisé à supprimer cette offre'}), 403

    try:
        g.db.collection('jobs').document(job_id).delete()
        # Update metrics
        g.recruitment_service.update_metrics(user_id)
        logger.info(f"Job {job_id} deleted successfully by user {user_id}")
        return jsonify({'message': 'Offre supprimée avec succès'}), 200
    except Exception as e:
        logger.error(f"Error deleting job {job_id}: {str(e)}")
        return jsonify({'error': f'Erreur lors de la suppression: {str(e)}'}), 500


@jobs_bp.route('/application/<application_id>/status', methods=['POST'])
def update_application_status(application_id):
    """Update the status of an application (accept, reject, or withdraw)."""
    if 'uid' not in session or 'account_type' not in session:
        logger.warning("No user session found, redirecting to login")
        return jsonify({'error': 'Utilisateur non authentifié'}), 401

    user_id = session['uid']
    if not user_id:
        logger.warning("No user_id in session")
        return jsonify({'error': 'ID utilisateur manquant'}), 401

    # Fetch user document to check account type
    user_doc = g.db.collection('users').document(user_id).get()
    if not user_doc.exists:
        logger.warning(f"User {user_id} not found in Firestore")
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    account_type = user_doc.to_dict().get('accountType')

    # Fetch application
    application_doc = g.db.collection('applications').document(application_id).get()
    if not application_doc.exists:
        logger.error(f"Application {application_id} not found")
        return jsonify({'error': 'Candidature non trouvée'}), 404

    application = application_doc.to_dict()
    status = request.json.get('status')
    if status not in ['accepted', 'rejected', 'withdrawn']:
        logger.error(f"Invalid status for application {application_id}: {status}")
        return jsonify({'error': 'Statut invalide'}), 400

    # Authorization checks
    if status == 'withdrawn' and application['candidate_id'] != user_id:
        logger.warning(f"User {user_id} not authorized to withdraw application {application_id}")
        return jsonify({'error': 'Vous n\'êtes pas autorisé à retirer cette candidature'}), 403
    elif status in ['accepted', 'rejected'] and application['company_id'] != user_id:
        logger.warning(f"User {user_id} not authorized to update application {application_id} status to {status}")
        return jsonify({'error': 'Vous n\'êtes pas autorisé à modifier cette candidature'}), 403

    # Additional check for account type
    if status == 'withdrawn' and account_type != 'individual':
        logger.warning(f"User {user_id} is not an individual, cannot withdraw application {application_id}")
        return jsonify({'error': 'Seuls les utilisateurs individuels peuvent retirer des candidatures'}), 403
    elif status in ['accepted', 'rejected'] and account_type != 'company':
        logger.warning(f"User {user_id} is not a company, cannot update application {application_id} to {status}")
        return jsonify({'error': 'Seules les entreprises peuvent accepter ou rejeter des candidatures'}), 403

    try:
        # Mettre à jour le statut
        g.db.collection('applications').document(application_id).update({
            'status': status,
            'updated_at': datetime.now()
        })

        # ================= NOUVEAU =================
        # Créer une notification pour le candidat si la candidature est acceptée ou refusée
        if status in ['accepted', 'rejected']:
            notification_data = {
                'user_id': application['candidate_id'],
                'type': 'application_status',
                'title': f'Candidature {status}',
                'message': f'Votre candidature pour "{application.get("job_title", "le poste")}" a été {status}.',
                'data': {
                    'application_id': application_id,
                    'job_id': application['job_id'],
                    'company_id': application['company_id'],
                    'status': status
                },
                'read': False,
                'created_at': datetime.now()
            }
            g.db.collection('notifications').add(notification_data)
            logger.info(f"Notification créée pour l'application {application_id} - statut: {status}")
        # ================= FIN NOUVEAU =================

        # Update metrics only for company-related actions
        if status in ['accepted', 'rejected']:
            g.recruitment_service.update_metrics(application['company_id'])
        logger.info(f"Application {application_id} updated to status: {status} by user {user_id}")
        return jsonify({'message': f'Candidature {status} avec succès'}), 200
    except Exception as e:
        logger.error(f"Error updating application status {application_id}: {str(e)}")
        return jsonify({'error': f'Erreur lors de la mise à jour: {str(e)}'}), 500


# === NOUVELLE ROUTE : Récupérer les candidatures d'une offre ===
@jobs_bp.route('/api/job_applications/<job_id>', methods=['GET'])
def api_get_job_applications(job_id):
    """Récupérer toutes les candidatures pour une offre donnée."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    company_id = session['uid']

    # Vérifier que l'offre appartient à l'entreprise
    job_doc = g.db.collection('jobs').document(job_id).get()
    if not job_doc.exists or job_doc.to_dict().get('company_id') != company_id:
        return jsonify({'success': False, 'error': 'Offre non trouvée ou non autorisée'}), 404

    try:
        apps_ref = g.db.collection('applications').where(
            filter=firestore.FieldFilter('job_id', '==', job_id)
        )
        applications = []
        for doc in apps_ref.stream():
            data = doc.to_dict()
            data['application_id'] = doc.id
            # Récupérer le nom du candidat
            user_doc = g.db.collection('users').document(data['candidate_id']).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                data['candidate_name'] = f"{user_data.get('firstName', '')} {user_data.get('lastName', '')}".strip()
            else:
                data['candidate_name'] = "Utilisateur inconnu"
            # Formatage de la date
            if 'applied_at' in data and hasattr(data['applied_at'], 'to_datetime'):
                data['applied_at'] = data['applied_at'].to_datetime().isoformat()
            applications.append(data)
        return jsonify({'success': True, 'applications': applications})
    except Exception as e:
        logger.error(f"Error fetching applications for job {job_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# === NOUVELLE ROUTE : Mettre à jour une offre ===
@jobs_bp.route('/api/update_job/<job_id>', methods=['PUT'])
def api_update_job(job_id):
    """Mettre à jour une offre d'emploi existante."""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    company_id = session['uid']
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    location = data.get('location')
    salary_range = data.get('salary_range')

    if not all([title, description, location, salary_range]):
        return jsonify({'success': False, 'error': 'Tous les champs sont obligatoires'}), 400

    # Vérifier que l'offre existe et appartient à l'entreprise
    job_doc = g.db.collection('jobs').document(job_id).get()
    if not job_doc.exists or job_doc.to_dict().get('company_id') != company_id:
        return jsonify({'success': False, 'error': 'Offre non trouvée ou non autorisée'}), 404

    try:
        g.db.collection('jobs').document(job_id).update({
            'title': title,
            'description': description,
            'location': location,
            'salary_range': salary_range,
            'updated_at': firestore.SERVER_TIMESTAMP
        })
        return jsonify({'success': True, 'message': 'Offre mise à jour avec succès!'})
    except Exception as e:
        return jsonify({'success': False, 'error': f"Erreur lors de la mise à jour: {str(e)}"}), 500


@jobs_bp.route('/api/all_active', methods=['GET'])
def api_get_all_active_jobs():
    """Retourne toutes les offres d'emploi actives avec le nom de l'entreprise."""
    try:
        jobs_ref = g.db.collection('jobs').where(
            filter=firestore.FieldFilter('status', '==', 'active')
        ).order_by('created_at', direction=firestore.Query.DESCENDING)

        jobs = []
        for doc in jobs_ref.stream():
            job_data = doc.to_dict()
            job_data['job_id'] = doc.id

            # Récupérer le nom de l'entreprise
            company_doc = g.db.collection('users').document(job_data['company_id']).get()
            if company_doc.exists:
                company_data = company_doc.to_dict()
                job_data['company_name'] = company_data.get('companyName') or company_data.get('name') or "Entreprise anonyme"
            else:
                job_data['company_name'] = "Entreprise inconnue"

            # Formatage de la date
            if 'created_at' in job_data and hasattr(job_data['created_at'], 'to_datetime'):
                job_data['created_at'] = job_data['created_at'].to_datetime().isoformat()
            elif 'created_at' not in job_data:
                job_data['created_at'] = datetime.now().isoformat()

            jobs.append(job_data)

        return jsonify({'success': True, 'jobs': jobs}), 200

    except Exception as e:
        logger.error(f"Erreur récupération offres actives: {str(e)}")
        return jsonify({'success': False, 'error': 'Erreur serveur'}), 500


@jobs_bp.route('/api/my_applications', methods=['GET'])
def api_my_applications():
    if 'uid' not in session or session.get('account_type') != 'individual':
        return jsonify({'success': False, 'error': 'Accès refusé'}), 403

    candidate_id = session['uid']
    try:
        apps_ref = g.db.collection('applications').where('candidate_id', '==', candidate_id).stream()
        applications = []
        for doc in apps_ref:
            app = doc.to_dict()
            app['application_id'] = doc.id
            # Récupérer le job
            job_doc = g.db.collection('jobs').document(app['job_id']).get()
            if job_doc.exists:
                job = job_doc.to_dict()
                app['job_title'] = job.get('title', 'Offre inconnue')
                company_doc = g.db.collection('users').document(job['company_id']).get()
                app['company_name'] = company_doc.to_dict().get('companyName', 'Entreprise') if company_doc.exists else 'Entreprise'
            if 'applied_at' in app:
                app['applied_at'] = app['applied_at'].to_datetime().isoformat()
            applications.append(app)
        return jsonify({'success': True, 'applications': applications})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# === NOUVELLE ROUTE : Insights & Prédictions IA (VERSION CORRIGÉE) ===
@jobs_bp.route('/api/insights', methods=['GET'])
def api_get_recruitment_insights():
    """Retourne des statistiques + insights IA pour l'entreprise connectée"""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès refusé'}), 403

    company_id = session['uid']

    try:
        # 1. Récupérer toutes les offres
        jobs_ref = g.db.collection('jobs').where('company_id', '==', company_id).stream()
        jobs = []
        for doc in jobs_ref:
            data = doc.to_dict()
            data['job_id'] = doc.id
            jobs.append(data)

        # 2. Récupérer toutes les candidatures + normaliser la date
        all_apps = []
        now = datetime.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)

        for job in jobs:
            apps_ref = g.db.collection('applications').where('job_id', '==', job['job_id']).stream()
            for app_doc in apps_ref:
                app = app_doc.to_dict()
                app['application_id'] = app_doc.id
                app['job_title'] = job.get('title', 'Offre inconnue')

                # NORMALISATION SÉCURISÉE DE LA DATE
                applied_at = app.get('applied_at')
                if hasattr(applied_at, 'to_datetime'):
                    app['applied_at'] = applied_at.to_datetime()
                elif isinstance(applied_at, datetime):
                    app['applied_at'] = applied_at
                elif isinstance(applied_at, str):
                    try:
                        app['applied_at'] = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                    except:
                        app['applied_at'] = None
                else:
                    app['applied_at'] = None  # ← Valeur par défaut

                all_apps.append(app)

        # 3. Filtrer seulement les candidatures avec une date valide
        valid_apps = [a for a in all_apps if a['applied_at'] is not None]
        recent_apps = [a for a in valid_apps if a['applied_at'] >= thirty_days_ago]
        last_7_days_apps = [a for a in valid_apps if a['applied_at'] >= seven_days_ago]

        # 4. Calculs statistiques
        total_jobs = len(jobs)
        total_applications = len(valid_apps)
        pending = len([a for a in valid_apps if a.get('status') == 'pending'])
        accepted = len([a for a in valid_apps if a.get('status') == 'accepted'])
        rejected = len([a for a in valid_apps if a.get('status') == 'rejected'])

        # Évolution quotidienne (30 jours)
        daily_counts = {}
        for app in recent_apps:
            day = app['applied_at'].strftime('%Y-%m-%d')
            daily_counts[day] = daily_counts.get(day, 0) + 1

        applications_over_time = sorted([
            {"date": day, "count": count} for day, count in daily_counts.items()
        ], key=lambda x: x['date'])

        # Top 5 offres
        job_stats = {}
        for app in valid_apps:
            title = app['job_title']
            job_stats[title] = job_stats.get(title, 0) + 1
        top_jobs = sorted(job_stats.items(), key=lambda x: x[1], reverse=True)[:5]

        # Taux de conversion
        conversion_rate = round((accepted / total_applications * 100), 1) if total_applications > 0 else 0

        return jsonify({
            'success': True,
            'insights': {
                'total_jobs': total_jobs,
                'total_applications': total_applications,
                'pending': pending,
                'accepted': accepted,
                'rejected': rejected,
                'conversion_rate': conversion_rate,
                'applications_over_time': applications_over_time,
                'top_performing_jobs': [[title, count] for title, count in top_jobs],  # ← Format tableau
                'average_applications_per_job': round(total_applications / total_jobs, 1) if total_jobs > 0 else 0,
                'applications_last_7_days': len(last_7_days_apps),
            }
        })

    except Exception as e:
        logger.error(f"Erreur insights: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Erreur interne lors du calcul des insights'}), 500


# === NOUVELLE ROUTE : Statistiques rapides pour le tableau de bord ===
@jobs_bp.route('/api/dashboard_stats', methods=['GET'])
def api_get_dashboard_stats():
    """Retourne les stats rapides + données graphiques pour JobList.jsx"""
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès refusé'}), 403

    company_id = session['uid']

    try:
        # Récupérer les offres + candidatures
        jobs = [doc.to_dict() | {'job_id': doc.id} for doc in
                g.db.collection('jobs').where('company_id', '==', company_id).stream()]

        all_apps = []
        now = datetime.now()
        thirty_days_ago = now - timedelta(days=30)

        # Compter les candidatures par offre
        job_application_counts = {job['job_id']: 0 for job in jobs}
        job_application_counts_title = {}

        for job in jobs:
            job_id = job['job_id']
            title = job.get('title', 'Offre sans titre')
            apps_ref = g.db.collection('applications').where('job_id', '==', job_id).stream()
            count = 0
            for app_doc in apps_ref:
                app = app_doc.to_dict()
                applied_at = app.get('applied_at')
                if hasattr(applied_at, 'to_datetime'):
                    applied_at = applied_at.to_datetime()
                elif isinstance(applied_at, str):
                    try:
                        applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                    except:
                        applied_at = now
                else:
                    applied_at = now

                all_apps.append({
                    'applied_at': applied_at,
                    'status': app.get('status', 'pending'),
                    'job_title': title
                })
                count += 1

            job_application_counts[job_id] = count
            job_application_counts_title[title] = count

        # Stats globales
        total_applications = len(all_apps)
        pending = len([a for a in all_apps if a['status'] == 'pending'])
        accepted = len([a for a in all_apps if a['status'] == 'accepted'])
        rejected = len([a for a in all_apps if a['status'] == 'rejected'])

        # Graphique mensuel (6 derniers mois)
        six_months_ago = now - timedelta(days=180)
        monthly_data = {}
        current = six_months_ago.replace(day=1)
        while current <= now:
            month_key = current.strftime('%b')
            monthly_data[month_key] = 0
            current = (current.replace(day=28) + timedelta(days=4)).replace(day=1)

        for app in all_apps:
            if app['applied_at'] >= six_months_ago:
                month = app['applied_at'].strftime('%b')
                monthly_data[month] += 1

        applications_by_month = [
            {"month": month, "applications": count}
            for month, count in monthly_data.items()
        ]

        # Statut des candidatures
        status_data = [
            {"name": "En cours", "value": pending, "color": "#f97316"},
            {"name": "Acceptées", "value": accepted, "color": "#10b981"},
            {"name": "Refusées", "value": rejected, "color": "#ef4444"},
        ]

        return jsonify({
            'success': True,
            'stats': {
                'total_applications': total_applications,
                'applications_by_month': applications_by_month,
                'status_distribution': status_data,
                'applications_per_job': job_application_counts  # job_id → count
            }
        })

    except Exception as e:
        logger.error(f"Erreur dashboard_stats: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Erreur serveur'}), 500


@jobs_bp.route('/create_service', methods=['POST'])
def create_service():
    if 'uid' not in session or session.get('account_type') != 'individual':
        return jsonify({'success': False, 'error': 'Seuls les particuliers peuvent créer un service'}), 403

    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    price = data.get('price')
    category = data.get('category', 'other')
    duration = data.get('duration')

    if not all([title, description, price, duration]):
        return jsonify({'success': False, 'error': 'Tous les champs sont obligatoires'}), 400

    try:
        service_id = db.collection('services').add({
            'provider_id': session['uid'],
            'title': title.strip(),
            'description': description.strip(),
            'price': float(price),
            'category': category,
            'duration': int(duration),
            'status': 'active',
            'created_at': firestore.SERVER_TIMESTAMP
        })[1].id

        return jsonify({'success': True, 'service_id': service_id, 'message': 'Service créé avec succès'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@jobs_bp.route('/quick-apply/<job_id>', methods=['POST'])
def quick_apply_job(job_id):
    """Candidature en un clic utilisant le profil existant du candidat."""
    if 'uid' not in session or session.get('account_type') != 'individual':
        return jsonify({'success': False, 'error': 'Accès non autorisé ou utilisateur non connecté'}), 401

    user_id = session['uid']

    # Vérifier que l'utilisateur est bien un individu
    user_doc = g.db.collection('users').document(user_id).get()
    if not user_doc.exists or user_doc.to_dict().get('accountType') != 'individual':
        return jsonify({'success': False, 'error': 'Seuls les utilisateurs individuels peuvent postuler'}), 403

    # Vérifier que l'offre existe
    job_doc = g.db.collection('jobs').document(job_id).get()
    if not job_doc.exists:
        return jsonify({'success': False, 'error': 'Offre non trouvée'}), 404

    # Récupérer le profil du candidat depuis la collection 'users'
    candidate_profile = user_doc.to_dict()

    # Vérifier que le candidat a un CV (cvUrl ou cv_url)
    cv_url = candidate_profile.get('cvUrl') or candidate_profile.get('cv_url')
    if not cv_url:
        return jsonify(
            {'success': False, 'error': 'Veuillez uploader un CV dans votre profil avant de postuler en un clic.'}), 400

    # Vérifier les champs essentiels
    required_fields = ['first_name', 'name', 'email', 'phone', 'bio', 'skills']
    missing_fields = []

    for field in required_fields:
        field_value = candidate_profile.get(field)
        if not field_value:
            missing_fields.append(field)
        elif field == 'skills' and (not field_value or (isinstance(field_value, list) and len(field_value) == 0)):
            missing_fields.append(field)

    if missing_fields:
        missing_list = ", ".join(missing_fields)
        return jsonify({
            'success': False,
            'error': f'Votre profil est incomplet. Champs manquants: {missing_list}. Veuillez compléter votre profil.'
        }), 400

    # Vérifier si le candidat a déjà postulé à cette offre
    existing_app_query = g.db.collection('applications').where('candidate_id', '==', user_id).where('job_id', '==',
                                                                                                    job_id).limit(
        1).stream()
    if any(existing_app_query):
        return jsonify({'success': False, 'error': 'Vous avez déjà postulé à cette offre.'}), 400

    try:
        # Récupérer les informations de l'offre
        job = job_doc.to_dict()

        # Récupérer le nom de l'entreprise
        company_doc = g.db.collection('users').document(job['company_id']).get()
        company_name = "Entreprise"
        if company_doc.exists:
            company_data = company_doc.to_dict()
            company_name = company_data.get('companyName') or company_data.get('name', 'Entreprise')

        # Formater les compétences
        skills = candidate_profile.get('skills', [])
        skills_text = ', '.join(skills) if isinstance(skills, list) else str(skills)

        # Préparer les données de candidature
        application_data = {
            'job_id': job_id,
            'candidate_id': user_id,
            'company_id': job['company_id'],
            'job_title': job.get('title', 'Offre sans titre'),
            'company_name': company_name,
            'resume_url': cv_url,
            'resume_name': candidate_profile.get('cvName') or candidate_profile.get('cv_name', 'CV.pdf'),
            'motivation': f"Candidature envoyée en un clic depuis le profil de {candidate_profile.get('first_name', '')} {candidate_profile.get('name', '')}",
            'skills': skills_text,
            'experience': candidate_profile.get('experience', ''),
            'phone': candidate_profile.get('phone', ''),
            'status': 'pending',
            'applied_at': firestore.SERVER_TIMESTAMP,
            'submitted_at': firestore.SERVER_TIMESTAMP,
            'is_quick_apply': True,
            'candidate_name': f"{candidate_profile.get('first_name', '')} {candidate_profile.get('name', '')}".strip()
        }

        # Ajouter la candidature
        application_ref = g.db.collection('applications').document()
        application_id = application_ref.id

        application_ref.set(application_data)

        # Créer une notification pour l'entreprise
        notification_data = {
            'user_id': job['company_id'],
            'type': 'new_application',
            'title': 'Nouvelle candidature rapide',
            'message': f"{application_data['candidate_name']} a postulé à votre offre '{job['title']}' en un clic.",
            'data': {
                'application_id': application_id,
                'job_id': job_id,
                'candidate_id': user_id,
                'is_quick_apply': True
            },
            'read': False,
            'created_at': datetime.now()
        }
        g.db.collection('notifications').add(notification_data)

        # Mettre à jour les métriques
        g.recruitment_service.update_metrics(job['company_id'])

        logger.info(f"Quick apply réussie - Candidat: {user_id}, Offre: {job_id}")

        return jsonify({
            'success': True,
            'message': 'Candidature envoyée avec succès en un clic!',
            'application_id': application_id,
            'is_quick_apply': True
        }), 200

    except Exception as e:
        logger.error(f"Erreur quick apply: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': f'Erreur lors de la candidature rapide: {str(e)}'}), 500