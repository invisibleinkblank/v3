# HLv2: Investment Analysis Platform

## 🚦 Zero-Risk Setup Checklist

**To ensure the project works perfectly after unzipping:**

1. **Unzip the project to a new folder.**
2. **Delete any `venv` or `node_modules` folders if present.**
   - These folders are platform-specific and should NOT be included in the zip. Always recreate them after unzipping.
3. **Follow the Quick Start commands below, step by step.**
4. **If you see any errors, check the Troubleshooting section.**
5. **If you still have issues, make sure you have the correct versions of Python and Node.js installed.**

---

## Overview
HLv2 is a document-driven financial analysis web app with a React frontend and a FastAPI backend. It allows you to compare multiple entities (e.g., Apple vs Meta) using uploaded documents, returning detailed, evidence-backed investment analysis and key financial metrics.

---

## Prerequisites
- **Python 3.8+** (for backend)
- **Node.js 16+ & npm** (for frontend)
- **Git** (optional, for version control)

---

## Quick Start: Step-by-Step Commands

### 1. Unzip the Project
Unzip the HLv2 archive to your desired location.

### 2. Backend Setup
Open a terminal and run:
```sh
cd HLv2/hl-compare-backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
./start_backend.sh
```
The backend will run at http://localhost:8000

### 3. Frontend Setup
Open a new terminal window/tab and run:
```sh
cd HLv2/hl-compare-frontend
npm install
npm start
```
The frontend will run at http://localhost:3000

---

## Usage
- Open http://localhost:3000 in your browser.
- Upload your documents, enter entity names, and run the analysis.
- View results in the key metrics table and analysis accordion.

---

## Troubleshooting
- **Backend not starting?**
  - Ensure your virtual environment is activated.
  - Check Python version (`python3 --version`).
- **Frontend errors?**
  - Make sure you ran `npm install` before `npm start`.
- **CORS or API errors?**
  - Ensure the backend is running before starting the frontend.
- **Dependency issues?**
  - Delete and recreate the `venv` or `node_modules` folders, then reinstall dependencies.

---

## Project Structure
```
HLv2/
  hl-compare-backend/    # FastAPI backend
  hl-compare-frontend/   # React frontend
  README.md              # This file
```

---

## Need Help?
If you run into issues, check the troubleshooting section above or contact the project maintainer. 