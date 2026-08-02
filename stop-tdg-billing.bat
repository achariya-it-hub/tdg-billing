@echo off
title Stop TDG Billing POS Server
color 0C
echo Stopping local TDG Billing POS server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
echo Local server stopped successfully.
pause
