from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates, relationship
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import enum
from sqlalchemy import Enum, MetaData

# Migration-friendly naming conventions
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)

# Enum for listing types
class ListingType(enum.Enum):
    SALE = "sale"
    TRADE = "trade"
    BOTH = "both"

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)

    listings = relationship('Listing', back_populates='user', cascade='all, delete-orphan')
    favorites = relationship('Favorite', back_populates='user', cascade='all, delete-orphan')

    # Prevent deep cycles via listing > record > listing > user
    serialize_rules = (
        '-password_hash',
        '-listings.user',
        '-listings.record.listings',
        '-favorites.user',
        '-favorites.listing.favorites',
        '-favorites.listing.user',
        '-favorites.listing.record.listings',
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @validates('username')
    def validate_username(self, key, value):
        if not value or not value.strip():
            raise ValueError("Username is required.")
        return value

    @validates('email')
    def validate_email(self, key, value):
        if '@' not in value:
            raise ValueError("Email must be valid.")
        existing_user = User.query.filter_by(email=value).first()
        if existing_user:
            raise ValueError("Email already in use.")
        return value

class Record(db.Model, SerializerMixin):
    __tablename__ = 'records'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    artist = db.Column(db.String, nullable=False)

    listings = relationship('Listing', back_populates='record', cascade='all, delete-orphan')

    # Prevent record.listings → listing.record loop
    serialize_rules = (
        '-listings.record',
        '-listings.user.listings',
        '-listings.user.favorites',
        '-listings.favorites',
    )

    @validates('title', 'artist')
    def validate_text_fields(self, key, value):
        if not value or not value.strip():
            raise ValueError(f"{key.capitalize()} cannot be blank.")
        return value

class Listing(db.Model, SerializerMixin):
    __tablename__ = 'listings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    record_id = db.Column(db.Integer, db.ForeignKey('records.id'), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    location = db.Column(db.String)
    condition = db.Column(db.String)
    image_url = db.Column(db.String)
    listing_type = db.Column(Enum(ListingType), nullable=False)
    description = db.Column(db.Text)

    user = relationship('User', back_populates='listings')
    record = relationship('Record', back_populates='listings')
    favorites = relationship('Favorite', back_populates='listing', cascade='all, delete-orphan')

    serialize_rules = (
        '-user.listings',
        '-user.favorites',
        '-record.listings',
        '-favorites.listing',
        '-record.listings.record',
        '-favorites.user.favorites',
    )

    @validates('listing_type')
    def validate_listing_type(self, key, value):
        if isinstance(value, str):
            try:
                value = ListingType(value.lower())
            except ValueError:
                raise ValueError("listing_type must be 'sale', 'trade', or 'both'.")
        elif not isinstance(value, ListingType):
            raise ValueError("Invalid listing_type provided.")
        return value

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

    serialize_rules = (
        '-user.favorites',
        '-listing.favorites',
        '-listing.user.favorites',
        '-listing.user.listings',
        '-listing.record.listings',
    )

