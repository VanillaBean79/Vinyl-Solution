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
        
        return user.to_dict(rules=('-password_hash',)), 201
        
        
        
        
        