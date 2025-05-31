# app.py

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from config import DevelopmentConfig  # 👈 import your config
from models import User, Record, Listing, Favorite
from flask import Flask
from models import db


# Initialize Flask app
app = Flask(__name__)
app.config.from_object(DevelopmentConfig)  # 👈 load dev config

# Set up metadata naming conventions
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

# Initialize extensions

migrate = Migrate(app, db)
db.init_app(app)
api = Api(app)
CORS(app)




if __name__ == '__main__':
    app.run(port=555, debug=True)




















if __name__ == '__main__':
    app.run(port=5555, debug=True)

