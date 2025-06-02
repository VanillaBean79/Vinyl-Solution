from flask import request, session
from flask_restful import Resource
from models import db, Listing


class ListingResource(Resource):
    def get(self):
        listings = Listing.query.all()
        return[listing.to_dict(rules=('-user.listings', '-record.listings', '-favorites')) for listing in listings], 200
    
    
    def post(self):
        data = request.get_json()
        
        new_listing = Listing(
            user_id=data.get('user_id'),
            record_id=data.get('record_id'),
            price=data.get('price'),
            location=data.get('location'),
            condition=data.get('condition'),
            image_url=data.get('image_url'),
            listing_type=data.get('listing_type'),
            description=data.get('description'),
        )
        db.session.add(new_listing)
        db.session.commit()
        
        return new_listing.to_dict(rules=('-user.listings', '-record.listings', '-favorites')), 201
    
    
    
class ListingByID(Resource):
    def get(self, id):
        
        listing = Listing.query.get(id)
        
        if listing:
            return listing.to_dict(rules=('-user.listings', '-record.listings', '-favorites')), 200
        else:
            return {"message": "Lising not found."}
        
        
    def patch(self, id):
        listing = Listing.query.get(id)
        if not listing:
            return {"error": "Listing not found."}, 404

        data = request.get_json()

        for field in ['price', 'location', 'condition', 'image_url', 'listing_type', 'description']:
            if field in data:
                setattr(listing, field, data[field])

        db.session.commit()
        return listing.to_dict(rules=('-user.listings', '-record.listings', '-favorites')), 200

            
            
    def delete(self, id):
        listing = Listing.query.get(id)
        if not listing:
            return {"error": "Listing not found."}
        
        db.session.delete(listing)
        db.session.commit()
        
        return {}, 204
