Set-Location "E:\site-jadide-man\packages\database"
$env:DATABASE_URL = "postgresql://career_user:career_pass123@localhost:5432/career_platform"
$env:DATABASE_SHADOW_URL = "postgresql://career_user:career_pass123@localhost:5432/career_platform_shadow"

Write-Host "Step 1: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "GENERATE DONE" -ForegroundColor Green

Write-Host "Step 2: Pushing schema to database..." -ForegroundColor Yellow
npx prisma db push --force-reset
Write-Host "DB PUSH DONE" -ForegroundColor Green

Write-Host "Step 3: Seeding database..." -ForegroundColor Yellow
npx ts-node --project tsconfig.json prisma/seed.ts
Write-Host "SEED DONE" -ForegroundColor Green

Write-Host "ALL DATABASE SETUP COMPLETE!" -ForegroundColor Cyan
