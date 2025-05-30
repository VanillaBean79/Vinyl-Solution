from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates, relationship
from config import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    
    
    #Relationships
    listings = relationship('Listing', back_populates='user', cascade='all, delete-orphan')
    favorites = relationship('Favorite', back_populates='user', cascade='all, delete-orphan')
    
    # Serialize rules
    serialize_rules = ('-password_hash', '-favorite.user', '-listings.user') 
    
    # Password methods (set it and check it)
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    #Validations (value.strip() checks for white space (like ' '))
    @validates('username')
    def validates_username(self, key, value):
        if not value or not value.strip():
            raise ValueError("Username is required.")
        return value
    
    @ validates('email')
    def validate_email(self, key, value):
        if '@' not in value:
            raise ValueError('Email must be valid.')
        return value
    
    
    
