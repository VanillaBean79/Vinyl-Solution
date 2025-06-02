
#IntegrityError helps to catch database constraints errors.
from sqlalchemy.exc import IntegrityError



from flask import request
from flask_restful import Resource
from models import db, Record

class Records(Resource):
    def get(self):
        records = Record.query.all()
        return [record.to_dict(rules=('listings',)) for record in records], 200

    def post(self):
        data = request.get_json()
        
        title = data.get('title')
        artist = data.get('artist')
        
        if not title or not artist:
            return {"error": "Title and artist are required."}, 400
        
        # Check if the record already exists
        existing_record = Record.query.filter_by(title=title, artist=artist).first()
        if existing_record:
            return existing_record.to_dict(), 200

        # Create a new record
        new_record = Record(title=title, artist=artist)
        db.session.add(new_record)
        db.session.commit()

        return new_record.to_dict(), 201

        
        
        


 