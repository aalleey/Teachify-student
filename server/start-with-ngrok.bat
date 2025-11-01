@echo off
echo ========================================
echo Starting Teachify Server + Ngrok Tunnel
echo ========================================
echo.

echo [1/2] Starting Express server on port 5000...
start "Teachify Server" cmd /k "node server.js"

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo [2/2] Starting Ngrok tunnel...
start "Ngrok Tunnel" cmd /k "ngrok http 5000"

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Your app is accessible at:
echo   - Local: http://localhost:5000
echo   - Public: Check the Ngrok window for URL
echo.
echo Press any key to exit this window...
pause > nul
