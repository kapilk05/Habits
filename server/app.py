from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.sql import func
from datetime import datetime, timedelta, date

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///habits.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    goal = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.Date, default=func.current_date())

class Completion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey('habit.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=func.current_date())

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return jsonify({
        "status": "running",
        "message": "Habit Tracker API",
        "endpoints": {
            "register": "POST /register",
            "create_habit": "POST /habits",
            "complete_habit": "POST /habits/<habit_id>/complete",
            "get_habits": "GET /habits?user_id=<user_id>",
            "history": "GET /habits/history?user_id=<id>&start=YYYY-MM-DD&end=YYYY-MM-DD",
            "missed_today": "GET /habits/missed/today?user_id=<id>",
            "missed_past": "GET /habits/missed/previous?user_id=<id>",
            "performance": "GET /habits/performance?user_id=<id>",
            "edit_habit": "PUT /habits/<habit_id>",
            "delete_habit": "DELETE /habits/<habit_id>"
        }
    })

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    user = User(username=username, password=password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered', 'user_id': user.id}), 201

@app.route('/habits', methods=['POST'])
def create_habit():
    data = request.get_json()
    name = data.get('name')
    goal = data.get('goal')
    user_id = data.get('user_id')

    if name is None or goal is None or user_id is None:
        return jsonify({'error': 'Missing fields'}), 400

    habit = Habit(name=name, goal=goal, user_id=user_id)
    db.session.add(habit)
    db.session.commit()
    return jsonify({'message': 'Habit created', 'habit_id': habit.id}), 201

@app.route('/habits/<int:habit_id>/complete', methods=['POST'])
def complete_habit(habit_id):
    today = date.today()
    already_completed = Completion.query.filter_by(habit_id=habit_id, date=today).first()
    if already_completed:
        return jsonify({'message': 'Already marked complete today'}), 400

    completion = Completion(habit_id=habit_id, date=today)
    db.session.add(completion)
    db.session.commit()
    return jsonify({'message': 'Marked complete'}), 200

@app.route('/habits', methods=['GET'])
def get_habits():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    habits = Habit.query.filter_by(user_id=user_id).all()
    today = date.today()
    results = []

    for habit in habits:
        logs = Completion.query.filter_by(habit_id=habit.id).order_by(Completion.date.desc()).all()
        dates = [log.date for log in logs]

        streak = 0
        day = today
        while day in dates:
            streak += 1
            day -= timedelta(days=1)

        total_days = (today - habit.created_at).days + 1
        consistency = round((len(dates) / total_days) * 100, 2) if total_days > 0 else 0

        results.append({
            'habit_id': habit.id,
            'name': habit.name,
            'goal_days': habit.goal,
            'created_at': habit.created_at.isoformat(),
            'completed_days': len(dates),
            'current_streak': streak,
            'consistency_percent': consistency
        })

    return jsonify(results), 200

@app.route('/habits/history', methods=['GET'])
def habit_history():
    user_id = request.args.get('user_id')
    start = request.args.get('start')
    end = request.args.get('end')

    if not all([user_id, start, end]):
        return jsonify({'error': 'Missing parameters'}), 400

    habits = Habit.query.filter_by(user_id=user_id).all()
    habit_map = {h.id: h.name for h in habits}

    start_date = datetime.strptime(start, '%Y-%m-%d').date()
    end_date = datetime.strptime(end, '%Y-%m-%d').date()

    logs = Completion.query.filter(
        Completion.habit_id.in_(habit_map.keys()),
        Completion.date.between(start_date, end_date)
    ).all()

    history = [{
        'habit_id': log.habit_id,
        'name': habit_map.get(log.habit_id, f"Habit {log.habit_id}"),
        'date': log.date.isoformat()
    } for log in logs]

    return jsonify(history), 200

@app.route('/habits/missed/today', methods=['GET'])
def missed_today():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    today = date.today()
    habits = Habit.query.filter_by(user_id=user_id).all()
    missed = []

    for habit in habits:
        completed = Completion.query.filter_by(habit_id=habit.id, date=today).first()
        if not completed:
            missed.append({'habit_id': habit.id, 'name': habit.name})

    return jsonify(missed), 200

@app.route('/habits/missed/previous', methods=['GET'])
def missed_previous():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    habits = Habit.query.filter_by(user_id=user_id).all()
    missed_logs = []

    for habit in habits:
        total_days = (date.today() - habit.created_at).days
        all_dates = set(habit.created_at + timedelta(days=i) for i in range(total_days))
        completed_dates = set(c.date for c in Completion.query.filter_by(habit_id=habit.id).all())
        missed_dates = sorted(all_dates - completed_dates)

        for d in missed_dates:
            if d < date.today():
                missed_logs.append({'habit_id': habit.id, 'name': habit.name, 'missed_date': d.isoformat()})

    return jsonify(missed_logs), 200

@app.route('/habits/performance', methods=['GET'])
def habit_performance():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    habits = Habit.query.filter_by(user_id=user_id).all()
    today = date.today()

    habit_stats = []
    for habit in habits:
        completions = Completion.query.filter_by(habit_id=habit.id).all()
        completed_dates = [c.date for c in completions]
        total_days = (today - habit.created_at).days + 1
        consistency = (len(completed_dates) / total_days) * 100 if total_days > 0 else 0

        streak = 0
        day = today
        while day in completed_dates:
            streak += 1
            day -= timedelta(days=1)

        habit_stats.append({
            'habit_id': habit.id,
            'name': habit.name,
            'completed_days': len(completed_dates),
            'consistency': round(consistency, 2),
            'streak': streak
        })

    if not habit_stats:
        return jsonify({'message': 'No habits found'}), 404

    best = max(habit_stats, key=lambda x: x['consistency'])
    worst = min(habit_stats, key=lambda x: x['consistency'])

    return jsonify({
        'best_performing': best,
        'worst_performing': worst,
        'all_stats': habit_stats
    }), 200

@app.route('/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    habit = Habit.query.get(habit_id)
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404

    Completion.query.filter_by(habit_id=habit.id).delete()
    db.session.delete(habit)
    db.session.commit()
    return jsonify({'message': 'Habit deleted'}), 200

@app.route('/habits/<int:habit_id>', methods=['PUT'])
def edit_habit(habit_id):
    data = request.get_json()
    new_goal = data.get('goal')
    if new_goal is None:
        return jsonify({'error': 'Goal required'}), 400

    habit = Habit.query.get(habit_id)
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404

    habit.goal = new_goal
    db.session.commit()
    return jsonify({'message': 'Habit updated'}), 200

if __name__ == '__main__':
    app.run(debug=True)
