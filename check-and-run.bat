@echo off
echo Checking TypeScript compilation...

npx tsc --noEmit

if %ERRORLEVEL% EQU 0 (
    echo TypeScript compilation successful!
    echo Starting development server...
    npm run dev
) else (
    echo TypeScript compilation failed!
    echo Please fix the errors above.
    pause
)
