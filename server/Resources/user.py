from flask import request, session
from flask_restful import Resource
from models import User, db, Listing
from sqlalchemy.orm import joinedload



class Signup(Resource):
    def post(self):
        data = request.get_json()

        # Check for existing username
        if User.query.filter_by(username=data['username']).first():
            return {'error': 'Username already taken.'}, 409

        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        session['user_id'] = user.id

        return user.to_dict(), 201


class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data.get('username')).first()

        if user and user.check_password(data.get('password')):
            session['user_id'] = user.id
            return user.to_dict(
                rules=(
                    '-password_hash',
                    '-favorites.user',
                    '-favorites.listing.favorites',
                    '-listings.user',
                    '-listings.favorites'
                )
            ), 200

        return {'error': 'Invalid username or password'}, 401


class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return {}, 204


class UserListResource(Resource):
    def get(self):
        users = User.query.all()
        users_data = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
            for user in users
        ]
        return users_data, 200



        
class CheckSession(Resource):
    def get(self):
        if 'user_id' in session:
            user = User.query.options(
                joinedload(User.listings).joinedload(Listing.record)  # ✅ FIX: use class-bound attribute
            ).get(session['user_id'])

            if not user:
                return {'error': 'User not found'}, 404

            records_dict = {}

            for listing in user.listings:
                record = listing.record
                record_id = record.id

                listing_data = {
                    "id": listing.id,
                    "price": str(listing.price),
                    "location": listing.location,
                    "condition": listing.condition,
                    "image_url": listing.image_url,
                    "listing_type": listing.listing_type.value,
                    "description": listing.description,
                    "user": {
                        "id": user.id,
                        "username": user.username
                    }
                }

                if record_id not in records_dict:
                    records_dict[record_id] = {
                        "id": record.id,
                        "title": record.title,
                        "artist": record.artist,
                        "listings": [listing_data]
                    }
                else:
                    records_dict[record_id]["listings"].append(listing_data)

            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "records": list(records_dict.values())
            }, 200

        return {'error': 'Not logged in'}, 401
