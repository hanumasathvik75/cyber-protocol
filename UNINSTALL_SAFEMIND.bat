@echo off
title SafeMind - Restore Default Browser Settings
color 0E

:: Auto-Elevate to Administrator
NET SESSION >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo Requesting Administrator privileges to restore settings...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cls
echo ============================================================
echo   🛡️  SAFEMIND - RESTORE BROWSER SETTINGS
echo ============================================================
echo.
echo [*] Restoring Incognito Mode & default browser settings...

reg add "HKLM\SOFTWARE\Policies\Google\Chrome" /v IncognitoModeAvailability /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v InPrivateModeAvailability /t REG_DWORD /d 0 /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Google\Chrome" /v ForceYouTubeSafetyMode /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\DisallowRun" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v DisallowRun /f >nul 2>&1

taskkill /F /IM chrome.exe >nul 2>&1
taskkill /F /IM msedge.exe >nul 2>&1

echo.
echo ============================================================
echo   ✅ SUCCESS: Incognito Mode has been restored.
echo ============================================================
echo.
pause
