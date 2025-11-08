-- Add hero image field to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS hero_image_url text,
ADD COLUMN IF NOT EXISTS show_hero_image boolean DEFAULT false;