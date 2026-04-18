-- Add Journal Particulars columns to journals table
-- Run this in Supabase SQL Editor

ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS issn TEXT DEFAULT 'XXXXX';
ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'Quarterly';
ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English';
ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS publisher_name TEXT DEFAULT 'Scholar India Publishers';
ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS publisher_address TEXT DEFAULT '';
ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS publication_format TEXT DEFAULT 'Online (Open Access)';
ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
