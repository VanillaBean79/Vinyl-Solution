# seed.py
from random import randint, choice
from faker import Faker

from app import create_app
from models import db, User, Record, Listing, Favorite, ListingType

fake = Faker()

app = create_app()



if __name__ == '__main__':
    with app.app_context():
        print("🌱 Seeding database at:", app.config['SQLALCHEMY_DATABASE_URI'])

        db.drop_all()
        db.create_all()

        # --- Users ---
        users = []
        for _ in range(5):
            user = User(
                username=fake.unique.user_name(),
                email=fake.unique.email()
            )
            user.set_password("password123")
            users.append(user)
        db.session.add_all(users)
        db.session.commit()

        # --- Records ---
        records = []
        for _ in range(10):
            record = Record(
                title=fake.sentence(nb_words=3).rstrip('.'),
                artist=fake.name()
            )
            records.append(record)
        db.session.add_all(records)
        db.session.commit()

        # --- Listings ---
        listings = []
        for _ in range(10):
            listing = Listing(
                user=choice(users),
                record=choice(records),
                price=round(randint(10, 100) + 0.99, 2),
                location=fake.city(),
                condition=choice(['New', 'Used - Like New', 'Used - Good']),
                image_url=fake.image_url(),
                listing_type=choice([ListingType.SALE, ListingType.TRADE, ListingType.BOTH]),
                description=fake.text(max_nb_chars=200)
            )
            listings.append(listing)
        db.session.add_all(listings)
        db.session.commit()

        # --- Favorites ---
        favorites = []
        used_pairs = set()
        for _ in range(10):
            user = choice(users)
            listing = choice(listings)
            if (user.id, listing.id) not in used_pairs:
                favorite = Favorite(user=user, listing=listing)
                favorites.append(favorite)
                used_pairs.add((user.id, listing.id))
        db.session.add_all(favorites)
        db.session.commit()

        print("✅ Database seeded successfully!")
