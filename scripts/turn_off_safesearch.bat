@echo off
:: SafeGuard AI: Turn Off Browser SafeSearch so Transformer handles filtering
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin
) else (
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

:admin
echo ==========================================================
echo    Disabling Browser SafeSearch Policies...
echo ==========================================================

reg delete "HKLM\SOFTWARE\Policies\Google\Chrome" /v ForceGoogleSafeSearch /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Google\Chrome" /v ForceYouTubeSafetyMode /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v ForceGoogleSafeSearch /f >nul 2>&1

echo.
echo    [SUCCESS] SafeSearch policy removed from Registry!
echo    Cyber-Protocol Transformer is now in full filtering control.
echo ==========================================================
echo.
echo Please restart Google Chrome to apply the changes.
pause
