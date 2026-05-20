# إعادة تشغيل خادم Dr. AIDA (يقتل العملية على المنفذ 7860)
$port = 7860
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2
Set-Location $PSScriptRoot
Write-Host "Starting Dr. AIDA API with vision model..." -ForegroundColor Cyan
python app.py
