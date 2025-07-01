#!/bin/bash

echo "🚀 Starting HL Compare Frontend..."

# Kill any existing frontend processes
pkill -f "react-scripts" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Navigate to frontend directory
cd /Users/kunalgandhi/Desktop/HL/hl-compare-frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Installing..."
    npm install
fi

# Start the frontend
echo "🔥 Starting React app on port 3000..."
npm start 