#!/bin/bash

echo "🚀 Starting HL Compare Backend..."

# Kill any existing backend processes
pkill -f "uvicorn" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Navigate to backend directory
cd /Users/kunalgandhi/Desktop/HL/hl-compare-backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
fi

# Start the backend
echo "🔥 Starting FastAPI server on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --reload-exclude="venv/*" 