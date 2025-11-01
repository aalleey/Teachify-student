@echo off
echo ==============================
echo Starting MERN App + Ngrok
echo ==============================

:: Step 1: Start backend (Express)
cd server
start cmd /k "node server.js"
cd ..

:: Step 2: Start frontend (React)
cd client
start cmd /k "npm start"
cd ..

:: Step 3: Start ngrok for frontend (React)
echo Starting ngrok tunnel for React (port 3000)...
start cmd /k "ngrok http 5000"

echo ==============================
echo All services started successfully!
echo ==============================
pause
