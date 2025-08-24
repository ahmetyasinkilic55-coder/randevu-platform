# Database Migration Script

echo "Adding publicId column to gallery_items table..."

# Option 1: Using Prisma CLI
npx prisma migrate dev --name add-gallery-publicid

# Option 2: If you want to apply manually, run this SQL:
# ALTER TABLE "gallery_items" ADD COLUMN "publicId" TEXT;

echo "Migration completed!"
echo "Now run: npx prisma generate"
