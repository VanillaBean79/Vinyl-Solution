# app.py
# app.py
import os
import time
from flask import Flask, redirect, url_for, session, request, jsonify, send_from_directory
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api, Resource
from werkzeug.utils import secure_filename

from config import DevelopmentConfig
from models import db
from Resources.user import Signup, Login, Logout, CheckSession, UserListResource
from Resources.record import RecordResource
from Resources.listing import ListingResource, ListingByID
from Resources.favorite import FavoritesResource, FavoriteById

load_dotenv()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "fallback_dev_secret_key")

    # Upload setup
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    @app.route('/upload_image', methods=['POST'])
    def upload_image():
        if 'image' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filename = f"{int(time.time())}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            image_url = f"http://localhost:5555/uploads/{filename}"
            return jsonify({'image_url': image_url}), 200
        return jsonify({'error': 'Invalid file type'}), 400

    @app.route('/uploads/<filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # OAuth setup
    oauth = OAuth(app)
    github = oauth.register(
        name="github",
        client_id=os.environ.get("GITHUB_CLIENT_ID"),
        client_secret=os.environ.get("GITHUB_CLIENT_SECRET"),
        access_token_url="https://github.com/login/oauth/access_token",
        authorize_url="https://github.com/login/oauth/authorize",
        api_base_url="https://api.github.com/",
        client_kwargs={'scope': 'user:email'},
    )

    class GitHubLogin(Resource):
        def get(self):
            redirect_uri = url_for('githubauth', _external=True)
            return github.authorize_redirect(redirect_uri)

    class GitHubAuth(Resource):
        def get(self):
            token = github.authorize_access_token()
            resp = github.get('user')
            user = resp.json()
            session['user'] = {
                'username': user['login'],
                'email': user.get('email', ''),
            }
            return redirect("http://localhost:3000/profile")

    class GitHubProfile(Resource):
        def get(self):
            user = session.get('user')
            if not user:
                return redirect(url_for('githublogin'))
            return {"message": f"Hello, {user['username']}!"}

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    api = Api(app)
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

    # Add API routes
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
    api.add_resource(UserListResource, '/users')

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(port=5555, debug=True)
