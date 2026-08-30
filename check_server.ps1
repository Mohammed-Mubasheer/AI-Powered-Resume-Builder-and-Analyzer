# Quick Server Status Check Script
# Run this to verify your setup

Write-Host "=== Resume Project Server Status Check ===" -ForegroundColor Cyan
Write-Host ""

# Check 1: Django Server
Write-Host "1. Checking Django Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/hello/" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Django server is RUNNING" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Django server is NOT running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Solution: Run 'python manage.py runserver' in a terminal" -ForegroundColor Yellow
}

Write-Host ""

# Check 2: React Server
Write-Host "2. Checking React Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ React server is RUNNING" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ React server is NOT running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Solution: Run 'npm start' in frontend directory" -ForegroundColor Yellow
}

Write-Host ""

# Check 3: Port Status
Write-Host "3. Checking Port Status..." -ForegroundColor Yellow
$port8000 = netstat -ano | findstr :8000
$port3000 = netstat -ano | findstr :3000

if ($port8000) {
    Write-Host "   ✅ Port 8000 is in use (Django)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 8000 is NOT in use" -ForegroundColor Red
}

if ($port3000) {
    Write-Host "   ✅ Port 3000 is in use (React)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 3000 is NOT in use" -ForegroundColor Red
}

Write-Host ""

# Check 4: .env File
Write-Host "4. Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".\\.env") {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content ".\\.env" -Raw
    if ($envContent -match "GEMINI_API_KEY") {
        Write-Host "   ✅ GEMINI_API_KEY is set" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  GEMINI_API_KEY not found in .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env file NOT found" -ForegroundColor Red
    Write-Host "   Solution: Create .env file with GEMINI_API_KEY" -ForegroundColor Yellow
}

Write-Host ""

# Check 5: Virtual Environment
Write-Host "5. Checking Virtual Environment..." -ForegroundColor Yellow
if (Test-Path ".\backend-env") {
    Write-Host "   ✅ Virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Virtual environment NOT found" -ForegroundColor Red
    Write-Host "   Solution: Run 'python -m venv backend-env'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Check Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If Django server is not running, open a new terminal and run:" -ForegroundColor Yellow
Write-Host "  cd D:\College_project02\resume-project" -ForegroundColor White
Write-Host "  .\backend-env\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python manage.py runserver" -ForegroundColor White
Write-Host ""
