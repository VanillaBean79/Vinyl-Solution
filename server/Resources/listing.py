from flask import request, session
from flask_restful import Resource
from models import db, Listing, Record


class ListingResource(Resource):
    def get(self):
        listings = Listing.query.all()
        return [listing.to_dict(only=(
            'id',
            'price',
            'location',
            'condition',
            'image_url',
            'listing_type',
            'description',
            'user.id',
            'user.username',
            'record.id',
            'record.title',
            'record.artist'
        )) for listing in listings], 200

    def post(self):
        data = request.get_json()

        # Check for existing record
        title = data.get('title')
        artist = data.get('artist')

        record = Record.query.filter_by(title=title, artist=artist).first()
        if not record:
            # Create the record if it doesn't exist
            record = Record(title=title, artist=artist)
            db.session.add(record)
            db.session.commit()

        # Create the new listing
        new_listing = Listing(
            user_id=data.get('user_id'),
            record_id=record.id,
            price=data.get('price'),
            location=data.get('location'),
            condition=data.get('condition'),
            image_url=data.get('image_url'),
            listing_type=data.get('listing_type'),
            description=data.get('description'),
        )

        db.session.add(new_listing)
        db.session.commit()

        return new_listing.to_dict(), 201
    
    
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
        
        return new_listing.to_dict(), 201
    
    
    
class ListingByID(Resource):
    def get(self, id):
        listing = Listing.query.get(id)

        if not listing:
            return {"message": "Listing not found."}, 404

        # Manually serialize to avoid circular reference
        data = {
            "id": listing.id,
            "price": str(listing.price),
            "location": listing.location,
            "condition": listing.condition,
            "image_url": listing.image_url,
            "listing_type": listing.listing_type.value,
            "description": listing.description,
            "user": {
                "id": listing.user.id,
                "username": listing.user.username,
            },
            "record": {
                "id": listing.record.id,
                "title": listing.record.title,
                "artist": listing.record.artist,
            },
        }

        return data, 200

        
        
    def patch(self, id):
        listing = Listing.query.get(id)
        if not listing:
            return {"message": "Listing not found"}, 404

        data = request.get_json()
        for field in ['price', 'location', 'condition', 'image_url', 'listing_type', 'description']:
            if field in data:
                setattr(listing, field, data[field])

        db.session.commit()

        # Serialize only flat fields to avoid recursion error
        return listing.to_dict(only=('id', 'price', 'location', 'condition', 'image_url', 'listing_type', 'description')), 200


            
            
    def delete(self, id):
        listing = Listing.query.get(id)
        if not listing:
            return {"message": "Listing not found."}, 404
        
        db.session.delete(listing)
        db.session.commit()
        return {"message": f"Listing {id} deleted successfully."}, 200
