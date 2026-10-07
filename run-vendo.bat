@echo off
title VENDO Full-Stack Starter
echo ===================================================
echo           Starting VENDO Full-Stack App
echo ===================================================
echo.

echo [1/2] Starting Backend REST Server on port 5000...
start "VENDO Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm start"

echo [2/2] Starting Frontend Vite App on port 5173...
start "VENDO Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo  Both servers are launching in separate windows!
echo.
echo  Frontend URL: http://localhost:5173
echo  Backend URL:  http://localhost:5000
echo.
echo  Admin Login:    admin@vendo.com    / Admin@123
echo  Customer Login: customer@vendo.com / Customer@123
echo ===================================================
echo.
pause
