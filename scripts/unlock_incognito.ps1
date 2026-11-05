# PowerShell Script to Revert Cyber-Protocol Policies
# Must be run as Administrator

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Cyber-Protocol: Restoring Default Browser Settings     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$chromePath = "HKLM:\SOFTWARE\Policies\Google\Chrome"
$edgePath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
$chromeBlocklistPath = "HKLM:\SOFTWARE\Policies\Google\Chrome\ExtensionInstallBlocklist"

try {
    # 1. Restore Google Chrome
    if (Test-Path $chromePath) {
        Set-ItemProperty -Path $chromePath -Name "IncognitoModeAvailability" -Value 0 -Type DWord -Force
        Set-ItemProperty -Path $chromePath -Name "ForceGoogleSafeSearch" -Value 0 -Type DWord -Force
        Set-ItemProperty -Path $chromePath -Name "ForceYouTubeSafetyMode" -Value 0 -Type DWord -Force
        Write-Host "[+] Restored Chrome Incognito, SafeSearch, and YouTube settings." -ForegroundColor Green
    }

    if (Test-Path $chromeBlocklistPath) {
        Remove-Item -Path $chromeBlocklistPath -Recurse -Force
        Write-Host "[+] Restored Chrome Web Store extension installation." -ForegroundColor Green
    }

    # 2. Restore Microsoft Edge
    if (Test-Path $edgePath) {
        Set-ItemProperty -Path $edgePath -Name "InPrivateModeAvailability" -Value 0 -Type DWord -Force
        Write-Host "[+] Restored Microsoft Edge InPrivate mode." -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "[+] SUCCESS: All default browser settings have been restored." -ForegroundColor Green
    Write-Host "[!] Please restart Google Chrome and Edge for changes to take effect." -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host "[-] ERROR: Failed to restore settings. Did you run as Administrator?" -ForegroundColor Red
    Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
}
