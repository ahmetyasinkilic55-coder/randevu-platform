-- Add publicId column to gallery_items table for Cloudinary integration
ALTER TABLE "gallery_items" ADD COLUMN "publicId" TEXT;
