from flask import request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_restful import Resource

from config import api, db
from models.user import User


class Users(Resource):
    def post(self):
        data = request.get_json()

        if not data or not all(k in data for k in ('name', 'email', 'password')):
            return {'error': 'Name, email, and password are required.'}, 400

        if User.query.filter_by(email=data['email']).first():
            return {'error': 'Email already registered.'}, 409

        user = User(name=data['name'], email=data['email'])
        user.password = data['password']

        db.session.add(user)
        db.session.commit()

        token = create_access_token(identity=str(user.id))
        return {'user': user.to_dict(), 'access_token': token}, 201


class UserById(Resource):
    @jwt_required()
    def get(self, id):
        current_user_id = int(get_jwt_identity())
        if current_user_id != id:
            return {'error': 'Unauthorized.'}, 403

        user = User.query.get(id)
        if not user:
            return {'error': 'User not found.'}, 404

        return user.to_dict(), 200

    @jwt_required()
    def patch(self, id):
        current_user_id = int(get_jwt_identity())
        if current_user_id != id:
            return {'error': 'Unauthorized.'}, 403

        user = User.query.get(id)
        if not user:
            return {'error': 'User not found.'}, 404

        data = request.get_json()
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != id:
                return {'error': 'Email already in use.'}, 409
            user.email = data['email']
        if 'password' in data:
            user.password = data['password']

        db.session.commit()
        return user.to_dict(), 200

    @jwt_required()
    def delete(self, id):
        current_user_id = int(get_jwt_identity())
        if current_user_id != id:
            return {'error': 'Unauthorized.'}, 403

        user = User.query.get(id)
        if not user:
            return {'error': 'User not found.'}, 404

        db.session.delete(user)
        db.session.commit()
        return {'message': 'User deleted.'}, 200


api.add_resource(Users, '/users')
api.add_resource(UserById, '/users/<int:id>')
