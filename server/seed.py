from random import randint, choice
from faker import Faker

from app import app
from models import db, User, Record, Listing, Favorite, ListingType

fake = Faker()

if __name__ == '__main__':
    with app.app_context():
        print("🌱 Starting seed...")
        
        db.drop_all()
        print("Database file:", app.config['SQLALCHEMY_DATABASE_URI'])

        db.create_all()
        
        # Create Users
        users = []
        for _ in range(5):
            user = User(
                username=fake.user_name(),
                email=fake.email()
            )
            user.set_password("password123")
            users.append(user)
        
        db.session.add_all(users)
        db.session.commit()

        # Create Records
        records = []
        for _ in range(10):
            record = Record(
                title=fake.sentence(nb_words=3).rstrip('.'),
                artist=fake.name(),
                description=fake.paragraph(nb_sentences=2)
            )
            records.append(record)

        db.session.add_all(records)
        db.session.commit()

        # Create Listings
        listings = []
        for _ in range(10):
            listing = Listing(
                user=choice(users),
                record=choice(records),
                price=round(randint(100, 300) + 0.99, 2),
                location=fake.city(),
                condition=choice(['New', 'Used - Like New', 'Used - Good']),
                image_url=fake.image_url(),
                listing_type=choice([ListingType.SALE, ListingType.TRADE, ListingType.BOTH]),
            )
            listings.append(listing)

        db.session.add_all(listings)
        db.session.commit()

        # Create Favorites
        favorites = []
        
        # Create a set to track which (user_id, listing_id) combos we've already used
        used_pairs = set()
        
        

        
        for _ in range(10):
            user = choice(users)
            listing = choice(listings)
            
            pair = (user.id, listing.id)
            

            if pair not in used_pairs:
                favorite = Favorite(user=user, listing=listing)
                favorites.append(favorite)
                used_pairs.add(pair)

        db.session.add_all(favorites)
        db.session.commit()

        print("✅ Database seeded successfully!")
