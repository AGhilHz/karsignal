Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Career Platform - Starting Services   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Remove PostgreSQL stale lock if exists
$lockFile = "E:\site-jadide-man\local-services\postgres\data\postmaster.pid"
if (Test-Path $lockFile) {
    $pgProcId = (Get-Content $lockFile | Select-Object -First 1).Trim()
    try { Stop-Process -Id ([int]$pgProcId) -Force -ErrorAction SilentlyContinue } catch {}
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 1. Start PostgreSQL
Write-Host ""
Write-Host "[1/4] Starting PostgreSQL..." -ForegroundColor Yellow
$pgCtl   = "E:\site-jadide-man\local-services\pgsql\bin\pg_ctl.exe"
$pgReady = "E:\site-jadide-man\local-services\pgsql\bin\pg_isready.exe"
$pgData  = "E:\site-jadide-man\local-services\postgres\data"
$pgLog   = "E:\site-jadide-man\local-services\postgres\pg.log"

& $pgCtl -D $pgData -l $pgLog start 2>&1 | Out-Null
Start-Sleep -Seconds 5

$pgCheck = & $pgReady -h localhost -p 5432 2>&1
if ($pgCheck -match "accepting") {
    Write-Host "  PostgreSQL: OK (port 5432)" -ForegroundColor Green
} else {
    Write-Host "  PostgreSQL: $pgCheck" -ForegroundColor Red
}

# 2. Start Redis
Write-Host "[2/4] Starting Redis..." -ForegroundColor Yellow
$redisCli = "E:\site-jadide-man\local-services\redis\redis-cli.exe"
$redisSrv = "E:\site-jadide-man\local-services\redis\redis-server.exe"

$redisPong = & $redisCli ping 2>&1
if ($redisPong -ne "PONG") {
    Start-Process -FilePath $redisSrv -ArgumentList "--port 6379" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    $redisPong = & $redisCli ping 2>&1
}
if ($redisPong -eq "PONG") {
    Write-Host "  Redis: OK (port 6379)" -ForegroundColor Green
} else {
    Write-Host "  Redis: FAILED" -ForegroundColor Red
}

# 3. Start API in new window
Write-Host "[3/4] Starting API Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"E:\site-jadide-man\start-api.ps1`"" -WindowStyle Normal
Write-Host "  API: starting in new window (port 3001)" -ForegroundColor Green

# 4. Start Web in new window
Write-Host "[4/4] Starting Web + Admin..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"E:\site-jadide-man\start-web.ps1`"" -WindowStyle Normal
Write-Host "  Web: starting in new window (port 3000)" -ForegroundColor Green
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"E:\site-jadide-man\start-admin.ps1`"" -WindowStyle Normal
Write-Host "  Admin: starting in new window (port 3002)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " All services launching!" -ForegroundColor Green
Write-Host " (wait ~2 min for full startup)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Web:     http://localhost:3000" -ForegroundColor White
Write-Host "  API:     http://localhost:3001/api" -ForegroundColor White
Write-Host "  Swagger: http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "  Admin:   http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "  Admin email:    admin@platform.com" -ForegroundColor Yellow
Write-Host "  Admin password: Admin@123456" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
