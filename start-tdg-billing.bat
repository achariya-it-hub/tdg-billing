@echo off
title TDG Billing POS - Local Desktop Server
color 0A
echo ===================================================
echo           TDG Billing POS - Local System
echo ===================================================
echo.
echo Starting local POS server on http://localhost:3001 ...
echo All sales, bills, and data will be saved locally in server/db.json
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Start Node.js server in background if port 3001 is not running
netstat -ano | findstr :3001 >nul
if %errorlevel% neq 0 (
    start /B node server/index.js > pos-server.log 2>&1
    timeout /t 2 >nul
) else (
    echo Server is already running on port 3001.
)

echo.
echo Opening TDG Billing POS Application Window...

:: Try launching Chrome in App Mode, fallback to Edge or default browser
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set CHROME_X86="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if exist %CHROME_PATH% (
    start "" %CHROME_PATH% --app=http://localhost:3001 --start-maximized
) else if exist %CHROME_X86% (
    start "" %CHROME_X86% --app=http://localhost:3001 --start-maximized
) else if exist %EDGE_PATH% (
    start "" %EDGE_PATH% --app=http://localhost:3001 --start-maximized
) else (
    start http://localhost:3001
)

echo.
echo TDG Billing POS is active! (Keep this window open or minimized while billing)
echo ===================================================
