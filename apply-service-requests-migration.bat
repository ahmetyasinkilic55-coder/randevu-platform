@echo off
echo Applying service requests migration...

psql -h localhost -U postgres -d randevu_platform -f add_service_requests_migration.sql

if %ERRORLEVEL% EQU 0 (
    echo Migration applied successfully!
    echo Generating Prisma client...
    npx prisma generate
    echo Done!
) else (
    echo Migration failed!
    exit /b 1
)

pause
