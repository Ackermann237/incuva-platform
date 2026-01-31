from flask import Flask, session, request, g
from flask_wtf import CSRFProtect
from flask_cors import CORS
from flask_babel import Babel
from .config import DevelopmentConfig
import os
import secrets
from .services.recruitment_service import RecruitmentService
from .services.talent_service import TalentService
from .services.messaging_service import MessagingService
from .services.job_service import JobService
from .services.favorite_service import FavoriteService
from .services.contract_service import ContractService
from .routes import ai_assistant
csrf = CSRFProtect()


def get_locale():
    """Determine the language to use based on session or HTTP headers."""
    if 'lang' in session:
        return session['lang']
    return request.accept_languages.best_match(['fr', 'en', 'es', 'de']) or 'fr'


def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    # Ensure a secure SECRET_KEY
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(16))
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to False for development
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PERMANENT_SESSION_LIFETIME'] = 2592000  # 30 days

    # Initialize CSRF protection
    csrf.init_app(app)

    # Load Firebase credentials
    from .firebase.init_firebase import db as firebase_db
    app.db = firebase_db

    # Configure Flask-Babel
    babel = Babel(app)
    app.config['BABEL_DEFAULT_LOCALE'] = 'fr'
    app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'app/translations'

    # Initialize services
    app.recruitment_service = RecruitmentService(app.db)
    app.talent_service = TalentService(app.db)
    app.messaging_service = MessagingService(app.db)
    app.job_service = JobService(app.db)
    app.favorite_service = FavoriteService(app.db)
    app.contract_service = ContractService(app.db)

    # Register blueprints
    from .routes import main, auth, dashboard, hr, messaging, jobs, contracts, users, employees, TrainingInterview, TechnicalTest, planning, absences, payroll, VisioTraining, ai_routes, Conversational

    csrf.exempt(auth.auth_bp)
    csrf.exempt(dashboard.dashboard_bp)
    csrf.exempt(ai_assistant.ai_assistant_bp)
    csrf.exempt(hr.hr_bp)
    csrf.exempt(messaging.messaging_bp)
    csrf.exempt(contracts.contracts_bp)
    csrf.exempt(jobs.jobs_bp)
    csrf.exempt(TrainingInterview.training_interview_bp)
    csrf.exempt(TechnicalTest.technical_test_bp)
    csrf.exempt(planning.planning_bp)
    csrf.exempt(absences.absences_bp)
    csrf.exempt(payroll.payroll_bp)
    csrf.exempt(VisioTraining.visio_training_bp)
    csrf.exempt(ai_routes.ai_bp)
    csrf.exempt(Conversational.conversational_bp)

    app.register_blueprint(main.main_api_bp, url_prefix='/')
    app.register_blueprint(auth.auth_bp, url_prefix='/auth')
    app.register_blueprint(dashboard.dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(hr.hr_bp, url_prefix='/hr')
    app.register_blueprint(messaging.messaging_bp, url_prefix='/messaging')
    app.register_blueprint(jobs.jobs_bp, url_prefix='/jobs')
    app.register_blueprint(contracts.contracts_bp, url_prefix='/contracts')
    app.register_blueprint(ai_assistant.ai_assistant_bp, url_prefix='/ai_assistant')
    app.register_blueprint(users.users_bp, url_prefix='/users')
    app.register_blueprint(employees.employees_bp, url_prefix='/employees')
    app.register_blueprint(TrainingInterview.training_interview_bp, url_prefix='/api/training-interview')
    app.register_blueprint(TechnicalTest.technical_test_bp, url_prefix='/api')
    app.register_blueprint(planning.planning_bp, url_prefix='/planning')
    app.register_blueprint(absences.absences_bp, url_prefix='/absences')
    app.register_blueprint(payroll.payroll_bp, url_prefix='/payroll')
    app.register_blueprint(VisioTraining.visio_training_bp, url_prefix='/api/visio-training')
    app.register_blueprint(ai_routes.ai_bp, url_prefix='/api/ai')
    app.register_blueprint(Conversational.conversational_bp, url_prefix='/api/conversational')

    # Make services and db available via app context
    @app.before_request
    def load_services():
        g.db = app.db
        g.recruitment_service = app.recruitment_service
        g.talent_service = app.talent_service
        g.messaging_service = app.messaging_service
        g.job_service = app.job_service
        g.favorite_service = app.favorite_service
        g.contract_service = app.contract_service

    CORS(app, supports_credentials=True)
    return app
