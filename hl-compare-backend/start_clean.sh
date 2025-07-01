#!/bin/bash

echo "Starting HL Compare Backend (Clean Mode)"

# Kill any existing processes
pkill -f uvicorn || true
pkill -f "python.*main" || true

# Wait a moment for processes to stop
sleep 2

# Navigate to backend directory
cd /Users/kunalgandhi/Desktop/HL/hl-compare-backend

# Activate virtual environment
source venv/bin/activate

# Start uvicorn with proper exclude patterns
echo "Starting server with file watching (excluding venv)..."
uvicorn main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload \
  --reload-exclude="venv/*" \
  --reload-exclude="__pycache__/*" \
  --reload-exclude="*.pyc" \
  --reload-exclude="docs/*" \
  --log-level info 