@echo off
echo Generating Prisma client...

npx prisma generate

if %ERRORLEVEL% EQU 0 (
    echo Prisma client generated successfully!
    echo Applying service requests migration...
    
    psql -h localhost -U postgres -d randevu_platform -f add_service_requests_migration.sql
    
    if %ERRORLEVEL% EQU 0 (
        echo Migration applied successfully!
        echo Generating Prisma client again...
        npx prisma generate
        echo Done! System is ready.
    ) else (
        echo Migration failed!
        echo Trying to create database schema from scratch...
        npx prisma db push
    )
) else (
    echo Prisma generate failed!
)

pause
