-- Create published_books table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.published_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT DEFAULT 'Book',
    contributors TEXT NOT NULL,
    contributor_label TEXT DEFAULT 'Authors',
    isbn TEXT,
    year TEXT,
    pages TEXT,
    pdf_url TEXT,
    cover_image_url TEXT,
    subjects TEXT, -- Comma separated
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.published_books ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to published_books" 
ON public.published_books FOR SELECT 
USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to published_books" 
ON public.published_books FOR ALL 
USING (true) 
WITH CHECK (true);
