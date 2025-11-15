## Travel Journal — Full-Stack Travel Record System
**Render**: [https://travelrecord.onrender.com](https://travelrecord.onrender.com)
A full-stack travel recording system that supports login, single trip submission, CSV/JSON bulk upload, and travel history browsing.
Backend uses Flask + MongoDB Atlas, frontend built with React + Vite + Bootstrap.
### | Project Structure
```php
TravelRecord/
│
├── backend/
│   ├── app.py               # Flask backend (API only)
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # SECRET_KEY + MONGODB_URI
│   └── test.csv             # sample bulk upload file
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.app.json
    ├── public/
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── config.ts         # API base URL
        └── pages/
            ├── Landing.tsx   # Login/Register
            ├── Home.tsx      # History
            ├── AddRecord.tsx # Single insert
            └── BulkUpload.tsx# Bulk insert
```
### | Tech Stack
##### 1. Frontend
- React + Vite + TypeScript
- Bootstrap 5
- Fetch API with credentials: "include"
##### 2. Backend
- Python 3.11
- Flask
- Flask-CORS (with session support)
- PyMongo
- Werkzeug password hashing
##### 3. Database
- MongoDB Atlas
    - Collections:
      - users
      - trips
##### 4. Deployment
- Render Web Service (backend)
- Render Static Site (frontend)

