# إعداد مفاتيح Dr. AIDA
$envPath = Join-Path $PSScriptRoot ".env"
$example = Join-Path $PSScriptRoot ".env.example"

if (-not (Test-Path $envPath)) {
    Copy-Item $example $envPath -ErrorAction SilentlyContinue
    if (-not (Test-Path $envPath)) {
        @"
GROQ_API_KEY=
API_PORT=7860
"@ | Set-Content $envPath -Encoding UTF8
    }
}

Write-Host ""
Write-Host "=== إعداد Dr. AIDA ===" -ForegroundColor Cyan
Write-Host "1) افتح: https://console.groq.com/keys"
Write-Host "2) أنشئ API Key (مجاني)"
Write-Host "3) الصقه في الملف: $envPath"
Write-Host "   السطر: GROQ_API_KEY=gsk_xxxx"
Write-Host "4) احفظ الملف ثم شغّل من Api:"
Write-Host "   cd Api; python app.py"
Write-Host ""
notepad $envPath
