@echo off
REM ============================================================
REM  TDG Billing — Setup Local Auto-Backup (Run as Administrator)
REM  Registers a Windows Scheduled Task to backup nightly.
REM ============================================================

echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║   TDG BILLING — Local Backup Setup           ║
echo  ║   Nightly backup from tendengyros.com        ║
echo  ╚═══════════════════════════════════════════════╝
echo.

REM ─── Get the folder where this batch file lives ───────────
SET SCRIPT_DIR=%~dp0
SET PS_SCRIPT=%SCRIPT_DIR%auto-backup.ps1

echo [1/3] Checking PowerShell script...
IF NOT EXIST "%PS_SCRIPT%" (
    echo  ERROR: auto-backup.ps1 not found in %SCRIPT_DIR%
    pause
    exit /b 1
)
echo  OK: Found %PS_SCRIPT%

echo.
echo [2/3] Registering Windows Scheduled Task...
echo  Task Name : TDG-Billing-AutoBackup
echo  Schedule  : Daily at 11:30 PM
echo  Script    : %PS_SCRIPT%
echo  Saves to  : C:\TDG-Backups\
echo.

schtasks /create /tn "TDG-Billing-AutoBackup" ^
  /tr "powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Hidden -File \"%PS_SCRIPT%\"" ^
  /sc DAILY ^
  /st 23:30 ^
  /ru SYSTEM ^
  /f

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo  ✅ SUCCESS! Auto-backup scheduled for 11:30 PM every night.
    echo  Backups saved to: C:\TDG-Backups\
    echo  Keeps last 30 daily backups automatically.
) ELSE (
    echo.
    echo  ⚠️  Task creation may have failed. Try running as Administrator.
    echo  Right-click this file ^> "Run as administrator"
)

echo.
echo [3/3] Running first backup now to test...
powershell.exe -ExecutionPolicy Bypass -File "%PS_SCRIPT%"

echo.
echo ════════════════════════════════════════════════════
echo  Setup complete! Check C:\TDG-Backups\ for your backup.
echo  The task will run automatically every night at 11:30 PM.
echo ════════════════════════════════════════════════════
echo.
pause
