@echo off
echo Pushing database schema changes...

npx prisma db push

if %ERRORLEVEL% EQU 0 (
    echo Database schema updated successfully!
    echo Generating Prisma client...
    npx prisma generate
    echo Done! System is ready.
) else (
    echo Database push failed!
    echo Check your database connection and try again.
)

pause
