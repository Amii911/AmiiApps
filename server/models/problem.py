from sqlalchemy_serializer import SerializerMixin

from config import db


class Problem(db.Model, SerializerMixin):
    __tablename__ = 'problems'

    serialize_rules = ('-user.problems',)

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    platform = db.Column(db.String(100), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    category = db.Column(db.String(100))
    notes = db.Column(db.Text)
    link = db.Column(db.String(500))
    date_solved = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', back_populates='problems')

    def __repr__(self):
        return f'<Problem {self.title}>'
