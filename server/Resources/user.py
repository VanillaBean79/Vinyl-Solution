from flask import request, session
from flask_restful import Resource
from models import User
from models import db



class Signup(Resource):
    def post(self):
        
        #retrieve imput from user
        data = request.get_json()
        
        #check to see if the username is already being used.
        if User.query.filter_by(username = data['username']).first():
            return {'error': 'Username already taken.'}, 409
        
        #create a new user instance.
        user = User(
            username = data['username'],
            email = data['email'],
        )
        #set password securely.
        user.set_password(data['password'])
        
        
        db.session.add(user)
        db.session.commit()
        
        #Store the user's ID in the session.
        session['user_id'] = user.id
        
        return user.to_dict(), 201
    
    

class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data.get('username')).first()
        
        if user and user.check_password(data.get('password')):
            session['user_id'] = user.id
            return user.to_dict(rules=('-password_hash', '-favorites.user', '-listings.user',)), 200
        
        return {'error': 'Invalid username or password'}, 401
        
        
        
class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return{}, 204
    
    

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': "Not logged in"}, 401

        user = User.query.get(user_id)
        if not user:
            session.pop('user_id', None)
            return {'error': "User not found"}, 404

        # Build record data with nested listings
        records_set = {listing.record for listing in user.listings}
        records_data = []

        for record in records_set:
            listings_data = []
            for listing in record.listings:
                listings_data.append({
                    "id": listing.id,
                    "price": str(listing.price),
                    "location": listing.location,
                    "condition": listing.condition,
                    "image_url": listing.image_url,
                    "listing_type": listing.listing_type.value,
                    "description": listing.description,
                    "user": {
                        "id": listing.user.id,
                        "username": listing.user.username
                    }
                })

            records_data.append({
                "id": record.id,
                "title": record.title,
                "artist": record.artist,
                "listings": listings_data
            })

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "records": records_data
        }, 200
