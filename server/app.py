#!/usr/bin/env python3

# Local imports
from config import app, db, api

# Import models to register them with SQLAlchemy
from models.models import *

# Import routes to register them with the API
from routes.routes import *


@app.route('/')
def index():
    return '<h1>AmiiApps</h1>'


if __name__ == '__main__':
    app.run(port=5555, debug=True)
