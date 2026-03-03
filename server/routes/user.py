from flask import request
from flask_restful import Resource

from auth import clerk_required, get_current_user
from config import api, db


class UserMe(Resource):
    @clerk_required
    def get(self):
        user = get_current_user()
        return user.to_dict(), 200

    @clerk_required
    def patch(self):
        user = get_current_user()
        data = request.get_json() or {}

        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']

        db.session.commit()
        return user.to_dict(), 200

    @clerk_required
    def delete(self):
        user = get_current_user()
        db.session.delete(user)
        db.session.commit()
        return {'message': 'Account deleted.'}, 200


api.add_resource(UserMe, '/users/me')
