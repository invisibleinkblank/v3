# HL Compare Backend (Production-Style)

## Overview
A scalable, modular backend for document-driven entity comparison. Built with FastAPI, SQLite, JWT authentication, and real document parsing for PDF, TXT, CSV, and Excel. Designed for extensibility, security, and real-world use.

## Features
- User authentication (JWT, secure password storage)
- Database (SQLite, easy to upgrade to Postgres/MySQL)
- File upload and storage
- Real document parsing (PDF, TXT, CSV, Excel)
- Entity and metric extraction (extensible)
- Comparison, scoring, and analysis logic
- Modular, production-style codebase
- API documentation (Swagger/OpenAPI)

## Directory Structure
```
hl-compare-backend/
  main.py              # FastAPI app entrypoint
  auth.py              # Authentication & user management
  database.py          # Database models & session
  extractors/          # File-type-specific extractors
    pdf_extractor.py
    excel_extractor.py
    txt_extractor.py
    csv_extractor.py
  analysis.py          # Entity/metric extraction, scoring, comparison
  schemas.py           # Pydantic models
  utils.py             # Helpers (file handling, etc.)
  uploads/             # Uploaded files
  requirements.txt     # Python dependencies
  README.md            # This file
```

## Setup Instructions
1. **Clone the repo & enter the backend directory:**
   ```sh
   cd hl-compare-backend
   ```
2. **Create a virtual environment:**
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
4. **Run the backend:**
   ```sh
   uvicorn main:app --reload
   ```

## API Overview
- `POST /register` — Register a new user
- `POST /login` — Obtain JWT token
- `POST /compare/` — Upload files and compare entities (auth required)
- `GET /results/{comparison_id}` — Retrieve past comparison results (auth required)

## How to Extend
- Add new extractors in `extractors/`
- Add new analysis logic in `analysis.py`
- Add new endpoints in `main.py`
- Upgrade database in `database.py`

## Security Notes
- Passwords are hashed (never stored in plaintext)
- JWT tokens for authentication
- File uploads are sanitized and stored securely
- Ready for HTTPS and production deployment

## Contact
For questions or support, contact: [your-email@example.com] 