Demo video -- https://youtu.be/jGxbcFB1qC0
Check the postman collection for endpoints!
# Daily Habits Tracker API

## 🚀 Tech Stack

- Python + Flask  
- Flask-SQLAlchemy  
- SQLite  
- Flask-CORS  
- Werkzeug for password hashing

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/daily-habit-tracker.git
cd daily-habit-tracker
````

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Flask server

```bash
python app.py
```

The server will run at `http://127.0.0.1:5000/`

---

## 📦 Requirements File (`requirements.txt`)

```
Flask
Flask-SQLAlchemy
Flask-CORS
Werkzeug
```

---
## Working Project 


## 📬 Sample API Requests

### 🔐 Register a new user

```bash
curl -X POST http://127.0.0.1:5000/register \
-H "Content-Type: application/json" \
-d '{"username": "john", "password": "doe123"}'
```

---

### 🔐 Login

```bash
curl -X POST http://127.0.0.1:5000/login \
-H "Content-Type: application/json" \
-d '{"username": "john", "password": "doe123"}'
```

Response:

```json
{
  "message": "Login successful",
  "user_id": 1
}
```

---

### ➕ Create a new habit

```bash
curl -X POST http://127.0.0.1:5000/habits \
-H "Content-Type: application/json" \
-d '{"name": "Read Book", "goal": 7, "user_id": 1}'
```

---

### 📥 Get all habits

```bash
curl "http://127.0.0.1:5000/habits?user_id=1"
```

---

### ✅ Mark a habit complete

```bash
curl -X POST http://127.0.0.1:5000/habits/1/complete
```

---

### 🧾 View completion history

```bash
curl "http://127.0.0.1:5000/habits/history?user_id=1&start=2024-06-01&end=2024-06-28"
```

---

### ❌ Missed Habits (Today + Past)

```bash
curl "http://127.0.0.1:5000/habits/missed/today?user_id=1"
curl "http://127.0.0.1:5000/habits/missed/previous?user_id=1"
```

---

### 📊 Best/Worst Performing Habits

```bash
curl "http://127.0.0.1:5000/habits/performance?user_id=1"
```

---

### ✏️ Edit Goal for a Habit

```bash
curl -X PUT http://127.0.0.1:5000/habits/1 \
-H "Content-Type: application/json" \
-d '{"goal": 10}'
```

---

### 🗑️ Delete a Habit

```bash
curl -X DELETE http://127.0.0.1:5000/habits/1
```


