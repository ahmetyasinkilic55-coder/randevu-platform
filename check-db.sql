-- Check if publicId column exists in gallery_items
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'gallery_items' AND column_name = 'publicId';

-- If you want to see all columns in gallery_items
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'gallery_items';
