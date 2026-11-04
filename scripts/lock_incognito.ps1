# PowerShell Script to Disable Chrome Incognito Mode via GPO
# Must be run as Administrator

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SafeGuard AI: Enforcing Chrome Incognito Lockdown      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$regPath = "HKLM:\SOFTWARE\Policies\Google\Chrome"

try {
    if (!(Test-Path $regPath)) {
        Write-Host "[*] Creating registry policy path: $regPath" -ForegroundColor Yellow
        New-Item -Path $regPath -Force | Out-Null
    }

    # Value 1 = Incognito mode completely disabled
    Set-ItemProperty -Path $regPath -Name "IncognitoModeAvailability" -Value 1 -Type DWord -Force

    Write-Host "[+] SUCCESS: Incognito Mode has been PERMANENTLY DISABLED in Chrome." -ForegroundColor Green
    Write-Host "[+] Policy Key set: $regPath\IncognitoModeAvailability = 1" -ForegroundColor Green
    Write-Host ""
    Write-Host "[!] ACTION REQUIRED: Please completely restart Google Chrome (all open windows)" -ForegroundColor Yellow
    Write-Host "    Pressing Ctrl+Shift+N will now be completely inactive." -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host "[-] ERROR: Failed to write to Registry. Did you run as Administrator?" -ForegroundColor Red
    Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
}
