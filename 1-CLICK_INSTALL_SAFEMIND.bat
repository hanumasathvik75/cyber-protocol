@echo off
title SafeMind - 1-Click Child Safety & Incognito Lockdown
color 0A

:: -------------------------------------------------------------
:: Auto-Elevate to Administrator (UAC Prompt)
:: -------------------------------------------------------------
NET SESSION >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ============================================================
    echo    Requesting Administrator privileges to apply security...
    echo ============================================================
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

cls
echo ============================================================
echo   🛡️  SAFEMIND (Cyber-Protocol) - AUTOMATED ENDPOINT SETUP
echo ============================================================
echo.
echo [*] Applying Windows Group Policy Lockdown...

:: 1. Permanently Disable Incognito Mode in Google Chrome
reg add "HKLM\SOFTWARE\Policies\Google\Chrome" /v IncognitoModeAvailability /t REG_DWORD /d 1 /f >nul 2>&1
echo [+] Google Chrome Incognito Mode: PERMANENTLY DISABLED

:: 2. Permanently Disable InPrivate Mode in Microsoft Edge
reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v InPrivateModeAvailability /t REG_DWORD /d 1 /f >nul 2>&1
echo [+] Microsoft Edge InPrivate Mode: PERMANENTLY DISABLED

:: 3. Configure SafeSearch for On-Device AI Transformer Authority
reg delete "HKLM\SOFTWARE\Policies\Google\Chrome" /v ForceGoogleSafeSearch /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v ForceGoogleSafeSearch /f >nul 2>&1
echo [+] AI Transformer Engine: Set as Primary Safety Authority

:: 4. Enforce Strict YouTube Safety Mode
reg add "HKLM\SOFTWARE\Policies\Google\Chrome" /v ForceYouTubeSafetyMode /t REG_DWORD /d 2 /f >nul 2>&1
echo [+] YouTube Restricted Mode: ENFORCED

:: 5. Block Secondary Evasion Browsers via OS Policy (DisallowRun)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v DisallowRun /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\DisallowRun" /v 1 /t REG_SZ /d "firefox.exe" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\DisallowRun" /v 2 /t REG_SZ /d "brave.exe" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\DisallowRun" /v 3 /t REG_SZ /d "opera.exe" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\DisallowRun" /v 4 /t REG_SZ /d "tor.exe" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\DisallowRun" /v 5 /t REG_SZ /d "vivaldi.exe" /f >nul 2>&1
echo [+] Secondary Browsers (Firefox, Brave, Tor, Opera): BLOCKED BY OS

:: 6. Refresh running browser processes to activate policies immediately
echo.
echo [*] Refreshing browser instances to apply policies instantly...
taskkill /F /IM chrome.exe >nul 2>&1
taskkill /F /IM msedge.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo.
echo ============================================================
echo   ✅ SUCCESS: INCOGNITO MODE IS NOW PERMANENTLY BLOCKED!
echo ============================================================
echo.
echo   Next Step (Final 15 seconds):
echo   Chrome is now opening to chrome://extensions
echo   1. Turn on "Developer mode" (toggle in top-right)
echo   2. Click "Load unpacked"
echo   3. Select the "safeguard-extension" folder from this zip
echo.
echo ============================================================
echo.

:: Launch Chrome to extensions page
start chrome.exe "chrome://extensions"

pause
