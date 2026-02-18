@echo off
echo Starting Portfolio Development Environment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

REM Start backend server
echo Starting backend server...
cd server
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)

if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo Please edit server/.env with your email configuration
    echo Then run this script again
    pause
    exit /b 1
)

start "Portfolio Backend" cmd /k "npm run dev"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Start frontend server
cd ..
echo Starting frontend server...
start "Portfolio Frontend" cmd /k "python -m http.server 8000"

REM Wait a moment for frontend server to start
timeout /t 2 /nobreak >nul

REM Open launcher
echo Opening portfolio launcher...
start http://localhost:8000/launch-portfolio.html

echo.
echo Development environment started!
echo Frontend: http://localhost:8000
echo Backend API: http://localhost:3000
echo Launcher: http://localhost:8000/launch-portfolio.html
echo.
echo Press any key to exit...
pause >nul