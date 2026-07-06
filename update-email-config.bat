@echo off
echo Gmail App Password Configuration
echo ================================
echo.
echo Follow these steps to get your Gmail App Password:
echo.
echo 1. Go to https://myaccount.google.com/
echo 2. Click Security ^> 2-Step Verification
echo 3. Scroll down to "App passwords"
echo 4. Select "Mail" and click "Generate"
echo 5. Copy the 16-character password
echo.
set /p app_password="Enter your Gmail App Password (16 characters): "

if "%app_password%"=="" (
    echo Error: No password entered
    pause
    exit /b 1
)

echo.
echo Updating .env file...

REM Create a temporary PowerShell script to update the .env file
echo $content = Get-Content "server\.env" > temp_update.ps1
echo $content = $content -replace "EMAIL_PASS=.*", "EMAIL_PASS=%app_password%" >> temp_update.ps1
echo $content ^| Set-Content "server\.env" >> temp_update.ps1

powershell -ExecutionPolicy Bypass -File temp_update.ps1
del temp_update.ps1

echo.
echo ✅ Email configuration updated successfully!
echo.
echo Your .env file now contains:
echo - EMAIL_USER: eluisngibuinithamaini@gmail.com
echo - EMAIL_PASS: %app_password%
echo - EMAIL_FROM: eluisngibuinithamaini@gmail.com
echo - EMAIL_TO: eluisngibuinithamaini@gmail.com
echo.
echo You can now start the development servers!
echo.
pause