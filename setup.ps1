# Study Bridge Setup Script for Windows

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Study Bridge Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
$nodeVersion = node -v
Write-Host "Node.js $nodeVersion installed" -ForegroundColor Green

# Step 2: Check PostgreSQL
Write-Host "[2/6] Checking PostgreSQL..." -ForegroundColor Yellow
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "PostgreSQL not found. Please install from https://www.postgresql.org/" -ForegroundColor Red
    exit 1
}
Write-Host "PostgreSQL installed" -ForegroundColor Green

# Step 3: Create Database
Write-Host "[3/6] Creating database..." -ForegroundColor Yellow
psql -U postgres -c "CREATE DATABASE IF NOT EXISTS studybridge;" 2>$null
Write-Host "Database created/verified" -ForegroundColor Green

# Step 4: Apply Schema
Write-Host "[4/6] Applying database schema..." -ForegroundColor Yellow
psql -U postgres -d studybridge -f db/schema.sql -q
Write-Host "Database schema applied" -ForegroundColor Green

# Step 5: Install Dependencies
Write-Host "[5/6] Installing npm dependencies..." -ForegroundColor Yellow
npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "Dependencies installed" -ForegroundColor Green

# Step 6: Summary
Write-Host ""
Write-Host "[6/6] Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Start dev server: npm run dev" -ForegroundColor Magenta
Write-Host "Open in browser: http://localhost:3000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test with pre-seeded user:" -ForegroundColor Yellow
Write-Host "Email: rahim@example.com" -ForegroundColor Magenta
Write-Host "Password: pass1234" -ForegroundColor Magenta
