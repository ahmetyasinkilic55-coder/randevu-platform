@echo off
echo Clearing Next.js cache and restarting development server...

echo.
echo 1. Stopping any running development server...
taskkill /f /im node.exe 2>nul

echo 2. Clearing Next.js cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo    - .next directory removed
)

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo    - node_modules cache removed
)

echo 3. Clearing npm cache...
npm cache clean --force

echo.
echo 4. Reinstalling dependencies...
npm install

echo.
echo 5. Running database migration...
call run-raffle-migration.bat

echo.
echo 6. Starting development server...
echo.
echo ========================================
echo  🚀 Starting development server...
echo  📱 Open: http://localhost:3000
echo  🎯 Test raffle: http://localhost:3000/raffle
echo ========================================
echo.

npm run dev
