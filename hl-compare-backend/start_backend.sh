#!/bin/bash

# Kill any existing uvicorn processes
pkill -f uvicorn || true

# Navigate to the correct directory
cd /Users/kunalgandhi/Desktop/HL/hl-compare-backend

# Activate virtual environment
source venv/bin/activate

# Install requirements if needed
pip install -r requirements.txt

# Start uvicorn with specific exclude patterns to avoid watching venv
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --reload-exclude="venv/*" --reload-exclude="__pycache__/*" 