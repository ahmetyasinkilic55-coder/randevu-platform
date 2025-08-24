-- Manuel olarak publicId kolonu ekle
ALTER TABLE "gallery_items" ADD COLUMN IF NOT EXISTS "publicId" TEXT;
