# config.py
import os

# Absolute path to current directory (where config.py lives)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Final path to the SQLite DB file
DB_PATH = os.path.join(BASE_DIR, 'app.db')
DB_URI = f"sqlite:///{DB_PATH}"

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super_secret_key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_COMPACT = False

class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', DB_URI)
    DEBUG = True

    # Flask-Session configs
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_COOKIE_NAME = 'vinyl_session'
    SESSION_COOKIE_SAMESITE = 'Lax'  # <- VERY important
    SESSION_COOKIE_SECURE = False   # <- True only in production with HTTPS

    


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    DEBUG = False
    JSON_COMPACT = True

print("🔧 Using DB at:", DB_URI)
