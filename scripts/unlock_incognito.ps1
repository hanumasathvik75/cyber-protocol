# PowerShell Script to Re-Enable Chrome Incognito Mode
# Must be run as Administrator

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SafeGuard AI: Restoring Chrome Incognito Settings      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$regPath = "HKLM:\SOFTWARE\Policies\Google\Chrome"

try {
    if (Test-Path $regPath) {
        # Value 0 = Incognito mode enabled (normal default)
        Set-ItemProperty -Path $regPath -Name "IncognitoModeAvailability" -Value 0 -Type DWord -Force
        Write-Host "[+] SUCCESS: Incognito Mode has been RESTORED in Chrome." -ForegroundColor Green
    } else {
        Write-Host "[*] Chrome policy key does not exist. Incognito is already enabled." -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "[!] ACTION REQUIRED: Please restart Google Chrome for changes to take effect." -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host "[-] ERROR: Failed to write to Registry. Did you run as Administrator?" -ForegroundColor Red
    Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
}
