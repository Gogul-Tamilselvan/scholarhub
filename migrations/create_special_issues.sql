-- Special Issues table
CREATE TABLE IF NOT EXISTS public.journal_special_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id TEXT NOT NULL,                 -- references journals.id (or hardcoded slugs like '__sjcm__')
    title TEXT NOT NULL,                      -- e.g. "Emerging Trends in Digital Commerce"
    theme TEXT,                               -- short theme/tagline
    description TEXT,                         -- call-for-papers or overview text
    guest_editor TEXT,                        -- optional guest editor name
    submission_deadline DATE,                 -- paper submission deadline
    publication_date DATE,                    -- expected publication date
    status TEXT NOT NULL DEFAULT 'Open',      -- Open | Closed | Published
    cover_image_url TEXT,                     -- optional cover image URL
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by journal
CREATE INDEX IF NOT EXISTS idx_special_issues_journal ON public.journal_special_issues(journal_id);

-- RLS
ALTER TABLE public.journal_special_issues ENABLE ROW LEVEL SECURITY;

-- Public can read active/open special issues
CREATE POLICY "Public Read Special Issues"
  ON public.journal_special_issues FOR SELECT USING (true);

-- Authenticated (admin service-role) can do all
CREATE POLICY "Admin Full Access Special Issues"
  ON public.journal_special_issues FOR ALL USING (true) WITH CHECK (true);
