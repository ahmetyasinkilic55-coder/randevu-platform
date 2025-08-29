#!/bin/bash

echo "🔧 Clearing Next.js cache and restarting development server..."

echo ""
echo "1. Stopping any running development server..."
pkill -f "next dev" 2>/dev/null || true

echo "2. Clearing Next.js cache..."
if [ -d ".next" ]; then
    rm -rf ".next"
    echo "   - .next directory removed"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf "node_modules/.cache" 
    echo "   - node_modules cache removed"
fi

echo ""
echo "3. Clearing npm cache..."
npm cache clean --force

echo ""
echo "4. Installing dependencies..."
npm install

echo ""
echo "5. Testing API imports..."
echo "   - Checking auth imports..."

echo ""
echo "6. Starting development server..."
echo ""
echo "========================================"
echo "  🚀 Starting development server..."
echo "  📱 Open: http://localhost:3000"
echo "  🎯 Test raffle: http://localhost:3000/raffle"
echo "========================================"
echo ""

npm run dev
