-- CreateEnum
-- This migration adds publicId column to gallery_items table

-- AlterTable
ALTER TABLE "gallery_items" ADD COLUMN "publicId" TEXT;
