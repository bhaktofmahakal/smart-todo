# Smart Todo Application Startup Script

Write-Host "Starting Smart Todo Application..." -ForegroundColor Green

# Check if Python is installed
try {
    python --version
} catch {
    Write-Host "Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    node --version
} catch {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Start Backend
Write-Host "Starting Django Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'u:\Smart-todo\backend'; python manage.py runserver"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Next.js Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'u:\Smart-todo\frontend'; npm run dev"

Write-Host "Both services are starting..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")