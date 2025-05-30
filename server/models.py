from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates, relationship
from config import db
from werkzeug.security import generate_password_hash, check_password_hash

import enum
from sqlalchemy import Enum


class ListingType(enum.Enum):
    SALE = "sale"
    TRADE = "trade"
    BOTH = "both"


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
        
        # Check if email is already being used. 
        existing_user = User.query.filter_by(email=value).first()
        if existing_user:
            raise ValueError("email already in use.")
        
        return value
    
    
    
class Record(db.Model, SerializerMixin):
    __tablename__ = 'records'
    
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    artist = db.Column(db.String, nullable=False)
    listing_type = db.Column(Enum(ListingType), nullable=False)
    description = db.Column(db.Text)
    
    
    listings = relationship('Listing', back_populates='records', cascade='all, delete-orphan')
    
    serialize_rules = ('-listings.record')
    
    
    @validates('title', 'artist')
    def validates_text_fields(self, key, value):
        if not value or not value.strip():
            raise ValueError(f"{key.capitalize()} cannot be blank.")
        return value
    
    @validates('listing_type')
    def validate_listing_type(self, key, value):
        if not value not in ['sale', 'trade', 'both']:
            raise ValueError("Listing_type must be 'sale', 'trade', or 'both'.")
        return value
    
    
class Listing(db.Model, SerializerMixin):
    __tablename__ = 'listings'
    
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.Foreign_key('users.id'), nullable=False)
    record_id = db.Column(db.Integer, db.Foreign_key('records.id'), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    location = db.Column(db.String)
    condition = db.Column(db.String)
    image_url = db.Column(db.String)
    
    
    user = relationship('User', back_populates='listings')
    record = relationship('Record', back_populates='listings')
    favorites = relationship('Favorite', back_populates='listings', cascade='all, delete-orphan')
    
    
    serialize_rules = ('-user.listings', '-record.listings', '-favorites.listing')
    
    
    @validates('price')
    def validate_price(self, key, value):
        if value is None or value <= 0:
            raise ValueError("Price must be greater than zero.")
        return value



class Favorite(db.Model, SerializerMixin):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)

    user = relationship('User', back_populates='favorites')
    listing = relationship('Listing', back_populates='favorites')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'listing_id', name='unique_favorite'),
    )
    
    serialize_rules = ('-user.favorites', '-listing.favorites')

