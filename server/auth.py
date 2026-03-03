import os
from functools import wraps

import jwt
from jwt import PyJWKClient
from flask import request, g

from config import db

_jwks_client = None


def _get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(os.environ['CLERK_JWKS_URL'])
    return _jwks_client


def _verify_clerk_token(token):
    client = _get_jwks_client()
    signing_key = client.get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=['RS256'],
        options={'verify_aud': False},
    )


def _get_or_create_user(clerk_id, name=None, email=None):
    from models.user import User
    user = User.query.filter_by(clerk_id=clerk_id).first()
    if not user:
        user = User(clerk_id=clerk_id, name=name, email=email)
        db.session.add(user)
        db.session.commit()
    return user


def clerk_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return {'error': 'Missing or invalid authorization header.'}, 401

        token = auth_header[7:]
        try:
            payload = _verify_clerk_token(token)
        except Exception:
            return {'error': 'Invalid or expired token.'}, 401

        clerk_id = payload.get('sub')
        if not clerk_id:
            return {'error': 'Invalid token payload.'}, 401

        g.current_user = _get_or_create_user(clerk_id)
        return f(*args, **kwargs)

    return decorated


def get_current_user():
    return g.current_user
