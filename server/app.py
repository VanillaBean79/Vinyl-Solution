# app.py

from flask import Flask, redirect, url_for, session
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os 
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from config import DevelopmentConfig  # 👈 import your config
from models import User, Record, Listing, Favorite
from flask import Flask
from models import db
from Resources.user import Signup, Login, Logout, CheckSession
from Resources.record import RecordResource
from Resources.listing import ListingResource, ListingByID
from Resources.favorite import FavoritesResource, FavoriteById




load_dotenv()


# Initialize Flask app
app = Flask(__name__)
app.config.from_object(DevelopmentConfig)  # 👈 load dev config
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "fallback_dev_secret_key")
oauth = OAuth(app)

github = oauth.register(
    name="github",
    client_id=os.environ.get("GITHUB_CLIENT_ID"),
    client_secret=os.environ.get("GITHUB_CLIENT_SECRET"),
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",  # <--- add this
    client_kwargs={'scope': 'user:email'},
)


# Set up metadata naming conventions
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

# Initialize extensions

migrate = Migrate(app, db)
db.init_app(app)
api = Api(app)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)


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
        return redirect("http://localhost:3000/profile")  # <-- redirect to frontend

    
    
class GitHubProfile(Resource):
    def get(self):
        user = session.get('user')
        if not user:
            return redirect(url_for('githublogin'))
        return {"message": f"Hello, {user['login']}!"}



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







if __name__ == '__main__':
    app.run(port=5555, debug=True)

