-- Simplify Special Issues to just Journal -> Special Issue -> Articles
-- Run this in Supabase Dashboard -> SQL Editor

-- Step 1: Make si_issue_id optional (so articles don't require a volume/issue)
ALTER TABLE public.si_articles DROP CONSTRAINT IF EXISTS si_articles_si_issue_id_fkey;
ALTER TABLE public.si_articles ALTER COLUMN si_issue_id DROP NOT NULL;

-- Step 2: Add special_issue_id column linking directly to journal_special_issues
ALTER TABLE public.si_articles 
  ADD COLUMN IF NOT EXISTS special_issue_id UUID REFERENCES public.journal_special_issues(id) ON DELETE CASCADE;

-- Step 3: Add index for fast lookup
CREATE INDEX IF NOT EXISTS idx_si_articles_special_issue_id 
  ON public.si_articles(special_issue_id);

-- Step 4: Enable RLS access for special_issue_id-based reads (allow public to read)
-- (RLS policies should already exist from the original migration)
