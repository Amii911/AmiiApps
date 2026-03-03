from sqlalchemy_serializer import SerializerMixin

from config import db


class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = ('-problems.user',)

    id = db.Column(db.Integer, primary_key=True)
    clerk_id = db.Column(db.String(128), unique=True, nullable=False)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    problems = db.relationship('Problem', back_populates='user', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.clerk_id}>'
