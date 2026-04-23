-- Add cover_image to journals table
ALTER TABLE journals 
ADD COLUMN IF NOT EXISTS cover_image TEXT;
