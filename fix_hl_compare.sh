#!/bin/bash

echo "🔧 HL Compare Platform - Complete Fix Script"
echo "==========================================="

# Kill all conflicting processes
echo "1. Killing all conflicting processes..."
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true  
pkill -f "npm start" 2>/dev/null || true
killall node 2>/dev/null || true
lsof -ti:3000,3001,8000 | xargs kill -9 2>/dev/null || true
sleep 2

# Clean up any remaining ports
echo "2. Cleaning up ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo "3. Fixing Frontend (TypeScript cleanup)..."
cd /Users/kunalgandhi/Desktop/HL/hl-compare-frontend

# Nuclear TypeScript cleanup
rm -rf node_modules package-lock.json .eslintcache 2>/dev/null || true
rm -f tsconfig.json 2>/dev/null || true
rm -f src/*.tsx 2>/dev/null || true
rm -f src/*.ts 2>/dev/null || true
rm -f src/react-app-env.d.ts 2>/dev/null || true

# Clear all caches
npm cache clean --force 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true

echo "4. Installing frontend dependencies..."
npm install

echo "5. Starting Backend (from correct directory)..."
cd /Users/kunalgandhi/Desktop/HL/hl-compare-backend

# Activate venv and start backend in background
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload --reload-exclude="venv/*" > backend.log 2>&1 &
echo "Backend started on port 8000 (check backend.log for logs)"

echo "6. Starting Frontend..."
cd /Users/kunalgandhi/Desktop/HL/hl-compare-frontend
nohup npm start > frontend.log 2>&1 &
echo "Frontend starting on port 3000 (check frontend.log for logs)"

sleep 5

echo ""
echo "✅ HL Compare Platform Status:"
echo "================================"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000" 
echo ""
echo "To check status:"
echo "  Backend logs: tail -f /Users/kunalgandhi/Desktop/HL/hl-compare-backend/backend.log"
echo "  Frontend logs: tail -f /Users/kunalgandhi/Desktop/HL/hl-compare-frontend/frontend.log"
echo ""
echo "To stop services:"
echo "  pkill -f uvicorn && pkill -f react-scripts" 