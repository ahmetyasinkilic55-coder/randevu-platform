@echo off
echo Formatting Prisma schema...
npx prisma format

echo Pushing database schema changes...
npx prisma db push

if %ERRORLEVEL% EQU 0 (
    echo Database schema updated successfully!
    echo Generating Prisma client...
    npx prisma generate
    
    if %ERRORLEVEL% EQU 0 (
        echo Done! System is ready.
        echo Starting development server...
        npm run dev
    ) else (
        echo Prisma generate failed!
    )
) else (
    echo Database push failed!
    echo Check the error above.
)

pause
