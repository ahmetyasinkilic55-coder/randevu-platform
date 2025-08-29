echo "Testing database connection and running raffle migration..."

# Test database connection first
echo "Testing PostgreSQL connection..."
psql -h localhost -U postgres -d randevuplatform -c "SELECT version();"

if [ $? -eq 0 ]; then
    echo "Database connection successful!"
    echo ""
    echo "Running raffle migration..."
    
    # Run the migration
    psql -h localhost -U postgres -d randevuplatform -f add_raffle_models_migration.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "Migration completed successfully!"
        echo ""
        echo "Running Prisma updates..."
        npx prisma db pull
        npx prisma generate
        echo ""
        echo "All updates completed! ✅"
        echo ""
        echo "You can now test the raffle functionality:"
        echo "1. Visit /raffle to see the raffle page"
        echo "2. API endpoints:"
        echo "   - GET /api/raffle/data"
        echo "   - POST /api/raffle/participate"
    else
        echo "Migration failed! ❌"
        echo "Please check the error messages above."
    fi
else
    echo "Database connection failed! ❌"
    echo "Please make sure PostgreSQL is running and accessible."
fi
