from flask import request, session
from flask_restful import Resource
from models import db, Favorite, User, Listing



def get_current_user():
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None


class FavoritesResource(Resource):
    def get(self):
        user = get_current_user()
        if not user:
            return {"error": "Unauthorized"}, 401
        
        
        favorites = Favorite.query.filter_by(user_id=user.id).all()
        favorites_data = []

        for favorite in favorites:
            favorites_data.append({
                "id": favorite.id,
                "user": {
                    "id": favorite.user.id,
                    "username": favorite.user.username
                },
                "listing": {
                    "id": favorite.listing.id,
                    "price": str(favorite.listing.price),
                    "location": favorite.listing.location,
                    "condition": favorite.listing.condition,
                    "image_url": favorite.listing.image_url,
                    "listing_type": favorite.listing.listing_type.value,
                    "description": favorite.listing.description,
                    "record": {
                        "id": favorite.listing.record.id,
                        "title": favorite.listing.record.title,
                        "artist": favorite.listing.record.artist
                    }
                }
            })

        return favorites_data, 200

    
    
    def post(self):
        user = get_current_user()
        if not user:
            return {"error": "Unauthorized "}, 401
        
        data = request.get_json()
        listing_id = data.get('listing_id')
        
        if not listing_id:
            return {"error": "Missing listing id."}, 400
        
        listing = Listing.query.get(listing_id)
        if not listing:
            return {"error": "Listing not found"}, 404
        
        #Prevent duplicate favorites
        existing = Favorite.query.filter_by(user_id=user.id,
                                            listing_id=listing.id
                                            ).first()
        if existing:
            return {"error": ' Already exists.'}, 400
        
        favorite = Favorite(user_id=user.id,
                            listing_id=listing.id
                            )
        db.session.add(favorite)
        db.session.commit()
        return favorite.to_dict(), 201
    
    
    
    
class FavoriteById(Resource):
    def get(self, id):
        favorite = Favorite.query.get(id)
        if not favorite:
            return {"error": "Favorite not found"}, 404

        return {
            "id": favorite.id,
            "user": {
                "id": favorite.user.id,
                "username": favorite.user.username
            },
            "listing": {
                "id": favorite.listing.id,
                "price": str(favorite.listing.price),
                "location": favorite.listing.location,
                "condition": favorite.listing.condition,
                "image_url": favorite.listing.image_url,
                "listing_type": favorite.listing.listing_type.value,
                "description": favorite.listing.description,
                "record": {
                    "id": favorite.listing.record.id,
                    "title": favorite.listing.record.title,
                    "artist": favorite.listing.record.artist
                }
            }
        }, 200

        