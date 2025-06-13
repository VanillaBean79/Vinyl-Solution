import os
import time
from flask import Flask, redirect, url_for, session, request, jsonify, send_from_directory
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os
import time
from flask import Flask, redirect, url_for, session, request, jsonify, send_from_directory
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api, Resource
from werkzeug.utils import secure_filename
from flask_session import Session

from config import DevelopmentConfig
from models import db, User  # Make sure User is imported
from Resources.user import Signup, Login, Logout, CheckSession
from Resources.record import RecordResource
from Resources.listing import ListingResource, ListingByID
from Resources.favorite import FavoritesResource, FavoriteById
from Resources.upload import UploadImage, ServeUploadedFile

# Load .env variables
load_dotenv()

# Global OAuth object
oauth = OAuth()
github = None  # will hold registered client


def create_app(config_class=DevelopmentConfig):
    global github

    app = Flask(__name__)
    app.config.from_object(config_class)

    # Session setup
    Session(app)
    app.secret_key = os.environ.get("SECRET_KEY", "fallback_dev_secret_key")

    # Upload setup
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    api = Api(app)
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

    # Initialize OAuth
    oauth.init_app(app)
    github = oauth.register(
        name="github",
        client_id=os.environ.get("GITHUB_CLIENT_ID"),
        client_secret=os.environ.get("GITHUB_CLIENT_SECRET"),
        access_token_url="https://github.com/login/oauth/access_token",
        authorize_url="https://github.com/login/oauth/authorize",
        api_base_url="https://api.github.com/",
        client_kwargs={'scope': 'user:email'},
    )

    # GitHub OAuth Resources
    class GitHubLogin(Resource):
        def get(self):
            print("🔐 GitHubLogin session before redirect:", dict(session))

            # Clear old GitHub state tokens to prevent CSRF mismatch
            for key in list(session.keys()):
                if key.startswith('_state_github_'):
                    session.pop(key)

            redirect_uri = url_for('githubauth', _external=True)
            resp = github.authorize_redirect(redirect_uri)
            print("🔐 GitHubLogin session AFTER redirect call:", dict(session))
            return resp

    class GitHubAuth(Resource):
        def get(self):
            token = github.authorize_access_token()
            user_data = github.get('user').json()
            username = user_data.get('login')
            email = user_data.get('email')

            if not email:
                emails = github.get('user/emails').json()
                email = next((e['email'] for e in emails if e['primary'] and e['verified']), None)

            if not email:
                return {"error": "Email is required but not found from GitHub"}, 400

            user = User.query.filter_by(email=email).first()

            if not user:
                return redirect("http://localhost:3000/login?error=email-not-registered")

            session['user_id'] = user.id
            session['user'] = {
                'username': user.username,
                'email': user.email,
            }

            return redirect("http://localhost:3000/profile")


    class GitHubProfile(Resource):
        def get(self):
            user = session.get('user')
            if not user:
                return redirect(url_for('githublogin'))
            return {"message": f"Hello, {user['username']}!"}

    # Register RESTful resources
    api.add_resource(Signup, '/signup')
    api.add_resource(Login, '/login')
    api.add_resource(Logout, '/logout')
    api.add_resource(CheckSession, '/check_session')
    api.add_resource(RecordResource, '/records')
    api.add_resource(ListingResource, '/listings')
    api.add_resource(ListingByID, '/listings/<int:id>')
    api.add_resource(FavoritesResource, '/favorites')
    api.add_resource(FavoriteById, '/favorites/<int:id>')
    api.add_resource(GitHubLogin, '/login/github', endpoint='githublogin')
    api.add_resource(GitHubAuth, '/auth/github', endpoint='githubauth')
    api.add_resource(GitHubProfile, '/profile', endpoint='githubprofile')
    # api.add_resource(UserListResource, '/users')
    api.add_resource(UploadImage, '/upload_image')
    api.add_resource(ServeUploadedFile, '/uploads/<string:filename>')
    # api.add_resource(UserById, '/users/<int:id>')

    _ = migrate  # suppress unused warning

    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(port=5555, debug=True)
