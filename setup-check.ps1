# Smart Todo Setup Verification Script

Write-Host "Smart Todo Setup Verification" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Check Python
Write-Host "`nChecking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "`nChecking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

# Check Backend Dependencies
Write-Host "`nChecking Backend Dependencies..." -ForegroundColor Yellow
if (Test-Path "u:\Smart-todo\backend\requirements.txt") {
    Write-Host "✓ requirements.txt found" -ForegroundColor Green
} else {
    Write-Host "✗ requirements.txt not found" -ForegroundColor Red
}

if (Test-Path "u:\Smart-todo\backend\.env") {
    Write-Host "✓ Backend .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ Backend .env file not found" -ForegroundColor Red
}

# Check Frontend Dependencies
Write-Host "`nChecking Frontend Dependencies..." -ForegroundColor Yellow
if (Test-Path "u:\Smart-todo\frontend\package.json") {
    Write-Host "✓ package.json found" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
}

if (Test-Path "u:\Smart-todo\frontend\.env.local") {
    Write-Host "✓ Frontend .env.local file found" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend .env.local file not found" -ForegroundColor Red
}

# Check Key Files
Write-Host "`nChecking Key Application Files..." -ForegroundColor Yellow

$keyFiles = @(
    "u:\Smart-todo\backend\manage.py",
    "u:\Smart-todo\backend\smart_todo\settings.py",
    "u:\Smart-todo\backend\tasks\models.py",
    "u:\Smart-todo\backend\ai_module\gemini_client.py",
    "u:\Smart-todo\frontend\src\app\page.tsx",
    "u:\Smart-todo\frontend\src\app\dashboard\page.tsx",
    "u:\Smart-todo\frontend\src\app\tasks\page.tsx",
    "u:\Smart-todo\frontend\src\contexts\AuthContext.tsx"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "✗ $(Split-Path $file -Leaf) not found" -ForegroundColor Red
    }
}

Write-Host "`nSetup Verification Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Install backend dependencies: cd backend && pip install -r requirements.txt" -ForegroundColor White
Write-Host "2. Install frontend dependencies: cd frontend && npm install" -ForegroundColor White
Write-Host "3. Setup database: cd backend && python manage.py migrate" -ForegroundColor White
Write-Host "4. Create sample data: cd backend && python sample_data.py" -ForegroundColor White
Write-Host "5. Start the application: .\start.ps1" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")