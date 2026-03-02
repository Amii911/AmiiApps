from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from config import api, db
from models.problem import Problem


class Problems(Resource):
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())
        query = Problem.query.filter_by(user_id=user_id)

        difficulty = request.args.get('difficulty')
        platform = request.args.get('platform')
        status = request.args.get('status')

        if difficulty:
            query = query.filter_by(difficulty=difficulty)
        if platform:
            query = query.filter_by(platform=platform)
        if status:
            query = query.filter_by(status=status)

        problems = query.all()
        return [p.to_dict(rules=('-user',)) for p in problems], 200

    @jwt_required()
    def post(self):
        user_id = int(get_jwt_identity())
        data = request.get_json()

        required = ('title', 'platform', 'difficulty', 'status')
        if not data or not all(k in data for k in required):
            return {'error': 'Title, platform, difficulty, and status are required.'}, 400

        problem = Problem(
            title=data['title'],
            platform=data['platform'],
            difficulty=data['difficulty'],
            status=data['status'],
            category=data.get('category'),
            notes=data.get('notes'),
            link=data.get('link'),
            date_solved=data.get('date_solved'),
            user_id=user_id,
        )

        db.session.add(problem)
        db.session.commit()
        return problem.to_dict(rules=('-user',)), 201


class ProblemById(Resource):
    @jwt_required()
    def get(self, id):
        user_id = int(get_jwt_identity())
        problem = Problem.query.get(id)

        if not problem:
            return {'error': 'Problem not found.'}, 404
        if problem.user_id != user_id:
            return {'error': 'Unauthorized.'}, 403

        return problem.to_dict(rules=('-user',)), 200

    @jwt_required()
    def patch(self, id):
        user_id = int(get_jwt_identity())
        problem = Problem.query.get(id)

        if not problem:
            return {'error': 'Problem not found.'}, 404
        if problem.user_id != user_id:
            return {'error': 'Unauthorized.'}, 403

        data = request.get_json()
        for field in ('title', 'platform', 'difficulty', 'status', 'category', 'notes', 'link', 'date_solved'):
            if field in data:
                setattr(problem, field, data[field])

        db.session.commit()
        return problem.to_dict(rules=('-user',)), 200

    @jwt_required()
    def delete(self, id):
        user_id = int(get_jwt_identity())
        problem = Problem.query.get(id)

        if not problem:
            return {'error': 'Problem not found.'}, 404
        if problem.user_id != user_id:
            return {'error': 'Unauthorized.'}, 403

        db.session.delete(problem)
        db.session.commit()
        return {'message': 'Problem deleted.'}, 200


class ProblemStats(Resource):
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())
        problems = Problem.query.filter_by(user_id=user_id).all()

        solved = [p for p in problems if p.status == 'solved']
        breakdown = {}
        for p in solved:
            breakdown[p.difficulty] = breakdown.get(p.difficulty, 0) + 1

        return {
            'total_solved': len(solved),
            'total_problems': len(problems),
            'by_difficulty': breakdown,
        }, 200


api.add_resource(Problems, '/problems')
api.add_resource(ProblemById, '/problems/<int:id>')
api.add_resource(ProblemStats, '/problems/stats')
