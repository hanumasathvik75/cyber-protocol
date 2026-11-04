@echo off
:: Batch wrapper to run lock_incognito.ps1 as Administrator
NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [!] Requesting Administrator privileges to apply Chrome policies...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~dp0lock_incognito.bat\"\"' -Verb RunAs"
    exit /b
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0lock_incognito.ps1"
echo.
pause
