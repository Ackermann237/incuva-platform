import uuid

from flask import Blueprint, request, url_for, session, jsonify, current_app
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length, Regexp
from datetime import datetime, timedelta
from firebase_admin import auth, firestore
from wtforms import ValidationError
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from ..forms.employee_form import EmployeeForm
from ..firebase.init_firebase import db
import boto3
from botocore.exceptions import ClientError

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

load_dotenv()
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')


def send_verification_email(email, code):
    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = email
    msg['Subject'] = "Code de vérification INCUVA"

    body = f"Votre code de vérification pour INCUVA est : {code}\nCe code est valable 10 minutes."
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email : {e}")
        return False


def generate_verification_code(length=6):
    return ''.join(random.choices(string.digits, k=length))


# Formulaires
class AccountTypeForm(FlaskForm):
    class Meta:
        csrf = False  # ✅ Désactive CSRF dans WTForms

    account_type = SelectField(
        'Type de compte',
        choices=[('individual', 'Particulier'), ('company', 'Entreprise')],
        validators=[DataRequired()]
    )
    submit = SubmitField('Suivant')


class RegisterIndividualForm(FlaskForm):
    class Meta:
        csrf = False  # ✅ Désactive CSRF dans WTForms

    first_name = StringField('Prénom', validators=[DataRequired()])
    name = StringField('Nom', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    phone = StringField('Numéro de téléphone', validators=[DataRequired()])
    country = SelectField(
        'Pays',
        choices=[('US', 'États-Unis'), ('FR', 'France'), ('ES', 'Espagne'), ('DE', 'Allemagne')],
        validators=[DataRequired()]
    )
    location = StringField('Ville', validators=[DataRequired()])
    user_role = SelectField(
        'Rôle',
        choices=[('standard', 'Standard'), ('job_seeker', 'Chercheur d’emploi')],
        validators=[DataRequired()]
    )
    password = PasswordField('Mot de passe', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirmez le mot de passe', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('S’inscrire')


class RegisterCompanyForm(FlaskForm):
    class Meta:
        csrf = False

    email = StringField('Email de l\'entreprise', validators=[DataRequired(), Email()])
    city = StringField('Ville', validators=[DataRequired()])
    company_name = StringField('Nom de l\'entreprise', validators=[DataRequired()])

    # Choix alignés avec le frontend
    company_size = SelectField(
        'Taille de l\'entreprise',
        choices=[
            ('1-10', '1-10 employés'),
            ('11-50', '11-50 employés'),
            ('51-200', '51-200 employés'),
            ('201-500', '201-500 employés'),
            ('500+', '500+ employés')
        ],
        validators=[DataRequired(message="Veuillez sélectionner la taille de votre entreprise")]
    )

    country = SelectField(
        'Pays',
        choices=[
            ('FR', 'France 🇫🇷'),
            ('US', 'États-Unis 🇺🇸'),
            ('ES', 'Espagne 🇪🇸'),
            ('DE', 'Allemagne 🇩🇪'),
            ('GB', 'Royaume-Uni 🇬🇧'),
            ('IT', 'Italie 🇮🇹'),
            ('CA', 'Canada 🇨🇦')
        ],
        validators=[DataRequired()]
    )

    siret = StringField(
        'SIRET',
        validators=[
            DataRequired(message="Le SIRET est obligatoire"),
            Length(min=14, max=14, message="Le SIRET doit contenir exactement 14 chiffres"),
            Regexp('^\d{14}$', message="Le SIRET doit contenir uniquement des chiffres")
        ]
    )

    geographic_area = SelectField(
        'Zone géographique',
        choices=[
            ('local', 'Local (ville uniquement)'),
            ('regional', 'Régional'),
            ('national', 'National'),
            ('eu', 'International (UE)'),
            ('world', 'International (Monde)')
        ],
        validators=[DataRequired()]
    )

    industry = StringField('Secteur d\'activité', validators=[DataRequired()])
    password = PasswordField('Mot de passe', validators=[
        DataRequired(),
        Length(min=6, message="Le mot de passe doit contenir au moins 6 caractères")
    ])
    confirm_password = PasswordField('Confirmez le mot de passe', validators=[
        DataRequired(),
        EqualTo('password', message="Les mots de passe doivent correspondre")
    ])


class LoginForm(FlaskForm):
    class Meta:
        csrf = False  # Désactivation CSRF pour usage API

    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Mot de passe', validators=[DataRequired()])
    submit = SubmitField('Se connecter')


class VerifyEmailForm(FlaskForm):
    class Meta:
        csrf = False

    verification_code = StringField('Code de vérification', validators=[DataRequired(), Length(min=6, max=6)])
    code_digit_0 = StringField(validators=[DataRequired(), Length(min=1, max=1)])
    code_digit_1 = StringField(validators=[DataRequired(), Length(min=1, max=1)])
    code_digit_2 = StringField(validators=[DataRequired(), Length(min=1, max=1)])
    code_digit_3 = StringField(validators=[DataRequired(), Length(min=1, max=1)])
    code_digit_4 = StringField(validators=[DataRequired(), Length(min=1, max=1)])
    code_digit_5 = StringField(validators=[DataRequired(), Length(min=1, max=1)])


class ResetPasswordForm(FlaskForm):
    class Meta:
        csrf = False  # Désactivation CSRF pour usage API

    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Nouveau mot de passe', validators=[DataRequired(), Length(min=6)])
    submit = SubmitField('Envoyer le lien de réinitialisation')


# Routes
@auth_bp.route('/select_account_type', methods=['POST'])
def select_account_type():
    data = request.get_json()
    account_type = data.get('account_type')

    form = AccountTypeForm(account_type=account_type)
    if form.validate():
        session['account_type'] = account_type
        next_url = '/register_individual' if account_type == 'individual' else '/register_company'
        return jsonify({'success': True, 'next_url': next_url})
    else:
        return jsonify({'success': False, 'errors': form.errors}), 400


# ==========================
# Inscription particulier
# ==========================
@auth_bp.route('/register_individual', methods=['POST'])
def register_individual():
    data = request.get_json()
    form = RegisterIndividualForm(data=data)

    if form.validate():
        # Stocker les données pour vérification ultérieure
        session['register_data'] = {
            'first_name': form.first_name.data,
            'name': form.name.data,
            'email': form.email.data,
            'phone': form.phone.data,
            'country': form.country.data,
            'location': form.location.data,
            'user_role': form.user_role.data,
            'password': form.password.data,
            'account_type': 'individual',
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude')
        }

        code = generate_verification_code()
        session['verification_code'] = code
        session['code_expiry'] = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

        email_sent = send_verification_email(form.email.data, code)
        if email_sent:
            return jsonify({'success': True, 'message': 'Code de vérification envoyé', 'next_url': '/verify_email'})
        else:
            return jsonify({'success': False, 'error': "Erreur envoi email"}), 500
    else:
        return jsonify({'success': False, 'errors': form.errors}), 400


# ==========================
# Inscription entreprise
# ==========================
@auth_bp.route('/register_company', methods=['POST'])
def register_company():
    data = request.get_json()

    # Adapter les noms de champs pour correspondre au formulaire
    form_data = {
        'email': data.get('email'),
        'city': data.get('location'),  # Le frontend envoie 'location' mais le formulaire attend 'city'
        'company_name': data.get('company_name'),
        'company_size': data.get('company_size'),
        'country': data.get('country'),
        'industry': data.get('industry'),
        'siret': data.get('siret', '').replace(' ', ''),  # Nettoyer le SIRET
        'geographic_area': data.get('geographic_area'),
        'password': data.get('password'),
        'confirm_password': data.get('confirm_password')
    }

    form = RegisterCompanyForm(data=form_data)

    if form.validate():
        session['register_data'] = {
            'email': form.email.data,
            'city': form.city.data,
            'company_name': form.company_name.data,
            'company_size': form.company_size.data,
            'country': form.country.data,
            'industry': form.industry.data,
            'siret': form.siret.data,
            'geographic_area': form.geographic_area.data,
            'password': form.password.data,
            'account_type': 'company',
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude')
        }

        code = generate_verification_code()
        session['verification_code'] = code
        session['code_expiry'] = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

        email_sent = send_verification_email(form.email.data, code)
        if email_sent:
            return jsonify({'success': True, 'message': 'Code de vérification envoyé', 'next_url': '/verify_email'})
        else:
            return jsonify({'success': False, 'error': "Erreur envoi email"}), 500
    else:
        # Retourner des erreurs plus détaillées et adaptées au frontend
        errors = {}
        for field, messages in form.errors.items():
            errors[field] = []
            for message in messages:
                if field == 'siret' and "exactly 14 characters" in str(message):
                    errors[field].append("Le SIRET doit contenir exactement 14 chiffres")
                elif field == 'company_size' and "valid choice" in str(message):
                    errors[field].append("Veuillez sélectionner une taille d'entreprise valide")
                else:
                    errors[field].append(str(message))

        return jsonify({
            'success': False,
            'errors': errors,
            'message': 'Veuillez corriger les erreurs dans le formulaire'
        }), 400



# ==========================
# Création collaborateur
# ==========================
@auth_bp.route('/create_employee', methods=['POST'])
def create_employee():
    if 'uid' not in session or session.get('account_type') != 'company':
        return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

    data = request.get_json()
    form = EmployeeForm(data=data)
    db_client = db

    user_doc = db_client.collection('users').document(session['uid']).get()
    if not user_doc.exists:
        return jsonify({'success': False, 'error': 'Entreprise introuvable'}), 404

    company_name = user_doc.to_dict().get('companyName')

    if form.validate():
        try:
            user = auth.create_user(
                email=form.email.data,
                password=form.password.data,
                display_name=f"{form.first_name.data} {form.name.data}"
            )
            uid = user.uid

            db_client.collection('users').document(uid).set({
                'first_name': form.first_name.data,
                'name': form.name.data,
                'email': form.email.data,
                'position': form.position.data,
                'companyName': company_name,
                'accountType': 'employee',
                'createdAt': datetime.utcnow(),
                'worksOwnerId': session['uid']
            })

            return jsonify({'success': True, 'message': 'Compte collaborateur créé', 'user_id': uid})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    else:
        return jsonify({'success': False, 'errors': form.errors}), 400


@auth_bp.route('/verify_email', methods=['POST'])
def verify_email_api():
    if 'register_data' not in session or 'verification_code' not in session:
        return jsonify({
            'success': False,
            'message': 'Session expirée. Veuillez recommencer le processus d\'inscription.',
            'clear_fields': True
        }), 400

    data = request.get_json()
    code_input = data.get('verification_code', '').strip()
    if not code_input:
        return jsonify({
            'success': False,
            'message': 'Veuillez entrer un code valide à 6 chiffres.',
            'clear_fields': True
        }), 400

    expiry = datetime.fromisoformat(session['code_expiry'])
    if datetime.utcnow() > expiry:
        return jsonify({
            'success': False,
            'message': 'Le code de vérification a expiré. Veuillez demander un nouveau code.',
            'clear_fields': True
        }), 400

    if code_input != session['verification_code']:
        return jsonify({
            'success': False,
            'message': 'Code de vérification incorrect. Veuillez réessayer.',
            'clear_fields': True
        }), 400

    # Création de l’utilisateur
    register_data = session['register_data']
    try:
        user = auth.create_user(
            email=register_data['email'],
            password=register_data['password'],
            display_name=register_data.get('name', register_data.get('company_name'))
        )
        uid = user.uid
        session['uid'] = uid
        session['account_type'] = register_data['account_type']
        db = firestore.client()

        user_doc = {'createdAt': datetime.utcnow(), 'accountType': register_data['account_type'],
                    'profileImageUrl': url_for('static', filename='images/user_avatar.jpg')}

        if register_data['account_type'] == 'individual':
            user_doc.update({
                'first_name': register_data['first_name'],
                'name': register_data['name'],
                'email': register_data['email'],
                'phone': register_data['phone'],
                'country': register_data['country'],
                'location': register_data['location'],
                'worksOwnerId': uid,
                'userRole': register_data['user_role'],
                # Champs ajoutés / portfolio / expériences
                'bio': '',
                'skills': [],  # ← tableau
                'languages': [],  # ← tableau
                'portfolio': [],  # ← tableau d'objets { title, description, link?, image? }
                'experience': [],  # ← tableau d'expériences
                'education': [],  # ← tableau études / formations
                'linkedin': '',
                'cvUrl': None,
                'cvName': None,
                'achievements': [],  # ← optionnel : réalisations / certifications
            })
        else:  # company
            user_doc.update({
                'email': register_data['email'],
                'city': register_data['city'],
                'companyName': register_data['company_name'],
                'companySize': register_data['company_size'],
                'country': register_data['country'],
                'industry': register_data['industry'],
                'lastLogin': datetime.utcnow(),
                'uid': uid
            })

        db.collection('users').document(uid).set(user_doc)

        # Enregistrer la position si fournie
        if register_data.get('latitude') and register_data.get('longitude'):
            db.collection('users').document(uid).collection('position').add({
                'coordinates': firestore.GeoPoint(
                    float(register_data['latitude']),
                    float(register_data['longitude'])
                ),
                'timestamp': firestore.SERVER_TIMESTAMP
            })

        # Nettoyer la session
        session.pop('register_data', None)
        session.pop('verification_code', None)
        session.pop('code_expiry', None)

        redirect_url = '/company_dashboard' if register_data['account_type'] == 'company' else '/user_dashboard'
        return jsonify({
            'success': True,
            'message': 'Inscription réussie !',
            'redirect_url': redirect_url
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erreur : {str(e)}',
            'clear_fields': True
        }), 400


@auth_bp.route('/update_position', methods=['POST'])
def update_position():
    if 'uid' not in session or session.get('account_type') != 'individual':
        return jsonify({'error': 'Accès non autorisé ou compte non individuel'}), 403

    data = request.json
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not latitude or not longitude:
        return jsonify({'error': 'Latitude ou longitude manquante'}), 400

    try:
        db = firestore.client()
        user_doc = db.collection('users').document(session['uid']).get()
        if not user_doc.exists or user_doc.to_dict().get('accountType') != 'individual':
            return jsonify({'error': 'Utilisateur non trouvé ou compte non individuel'}), 403

        db.collection('users').document(session['uid']).collection('position').add({
            'coordinates': firestore.GeoPoint(float(latitude), float(longitude)),
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la mise à jour de la position : {str(e)}'}), 500


@auth_bp.route('/resend_verification_code', methods=['POST'])
def resend_verification_code_api():
    if 'register_data' not in session:
        return jsonify({'success': False, 'message': 'Session expirée.'}), 400

    email = session['register_data']['email']
    code = generate_verification_code()
    session['verification_code'] = code
    session['code_expiry'] = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

    if send_verification_email(email, code):
        return jsonify({'success': True, 'message': 'Nouveau code envoyé.'})
    else:
        return jsonify({'success': False, 'message': 'Erreur lors de l’envoi du code.'})


@auth_bp.route('/check_account_type', methods=['POST'])
def check_account_type():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'account_type': None}), 400

    try:
        user = auth.get_user_by_email(email)
        db = firestore.client()
        user_doc = db.collection('users').document(user.uid).get()
        if user_doc.exists:
            account_type = user_doc.to_dict().get('accountType', None)
            return jsonify({'account_type': account_type})
        return jsonify({'account_type': None})
    except auth.UserNotFoundError:
        return jsonify({'account_type': None})
    except Exception as e:
        return jsonify({'account_type': None, 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login_api():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')  # vérification mot de passe ici si nécessaire
    try:
        user = auth.get_user_by_email(email)
        session['uid'] = user.uid
        user_doc = db.collection('users').document(user.uid).get()
        if user_doc.exists:
            account_type = user_doc.to_dict().get('accountType', 'individual')
            session['account_type'] = account_type
            db.collection('users').document(user.uid).update({'lastLogin': datetime.utcnow()})

            # Redirection selon type
            if account_type == 'individual':
                redirect_url = '/user_dashboard'
            else:  # 'company'
                redirect_url = '/company_dashboard'

            return jsonify({
                'success': True,
                'message': 'Connexion réussie',
                'redirect_url': redirect_url,
                'uid': user.uid
            })

        return jsonify({'success': False, 'message': 'Utilisateur non trouvé'}), 404
    except auth.UserNotFoundError:
        return jsonify({'success': False, 'message': 'Email inconnu'}), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@auth_bp.route('/reset_password', methods=['POST'])
def reset_password_api():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'success': False, 'message': 'Email requis'}), 400
    try:
        auth.get_user_by_email(email)
        reset_code = generate_verification_code()
        session['reset_email'] = email
        session['reset_code'] = reset_code
        session['reset_expiry'] = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

        if send_verification_email(email, f"Code de réinitialisation : {reset_code}"):
            return jsonify({'success': True, 'message': 'Code de réinitialisation envoyé'})
        else:
            return jsonify({'success': False, 'message': 'Erreur lors de l’envoi du code'}), 500
    except auth.UserNotFoundError:
        return jsonify({'success': False, 'message': 'Aucun compte associé à cet email'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@auth_bp.route('/verify_reset_code', methods=['POST'])
def verify_reset_code_api():
    data = request.get_json()
    code = data.get('verification_code')

    if 'reset_email' not in session or 'reset_code' not in session:
        return jsonify({'success': False, 'message': 'Session expirée'}), 400

    expiry = datetime.fromisoformat(session['reset_expiry'])
    if datetime.utcnow() > expiry:
        return jsonify({'success': False, 'message': 'Code expiré'}), 400

    if code == session['reset_code']:
        email = session['reset_email']
        # On ne supprime les sessions qu’après la mise à jour du mot de passe
        return jsonify({'success': True, 'message': 'Code valide', 'email': email})
    else:
        return jsonify({'success': False, 'message': 'Code incorrect'}), 400


@auth_bp.route('/set_new_password', methods=['POST'])
def set_new_password_api():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email et mot de passe requis'}), 400

    try:
        user = auth.get_user_by_email(email)
        auth.update_user(user.uid, password=password)

        # Supprimer les infos de session reset
        session.pop('reset_email', None)
        session.pop('reset_code', None)
        session.pop('reset_expiry', None)

        return jsonify({'success': True, 'message': 'Mot de passe mis à jour'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout_api():
    session.pop('uid', None)
    session.pop('account_type', None)
    return jsonify({'success': True, 'message': 'Déconnecté'})


# === PROFIL UTILISATEUR ===
@auth_bp.route('/profile_info', methods=['GET'])
def profile_info():
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    uid = session['uid']
    user_doc = db.collection('users').document(uid).get()
    if not user_doc.exists:
        return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404

    user_data = user_doc.to_dict()
    user_data['uid'] = uid
    user_data['account_type'] = session.get('account_type')

    return jsonify({'success': True, 'profile': user_data})


@auth_bp.route('/update_profile', methods=['POST'])
def update_profile():
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    uid = session['uid']
    data = request.get_json()

    account_type = session.get('account_type')
    update_data = {}

    if account_type == 'individual':
        allowed_fields = [
            'first_name', 'name', 'phone', 'location', 'country', 'user_role',
            'bio', 'skills', 'languages', 'portfolio', 'experience', 'education',
            'linkedin', 'cvUrl', 'cvName', 'achievements'
        ]
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
    elif account_type == 'company':
        allowed_fields = ['company_name', 'city', 'country', 'industry', 'company_size', 'geographic_area']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field].strip() if isinstance(data[field], str) else data[field]

    if not update_data:
        return jsonify({'success': False, 'error': 'Aucune donnée valide à mettre à jour'}), 400

    try:
        db.collection('users').document(uid).update(update_data)
        return jsonify({'success': True, 'message': 'Profil mis à jour avec succès'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/get_presigned_cv_url', methods=['POST'])
def get_presigned_cv_url():
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    data = request.get_json()
    filename = data.get('filename')
    filetype = data.get('filetype')

    if not filename or not filetype:
        return jsonify({'success': False, 'error': 'Nom de fichier et type requis'}), 400

    # Génère un nom unique
    ext = filename.split('.')[-1].lower()
    key = f"cv/{session['uid']}/{uuid.uuid4()}.{ext}"

    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
            region_name=current_app.config['S3_REGION']
        )

        # UTILISATION DE generate_presigned_url pour une requête PUT
        presigned_url = s3_client.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': current_app.config['S3_BUCKET'],
                'Key': key,
                'ContentType': filetype
            },
            ExpiresIn=600,
            HttpMethod='PUT'
        )

        # L'URL publique sera construite manuellement comme avant
        final_public_url = f"https://{current_app.config['S3_BUCKET']}.s3.{current_app.config['S3_REGION']}.amazonaws.com/{key}"

        return jsonify({
            'success': True,
            'upload_url': presigned_url,      # L'URL PUT pour l'upload
            'final_url': final_public_url,    # L'URL publique à sauvegarder dans la DB
            'key': key
        })

    except Exception as e:
        print(f"Erreur S3 dans get_presigned_cv_url: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/profile/check', methods=['GET'])
def check_user_profile():
    """Vérifier si l'utilisateur a un profil complet et un CV."""
    if 'uid' not in session:
        return jsonify({'success': False, 'error': 'Non authentifié'}), 401

    user_id = session['uid']

    try:
        # CORRECTION : Récupérer le profil utilisateur depuis 'users' et non 'user_profiles'
        profile_doc = db.collection('users').document(user_id).get()

        if not profile_doc.exists:
            return jsonify({
                'success': True,
                'hasCV': False,
                'profileComplete': False,
                'profile': None
            }), 200

        profile = profile_doc.to_dict()

        # Vérifier la présence du CV - le champ pourrait être cvUrl ou cv_url
        hasCV = bool(profile.get('cvUrl') or profile.get('cv_url'))

        # Vérifier les champs essentiels pour un profil complet (individu)
        if profile.get('accountType') == 'individual':
            required_fields = ['first_name', 'name', 'email', 'phone', 'bio', 'skills']

            # Vérifier chaque champ
            profileComplete = True
            missing_fields = []

            for field in required_fields:
                field_value = profile.get(field)

                if field == 'skills':
                    # Vérifier que skills existe et n'est pas vide
                    if not field_value or (isinstance(field_value, list) and len(field_value) == 0):
                        profileComplete = False
                        missing_fields.append(field)
                elif field == 'bio':
                    # Bio peut être une chaîne vide
                    if field_value is None:
                        profileComplete = False
                        missing_fields.append(field)
                else:
                    # Pour les autres champs, vérifier qu'ils existent et ne sont pas vides
                    if not field_value:
                        profileComplete = False
                        missing_fields.append(field)
        else:
            # Pour les entreprises, le profil est toujours "complet" pour cette fonctionnalité
            profileComplete = True

        # Formater le profil pour le frontend
        formatted_profile = {
            'firstName': profile.get('first_name', ''),
            'lastName': profile.get('name', ''),
            'email': profile.get('email', ''),
            'phone': profile.get('phone', ''),
            'bio': profile.get('bio', ''),
            'skills': profile.get('skills', []),
            'cvUrl': profile.get('cvUrl') or profile.get('cv_url'),
            'cvName': profile.get('cvName') or profile.get('cv_name', 'CV'),
            'profileImageUrl': profile.get('profileImageUrl', ''),
            'accountType': profile.get('accountType', 'individual')
        }

        return jsonify({
            'success': True,
            'hasCV': hasCV,
            'profileComplete': profileComplete,
            'missingFields': missing_fields if 'missing_fields' in locals() else [],
            'profile': formatted_profile
        }), 200

    except Exception as e:
        print(f"Erreur check_user_profile: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500