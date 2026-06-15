@echo off
echo ========================================
echo  Career Transparency Platform - Setup
echo ========================================

REM Check prerequisites
where docker >nul 2>&1 || (echo [ERROR] Docker is required & exit /b 1)
where node >nul 2>&1 || (echo [ERROR] Node.js is required & exit /b 1)

REM Copy env file
if not exist .env (
  copy .env.example .env
  echo [OK] Created .env from .env.example
  echo [!] Please edit .env with your actual values
  pause
)

REM Install dependencies
echo [*] Installing dependencies...
call npm install

REM Start infrastructure
echo [*] Starting infrastructure services...
docker compose up -d postgres redis elasticsearch minio

echo [*] Waiting 20 seconds for services...
timeout /t 20 /nobreak >nul

REM Generate Prisma client
echo [*] Generating Prisma client...
cd packages\database
call npx prisma generate
call npx prisma migrate dev --name init
call npx ts-node prisma\seed.ts
cd ..\..

echo.
echo ========================================
echo  Setup complete!
echo ========================================
echo  Web:     http://localhost:3000
echo  API:     http://localhost:3001/api
echo  Swagger: http://localhost:3001/api/docs
echo  Admin:   http://localhost:3002
echo ========================================
echo  Admin: admin@platform.com / Admin@123456
echo ========================================
pause
