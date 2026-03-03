import re

from flask import request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_restful import Resource

from config import api, db
from models.user import User

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


class Signup(Resource):
    def post(self):
        data = request.get_json()

        if not data or not all(k in data for k in ('name', 'email', 'password')):
            return {'error': 'Name, email, and password are required.'}, 400

        if not EMAIL_RE.match(data['email']):
            return {'error': 'Invalid email address.'}, 422

        if len(data['password']) < 8:
            return {'error': 'Password must be at least 8 characters.'}, 422

        if User.query.filter_by(email=data['email']).first():
            return {'error': 'Email already registered.'}, 409

        user = User(name=data['name'], email=data['email'])
        user.password = data['password']

        db.session.add(user)
        db.session.commit()

        token = create_access_token(identity=str(user.id))
        return {'user': user.to_dict(), 'access_token': token}, 201


class Login(Resource):
    def post(self):
        data = request.get_json()

        if not data or not all(k in data for k in ('email', 'password')):
            return {'error': 'Email and password are required.'}, 400

        user = User.query.filter_by(email=data['email']).first()

        if not user or not user.authenticate(data['password']):
            return {'error': 'Invalid email or password.'}, 401

        token = create_access_token(identity=str(user.id))
        return {'user': user.to_dict(), 'access_token': token}, 200


class CheckSession(Resource):
    @jwt_required()
    def get(self):
        user = User.query.get(int(get_jwt_identity()))
        if not user:
            return {'error': 'User not found.'}, 404
        return user.to_dict(), 200


class Logout(Resource):
    @jwt_required()
    def delete(self):
        return {'message': 'Logged out successfully.'}, 200


api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(CheckSession, '/check_session')
api.add_resource(Logout, '/logout')
