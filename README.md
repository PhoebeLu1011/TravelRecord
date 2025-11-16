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
### |　Important Code Description
#### Bulk Upload API (/api/bulk)

The /api/bulk endpoint enables batch insertion of multiple records into MongoDB using the insert_many() function. It supports both JSON input and file uploads (CSV or JSON).

1. Authentication Check

The endpoint first verifies whether the user is logged in.
If not authenticated, it returns an error response.

2. Supported Input Methods

The API accepts data in two formats:

(1) JSON array sent directly from the frontend

(2) Uploaded files, including:

- CSV files

- JSON files

The program automatically detects which input type is being used.

3. Handling JSON Input

If the request content type indicates JSON, the data is read with:

```py
if request.content_type.startswith("application/json"):

 data = request.get_json()
```

4. Handling File Uploads

If the request contains a file:

```py
elif "file" in request.files:
```

The system processes the file based on its extension:

CSV: parsed using `csv.DictReader`

JSON: loaded using `json.load(file)`

5. Adding User Information

Each record is tagged with:

- user_id

- email

This ensures all imported data is associated with the correct authenticated user.

6. Bulk Insertion

Finally, all processed records are inserted into MongoDB using:

```py
collection.insert_many(data)
```

This allows the system to efficiently import large amounts of data in a single operation.
