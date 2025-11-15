# ==============================
#  Flask Backend — API Only
# ==============================

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
import csv
import io
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

# --- 初始化 Flask ---
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret")
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,          # Render 上是 HTTPS，必須 True
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),  # 可選，session 有效時間
)

# --- CORS 設定 ---
CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "https://travelrecord.onrender.com",   # 你的前端網址
            ]
        }
    },
)



# --- MongoDB 連線設定 ---
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise RuntimeError("❌ No MONGODB_URI found. Check environment variables.")

client = MongoClient(MONGODB_URI)
db = client["travel_journal"]
collection = db["trips"]
users = db["users"]


# =======================
#   Health Check
# =======================
@app.route("/")
def home():
    return jsonify({"ok": True, "service": "TravelRecord backend running"})


# =======================
#   Auth APIs
# =======================

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required"}), 400

    if users.find_one({"email": email}):
        return jsonify({"ok": False, "error": "Email already registered"}), 400

    password_hash = generate_password_hash(password)
    users.insert_one({"email": email, "password_hash": password_hash})

    return jsonify({"ok": True, "email": email})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"ok": False, "error": "User not found"}), 400

    if not check_password_hash(user["password_hash"], password):
        return jsonify({"ok": False, "error": "Wrong password"}), 400

    session["user_id"] = str(user["_id"])
    session["email"] = email

    return jsonify({"ok": True, "email": email})


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/me", methods=["GET"])
def me():
    email = session.get("email")
    if not email:
        return jsonify({"ok": False, "email": None}), 200
    return jsonify({"ok": True, "email": email}), 200


# =======================
#   Add one record
# =======================

@app.route("/api/add", methods=["POST"])
def add_one():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Not logged in"}), 401

    data = request.get_json() or {}
    data["user_id"] = session["user_id"]
    data["email"] = session.get("email")

    collection.insert_one(data)
    return jsonify({"ok": True, "message": "Data added"})


# =======================
#   Bulk upload
# =======================

@app.route("/api/bulk", methods=["POST"])
def bulk_add():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Not logged in"}), 401

    try:
        # JSON
        if request.content_type and request.content_type.startswith("application/json"):
            data = request.get_json()

        # CSV / JSON file
        elif "file" in request.files:
            file = request.files["file"]
            if file.filename.endswith(".csv"):
                stream = io.StringIO(file.stream.read().decode("utf-8"))
                reader = csv.DictReader(stream)
                data = list(reader)
            elif file.filename.endswith(".json"):
                data = json.load(file)
            else:
                return jsonify({"ok": False, "error": "Unsupported file type"}), 400
        else:
            return jsonify({"ok": False, "error": "No data"}), 400

        if not isinstance(data, list):
            data = [data]

        uid = session["user_id"]
        email = session["email"]

        for doc in data:
            doc["user_id"] = uid
            doc["email"] = email

        if data:
            collection.insert_many(data)

        return jsonify({"ok": True, "inserted": len(data)})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# =======================
#   Query All User Data
# =======================

@app.route("/api/all", methods=["GET"])
def get_all():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Not logged in"}), 401

    uid = session["user_id"]
    data = list(collection.find({"user_id": uid}, {"_id": 0}))
    return jsonify(data)


# =======================
#   Run Server
# =======================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
