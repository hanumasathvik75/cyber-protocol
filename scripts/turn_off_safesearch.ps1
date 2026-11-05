# Script to Turn Off Browser SafeSearch so Cyber-Protocol Transformer Handles All Filtering
$chromePath = "HKLM:\SOFTWARE\Policies\Google\Chrome"
$edgePath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"

Remove-ItemProperty -Path $chromePath -Name "ForceGoogleSafeSearch" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path $edgePath -Name "ForceGoogleSafeSearch" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   ✅ SafeSearch Policy Disabled in Registry!             " -ForegroundColor Green
Write-Host "   Cyber-Protocol On-Device Transformer is now in control." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Please restart Chrome completely for changes to apply." -ForegroundColor Yellow
Pause
