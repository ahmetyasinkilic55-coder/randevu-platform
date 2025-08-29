@echo off
echo Testing raffle API migration...

REM Check if PostgreSQL is running and apply migration
psql -h localhost -U postgres -d randevuplatform -f add_raffle_models_migration.sql

if %ERRORLEVEL% EQU 0 (
    echo Migration completed successfully!
    echo.
    echo Running Prisma updates...
    npx prisma db pull
    npx prisma generate
    echo.
    echo All updates completed!
) else (
    echo Migration failed with error code %ERRORLEVEL%
    echo Please check the error message above.
)

pause
