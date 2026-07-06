@echo off
echo ========================================
echo Portfolio Deployment Script
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git branch -M main
    echo.
    echo Please set your remote repository:
    echo git remote add origin https://github.com/EluisNgibuni/portfolio.git
    echo.
    pause
)

REM Add all files
echo Adding files to Git...
git add .

REM Commit changes
echo.
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Production deployment - %date% %time%

git commit -m "%commit_msg%"

REM Push to GitHub
echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to GitHub repository settings
echo 2. Navigate to Pages section
echo 3. Enable GitHub Pages from main branch
echo 4. Your site will be live at:
echo    https://eluisngibuni.github.io/portfolio
echo.
echo For backend deployment, see BACKEND-DEPLOYMENT.md
echo.
pause
