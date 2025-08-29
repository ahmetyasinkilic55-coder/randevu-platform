@echo off
echo Running raffle models migration...

REM Run the migration
psql -h localhost -U postgres -d randevuplatform -f add_raffle_models_migration.sql

if %ERRORLEVEL% EQU 0 (
    echo Migration completed successfully!
    echo.
    echo Next steps:
    echo 1. Run: npx prisma db pull
    echo 2. Run: npx prisma generate
    echo.
) else (
    echo Migration failed with error code %ERRORLEVEL%
    echo Please check the error message above.
    echo.
)

pause
