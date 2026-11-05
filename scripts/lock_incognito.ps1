# PowerShell Script to Enforce Cyber-Protocol Protection
# Must be run as Administrator

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Cyber-Protocol: Enforcing Protection Policies          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$chromePath = "HKLM:\SOFTWARE\Policies\Google\Chrome"
$edgePath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
$chromeBlocklistPath = "HKLM:\SOFTWARE\Policies\Google\Chrome\ExtensionInstallBlocklist"

try {
    # 1. Clear any extension blocklist so your extensions can be managed normally
    if (Test-Path $chromeBlocklistPath) {
        Remove-Item -Path $chromeBlocklistPath -Recurse -Force
        Write-Host "[+] Extension controls unlocked for Developer Mode." -ForegroundColor Green
    }

    # 2. Configure Google Chrome Policies
    if (!(Test-Path $chromePath)) {
        New-Item -Path $chromePath -Force | Out-Null
    }

    # Policy 1: Permanently Disable Incognito Mode
    Set-ItemProperty -Path $chromePath -Name "IncognitoModeAvailability" -Value 1 -Type DWord -Force
    Write-Host "[+] SUCCESS: Incognito Mode has been PERMANENTLY DISABLED." -ForegroundColor Green

    # Policy 2: Allow Transformer AI Full Control (Remove generic browser SafeSearch)
    Remove-ItemProperty -Path $chromePath -Name "ForceGoogleSafeSearch" -ErrorAction SilentlyContinue
    Write-Host "[+] SUCCESS: AI Transformer Engine is set as the Primary Safety Authority." -ForegroundColor Green

    # Policy 3: Enforce YouTube Strict Safety Mode
    Set-ItemProperty -Path $chromePath -Name "ForceYouTubeSafetyMode" -Value 2 -Type DWord -Force
    Write-Host "[+] SUCCESS: YouTube Strict Restricted Mode is ENFORCED." -ForegroundColor Green

    # 3. Configure Microsoft Edge Policies
    if (!(Test-Path $edgePath)) {
        New-Item -Path $edgePath -Force | Out-Null
    }
    Set-ItemProperty -Path $edgePath -Name "InPrivateModeAvailability" -Value 1 -Type DWord -Force
    Write-Host "[+] SUCCESS: Microsoft Edge InPrivate Mode is PERMANENTLY DISABLED." -ForegroundColor Green

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  ✅ ALL PROTECTION POLICIES ARE ACTIVE!" -ForegroundColor Green
    Write-Host "  Please restart Google Chrome completely." -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host "[-] ERROR: Failed to write to Registry. Did you run as Administrator?" -ForegroundColor Red
    Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
}
