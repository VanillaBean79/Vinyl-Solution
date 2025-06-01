# config.py

import os

# Base directory path for file-based databases like SQLite
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    """Base config class with default settings."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super_secret_key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_COMPACT = False

class DevelopmentConfig(Config):
    """Settings for local development."""
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///' + os.path.join(BASE_DIR, 'app.db')
    )
    DEBUG = True

class ProductionConfig(Config):
    """Settings for deployment (Heroku, Render, etc.)."""
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')  # set this in prod
    DEBUG = False
    JSON_COMPACT = True


print("Using DB at:", 'sqlite:///' + os.path.join(BASE_DIR, 'app.db'))
