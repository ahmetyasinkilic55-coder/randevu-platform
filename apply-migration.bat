@echo off
echo Adding publicId column to gallery_items table...

REM Option 1: Using Prisma CLI
npx prisma migrate dev --name add-gallery-publicid

REM Then generate Prisma client
npx prisma generate

echo Migration completed!
pause
