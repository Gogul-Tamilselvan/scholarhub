-- Journal Archives Tables
-- Run this in Supabase SQL Editor to create the tables

-- 1. Volumes table
CREATE TABLE IF NOT EXISTS public.journal_volumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id TEXT NOT NULL,
    volume_number INTEGER NOT NULL,
    label TEXT,
    period TEXT,
    status TEXT DEFAULT 'In Progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Issues table
CREATE TABLE IF NOT EXISTS public.journal_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volume_id TEXT NOT NULL,
    journal_id TEXT NOT NULL,
    issue_number INTEGER NOT NULL,
    label TEXT,
    period TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Articles table
CREATE TABLE IF NOT EXISTS public.journal_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id TEXT NOT NULL,
    journal_id TEXT NOT NULL,
    article_id TEXT NOT NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    affiliation TEXT,
    pages TEXT,
    doi TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS policies for public read access
ALTER TABLE public.journal_volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to journal_volumes" ON public.journal_volumes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to journal_issues" ON public.journal_issues FOR SELECT USING (true);
CREATE POLICY "Allow public read access to journal_articles" ON public.journal_articles FOR SELECT USING (true);

-- Full access for service role (admin dashboard uses service role key)
CREATE POLICY "Allow service role full access to journal_volumes" ON public.journal_volumes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access to journal_issues" ON public.journal_issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access to journal_articles" ON public.journal_articles FOR ALL USING (true) WITH CHECK (true);

-- Also ensure the journals table has public read
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journals' AND policyname = 'Allow public read access to journals') THEN
        CREATE POLICY "Allow public read access to journals" ON public.journals FOR SELECT USING (true);
    END IF;
END $$;
