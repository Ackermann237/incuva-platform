import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '..', '.env'))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev_key")
    DEBUG = False
    WTF_CSRF_SECRET_KEY = os.getenv("WTF_CSRF_SECRET_KEY", "dev_csrf_key")
    SESSION_TYPE = 'filesystem'

    # Firebase
    FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")
    FIREBASE_AUTH_DOMAIN = os.getenv("FIREBASE_AUTH_DOMAIN")
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
    FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET")
    FIREBASE_MESSAGING_SENDER_ID = os.getenv("FIREBASE_MESSAGING_SENDER_ID")
    FIREBASE_APP_ID = os.getenv("FIREBASE_APP_ID")
    FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS")

    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    S3_BUCKET = os.getenv("S3_BUCKET_NAME")
    S3_REGION = os.getenv("S3_REGION")

    # AGORA
    AGORA_APP_ID = os.getenv("AGORA_APP_ID")  # Remplacez par votre App ID Agora.io
    AGORA_APP_CERTIFICATE = os.getenv("AGORA_APP_CERTIFICATE")  # Remplacez par votre App ID Agora.io

    # HUGGING FACE
    HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

    # AssemblyAI
    ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    DEBUG = True
