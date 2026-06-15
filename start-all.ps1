Write-Host "=== Career Platform Startup ===" -ForegroundColor Cyan

# 1. PostgreSQL
Write-Host "`n[1/3] Starting PostgreSQL..." -ForegroundColor Yellow
$pgBin  = "E:\site-jadide-man\local-services\pgsql\bin\pg_ctl.exe"
$pgData = "E:\site-jadide-man\local-services\postgres\data"
$pgLog  = "E:\site-jadide-man\local-services\postgres\pg.log"

# Kill any stuck lock
$lockFile = "$pgData\postmaster.pid"
if (Test-Path $lockFile) {
    $pid = (Get-Content $lockFile | Select-Object -First 1).Trim()
    try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {}
    Start-Sleep -Seconds 2
}

& $pgBin -D $pgData -l $pgLog start 2>&1 | Out-Null
Start-Sleep -Seconds 4
$pgReady = & "E:\site-jadide-man\local-services\pgsql\bin\pg_isready.exe" -h localhost -p 5432 2>&1
if ($pgReady -match "accepting") {
    Write-Host "  PostgreSQL: RUNNING" -ForegroundColor Green
} else {
    Write-Host "  PostgreSQL: ERROR - $pgReady" -ForegroundColor Red
}

# 2. Redis
Write-Host "[2/3] Starting Redis..." -ForegroundColor Yellow
$redisExe = "E:\site-jadide-man\local-services\redis\redis-server.exe"
$redisPing = & "E:\site-jadide-man\local-services\redis\redis-cli.exe" ping 2>&1
if ($redisPing -ne "PONG") {
    Start-Process -FilePath $redisExe -ArgumentList "--port 6379" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}
$redisPing2 = & "E:\site-jadide-man\local-services\redis\redis-cli.exe" ping 2>&1
if ($redisPing2 -eq "PONG") {
    Write-Host "  Redis: RUNNING" -ForegroundColor Green
} else {
    Write-Host "  Redis: ERROR" -ForegroundColor Red
}

# 3. Load .env
Write-Host "[3/3] Loading environment..." -ForegroundColor Yellow
Get-Content "E:\site-jadide-man\.env" | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
    }
}
Write-Host "  .env loaded" -ForegroundColor Green

Write-Host "`n=== All services started ===" -ForegroundColor Cyan
Write-Host "Now starting API (keep this window open)..." -ForegroundColor White

Set-Location "E:\site-jadide-man\apps\api"
npm run start:dev
