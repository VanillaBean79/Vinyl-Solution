# server/seed.py

from app import app, db
from models import User, Record, Listing, Favorite

with app.app_context():
    print("Clearing old data...")
    Favorite.query.delete()
    Listing.query.delete()
    Record.query.delete()
    User.query.delete()

    print("Seeding users...")
    u1 = User(username="rubens", email="rubens@example.com")
    u2 = User(username="vinylhead", email="vinyl@example.com")

    print("Seeding records...")
    r1 = Record(title="Abbey Road", artist="The Beatles", description="1969 classic")
    r2 = Record(title="Kind of Blue", artist="Miles Davis", description="1959 jazz masterpiece")

    print("Seeding listings...")
    l1 = Listing(user=u1, record=r1, price=29.99, condition="VG+", location="Austin", image_url="https://via.placeholder.com/150")
    l2 = Listing(user=u2, record=r1, price=34.99, condition="NM", location="Chicago", image_url="https://via.placeholder.com/150")
    l3 = Listing(user=u1, record=r2, price=25.00, condition="G", location="Austin", image_url="https://via.placeholder.com/150")

    print("Seeding favorites...")
    f1 = Favorite(user=u2, listing=l1)

    db.session.add_all([u1, u2, r1, r2, l1, l2, l3, f1])
    db.session.commit()

    print("✅ Done seeding!")
