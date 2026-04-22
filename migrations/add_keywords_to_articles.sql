-- Add Keywords field to si_articles
ALTER TABLE public.si_articles 
ADD COLUMN IF NOT EXISTS keywords TEXT;

-- Also add keywords to journal_articles for consistency
ALTER TABLE public.journal_articles
ADD COLUMN IF NOT EXISTS keywords TEXT;
