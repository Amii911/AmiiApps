#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")

        from models.user import User
        from models.problem import Problem

        Problem.query.delete()
        User.query.delete()

        users = [
            User(name="Alice Dev", email="alice@example.com"),
            User(name="Bob Coder", email="bob@example.com"),
        ]
        users[0].password = "password123"
        users[1].password = "password123"

        db.session.add_all(users)
        db.session.commit()

        difficulties = ["Easy", "Medium", "Hard"]
        statuses = ["solved", "attempted", "todo"]
        categories = ["Arrays", "Strings", "Trees", "Graphs", "DP", "Linked Lists"]
        platforms = ["LeetCode", "HackerRank", "Codeforces"]

        problems = [
            Problem(
                title=fake.bs().title(),
                platform=rc(platforms),
                difficulty=rc(difficulties),
                status=rc(statuses),
                category=rc(categories),
                notes=fake.sentence(),
                link=fake.url(),
                user_id=rc(users).id,
            )
            for _ in range(10)
        ]

        db.session.add_all(problems)
        db.session.commit()

        print(f"Seeded {len(users)} users and {len(problems)} problems.")
        print("Login with: alice@example.com / password123")
