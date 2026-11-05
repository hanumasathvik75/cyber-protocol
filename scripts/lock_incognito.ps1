# PowerShell Script to Enforce Complete Cyber-Protocol Lockdown
# Must be run as Administrator

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Cyber-Protocol: Enforcing Complete Endpoint Lockdown   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$chromePath = "HKLM:\SOFTWARE\Policies\Google\Chrome"
$edgePath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
$chromeBlocklistPath = "HKLM:\SOFTWARE\Policies\Google\Chrome\ExtensionInstallBlocklist"

try {
    # 1. Configure Google Chrome Policies
    if (!(Test-Path $chromePath)) {
        New-Item -Path $chromePath -Force | Out-Null
    }

    # Policy 1: Permanently Disable Incognito Mode
    Set-ItemProperty -Path $chromePath -Name "IncognitoModeAvailability" -Value 1 -Type DWord -Force
    Write-Host "[+] SUCCESS: Incognito Mode has been PERMANENTLY DISABLED." -ForegroundColor Green

    # Policy 2: Enforce Strict Google SafeSearch (Filters adult searches & images)
    Set-ItemProperty -Path $chromePath -Name "ForceGoogleSafeSearch" -Value 1 -Type DWord -Force
    Write-Host "[+] SUCCESS: Google SafeSearch is strictly ENFORCED." -ForegroundColor Green

    # Policy 3: Enforce YouTube Strict Safety Mode (Blocks mature videos & comments)
    Set-ItemProperty -Path $chromePath -Name "ForceYouTubeSafetyMode" -Value 2 -Type DWord -Force
    Write-Host "[+] SUCCESS: YouTube Strict Restricted Mode is ENFORCED." -ForegroundColor Green

    # Policy 4: Block ALL unauthorized extension installs (Prevents VPN extensions)
    if (!(Test-Path $chromeBlocklistPath)) {
        New-Item -Path $chromeBlocklistPath -Force | Out-Null
    }
    Set-ItemProperty -Path $chromeBlocklistPath -Name "1" -Value "*" -Type String -Force
    Write-Host "[+] SUCCESS: Chrome Web Store VPN & extension installs are BLOCKED." -ForegroundColor Green

    # 2. Configure Microsoft Edge Policies (Prevents switching browsers)
    if (!(Test-Path $edgePath)) {
        New-Item -Path $edgePath -Force | Out-Null
    }
    Set-ItemProperty -Path $edgePath -Name "InPrivateModeAvailability" -Value 1 -Type DWord -Force
    Write-Host "[+] SUCCESS: Microsoft Edge InPrivate Mode is PERMANENTLY DISABLED." -ForegroundColor Green

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  ✅ ALL HARDENING POLICIES ARE ACTIVE!" -ForegroundColor Green
    Write-Host "  Please restart Google Chrome completely (all windows)." -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host "[-] ERROR: Failed to write to Registry. Did you run as Administrator?" -ForegroundColor Red
    Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
}
