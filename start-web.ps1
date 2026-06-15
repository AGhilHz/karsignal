Set-Location "E:\site-jadide-man\apps\web"

$env:NEXT_PUBLIC_API_URL = "http://localhost:3001"
$env:NODE_ENV = "development"

Write-Host "Starting Web app on port 3000..." -ForegroundColor Green
npm run dev
