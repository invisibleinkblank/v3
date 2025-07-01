# HL Compare – Financial Analysis & Evidence Platform

## Overview

HL Compare is a full-stack web platform for transparent, evidence-backed investment analysis. Users can upload financial documents (PDF, TXT, DOCX), compare entities (e.g., Apple vs Meta), and receive detailed, category-specific analysis with confidence scores, direct source drilldown, and professional PDF export. The platform features a modern React frontend and a robust FastAPI backend.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Scripts & Usage](#scripts--usage)
- [Dependencies](#dependencies)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- Upload and analyze multiple documents (PDF, TXT, DOCX)
- Compare two or more entities across investment categories (risk, growth, ESG, etc.)
- Evidence Sidebar with embedded PDF viewer, download, and open-in-new-tab
- Confidence scores, quality ratings, and reliability flags for every metric
- Export analysis as a professional PDF slide deck (one focus area per page)
- Clean, modern React frontend with actionable insights and tooltips
- FastAPI backend with static file serving for user-uploaded documents

---

## Project Structure

```
HL/
├── hl-compare-backend/      # FastAPI backend (API, analysis, static file serving)
├── hl-compare-frontend/     # React frontend (UI, PDF export, evidence sidebar)
├── docs/                    # Example/test documents
├── start_backend.sh         # Script to start backend
├── start_frontend.sh        # Script to start frontend
├── fix_hl_compare.sh        # Utility script (see below)
├── test_doc.txt, ...        # Test files
```

---

## Setup & Installation

### Backend Setup (FastAPI)

1. **Install Python 3.9+** (recommended: 3.10+)
2. **Create and activate a virtual environment:**
   ```sh
   cd hl-compare-backend
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
   - If you need to install pip: `python3 -m ensurepip --upgrade`
4. **Start the backend server:**
   ```sh
   uvicorn main:app --reload
   ```
   - The API will be available at [http://localhost:8000](http://localhost:8000)
   - Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Backend Dependencies
- fastapi
- uvicorn
- python-multipart
- pydantic
- (see `hl-compare-backend/requirements.txt` for full list)

#### Backend Scripts
- `start_backend.sh`: Starts the backend server with recommended settings.
- `fix_hl_compare.sh`: Utility for cleaning up or resetting backend state (customize as needed).

### Frontend Setup (React)

1. **Install Node.js (v16+ recommended) and npm**
   - [Download Node.js](https://nodejs.org/)
2. **Install frontend dependencies:**
   ```sh
   cd hl-compare-frontend
   npm install
   ```
3. **Start the frontend dev server:**
   ```sh
   npm start
   ```
   - The app will open at [http://localhost:3000](http://localhost:3000)

#### Frontend Dependencies
- react
- react-dom
- react-scripts
- jsPDF
- html2canvas
- (see `hl-compare-frontend/package.json` for full list)

#### Frontend Scripts
- `start_frontend.sh`: Starts the frontend dev server.

---

## Scripts & Usage

### Uploading Documents & Running Analysis
- Use the web UI to upload PDF, TXT, or DOCX files.
- Enter the names of the entities you want to compare (e.g., "Apple Inc." and "Meta Platforms Inc.").
- Click "Start Analysis" to generate a detailed, evidence-backed comparison.

### Evidence Sidebar & Source Drilldown
- Click any evidence badge to open the sidebar.
- View document name, page, excerpt, confidence, quality, and reliability flags.
- Preview the original PDF in-browser, download it, or open in a new tab.

### PDF Export
- Use the "Export as PDF" button to download a professional slide deck of the analysis.
- Each focus area appears on a separate page, with all data and evidence included.

---

## Dependencies

### Backend (see `requirements.txt`)
- fastapi
- uvicorn
- python-multipart
- pydantic
- (others as needed)

### Frontend (see `package.json`)
- react
- react-dom
- react-scripts
- jsPDF
- html2canvas
- (others as needed)

---

## Troubleshooting

- **Backend 500 errors:**
  - Ensure the backend is running (`uvicorn main:app --reload`)
  - Check terminal for Python errors and resolve any missing dependencies
- **Frontend cannot load PDFs:**
  - Make sure the backend is serving files at `/files/<filename>`
  - CORS issues? Ensure FastAPI CORS middleware allows requests from `localhost:3000`
- **PDFs not showing in sidebar:**
  - Confirm evidence object includes a valid `download_url` (should be `http://localhost:8000/files/<filename>`)
- **Node/npm errors:**
  - Delete `node_modules/` and run `npm install` again
- **Virtual environment issues:**
  - Deactivate and reactivate your Python venv, or recreate it

---

## Contributing

1. Fork the repo and clone your fork
2. Create a new branch for your feature or fix
3. Make your changes and add tests if needed
4. Commit and push to your branch
5. Open a pull request describing your changes

---

## License

Specify your license here (e.g., MIT, Apache 2.0, etc.) 