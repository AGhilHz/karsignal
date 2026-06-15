Set-Location "E:\site-jadide-man\apps\admin"

$env:NEXT_PUBLIC_API_URL = "http://localhost:3001"
$env:NODE_ENV = "development"

Write-Host "Starting Admin Panel on port 3002..." -ForegroundColor Green
npm run dev
