@echo off
:: Batch wrapper to run unlock_incognito.ps1 as Administrator
NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [!] Requesting Administrator privileges to restore Chrome settings...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~dp0unlock_incognito.bat\"\"' -Verb RunAs"
    exit /b
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0unlock_incognito.ps1"
echo.
pause
