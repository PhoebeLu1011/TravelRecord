# ==============================
#  app.py — Flask + MongoDB + Login
# ==============================

from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
import csv
import io
from dotenv import load_dotenv

load_dotenv()

# --- 初始化 Flask ---
app = Flask(__name__, template_folder="templates")

# ⚠️ 開發時先用 localhost:5173，之後佈署 Render 要換成正式網址
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173"],
)

app.secret_key = os.getenv("SECRET_KEY", "dev-secret-change-me")

# --- MongoDB 連線設定 ---
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise RuntimeError("❌ No MONGODB_URI found. Check your .env or Render Environment Variables.")

client = MongoClient(MONGODB_URI)
db = client["travel_journal"]
collection = db["trips"]
users = db["users"]


# --- 首頁（如果還要 Flask 模板就保留）---
@app.route("/")
def landing():
    return render_template("landing.html")


@app.route("/app")
def main_app():
    return render_template("index.html")


# =========== 🔐 Auth APIs ===========

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required"}), 400

    # 檢查是否已存在
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

    # ⭐ 這裡統一設定 session，用「user_id」跟「email」兩個 key
    session["user_id"] = str(user["_id"])
    session["email"] = email

    return jsonify({"ok": True, "email": email})


@app.route("/api/logout", methods=["POST"])
def logout():
    # 把登入資訊清掉
    session.pop("user_id", None)
    session.pop("email", None)
    # 或者用 session.clear() 也可以
    return jsonify({"ok": True})


@app.route("/api/me", methods=["GET"])
def me():
    """前端開頁面時可以打這個，看目前有沒有登入"""
    email = session.get("email")
    if not email:
        # 這裡我讓他 200，但 ok=False，前端可以用 json.ok 判斷
        return jsonify({"ok": False, "email": None}), 200
    return jsonify({"ok": True, "email": email}), 200


# =========== 1️⃣ 新增單筆資料 ===========
@app.route("/api/add", methods=["POST"])
def add_one():
    # 1) 沒登入就擋掉
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Not logged in"}), 401

    data = request.get_json() or {}

    # 2) 把目前登入者寫進這筆紀錄
    data["user_id"] = session["user_id"]
    data["email"] = session.get("email")

    collection.insert_one(data)
    return jsonify({"ok": True, "message": "Data added successfully"})
# =========== 2️⃣ 批次匯入 CSV/JSON ===========
# =========== 2️⃣ 批次匯入 CSV/JSON ===========

@app.route("/api/bulk", methods=["POST"])
def bulk_add():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Not logged in"}), 401

    try:
        if request.content_type and request.content_type.startswith("application/json"):
            data = request.get_json()
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
            return jsonify({"ok": False, "error": "No data provided"}), 400

        if not isinstance(data, list):
            data = [data]

        uid = session["user_id"]
        email = session.get("email")

        for doc in data:
            doc["user_id"] = uid
            doc["email"] = email

        if data:
            collection.insert_many(data)

        return jsonify({"ok": True, "inserted": len(data)})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

# =========== 3️⃣ 查詢所有資料 ===========

@app.route("/api/all", methods=["GET"])
def get_all():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Not logged in"}), 401

    uid = session["user_id"]

    # 只找屬於這個 user 的紀錄
    data = list(collection.find({"user_id": uid}, {"_id": 0}))
    return jsonify(data)



# --- 主程式啟動 ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
