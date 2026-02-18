@echo off
echo ========================================
echo Pre-Deployment Testing Script
echo ========================================
echo.

echo Checking required files...
echo.

REM Check if critical files exist
if not exist "index.html" (
    echo [ERROR] index.html not found!
    goto :error
)
echo [OK] index.html found

if not exist "admin.html" (
    echo [ERROR] admin.html not found!
    goto :error
)
echo [OK] admin.html found

if not exist "sitemap.xml" (
    echo [ERROR] sitemap.xml not found!
    goto :error
)
echo [OK] sitemap.xml found

if not exist "robots.txt" (
    echo [ERROR] robots.txt not found!
    goto :error
)
echo [OK] robots.txt found

if not exist "server\server.js" (
    echo [ERROR] server\server.js not found!
    goto :error
)
echo [OK] server\server.js found

if not exist "server\.env.production" (
    echo [ERROR] server\.env.production not found!
    goto :error
)
echo [OK] server\.env.production found

echo.
echo ========================================
echo Checking API Key Configuration...
echo ========================================
echo.

REM Check if API key is updated in admin.html
findstr /C:"lyVRAsues3sICGgJjXDfcYy5dnRFq5eJ9o34i6yL/fQ=" admin.html >nul
if %errorlevel% equ 0 (
    echo [OK] Production API key configured in admin.html
) else (
    echo [WARNING] Production API key may not be configured in admin.html
    echo Please verify line 629 in admin.html
)

echo.
echo ========================================
echo Checking Image Files...
echo ========================================
echo.

if not exist "images\eluis.jpg" (
    echo [WARNING] Profile image not found: images\eluis.jpg
) else (
    echo [OK] Profile image found
)

echo.
echo ========================================
echo Security Checks...
echo ========================================
echo.

if exist ".gitignore" (
    echo [OK] .gitignore exists
) else (
    echo [WARNING] .gitignore not found - sensitive files may be exposed!
)

if exist "server\.env" (
    echo [WARNING] server\.env exists - ensure it's in .gitignore
) else (
    echo [OK] server\.env not present (good for deployment)
)

echo.
echo ========================================
echo Pre-Deployment Checklist
echo ========================================
echo.
echo Manual checks required:
echo.
echo [ ] Gmail App Password configured in backend
echo [ ] All personal information is up to date
echo [ ] All project images are optimized
echo [ ] Contact form tested locally
echo [ ] Admin panel tested locally
echo [ ] Mobile responsiveness checked
echo [ ] All links work correctly
echo.
echo ========================================
echo Test Results: PASSED
echo ========================================
echo.
echo Your portfolio is ready for deployment!
echo Run deploy.bat to deploy to GitHub Pages.
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo Test Results: FAILED
echo ========================================
echo.
echo Please fix the errors above before deploying.
echo.
pause
exit /b 1
