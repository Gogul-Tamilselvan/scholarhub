CREATE TABLE IF NOT EXISTS public.reviewer_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    journal_name TEXT NOT NULL,
    manuscript_title TEXT NOT NULL,
    certificate_url TEXT NOT NULL,
    cert_no TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Optional indexing for faster searching
    CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.reviewers(id) ON DELETE CASCADE
);

-- Basic RLS for public search
ALTER TABLE public.reviewer_certificates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all certificates (or narrow this down later if needed)
CREATE POLICY "Public Read Access" ON public.reviewer_certificates FOR SELECT USING (true);

-- Allow authenticated admins to insert (Admin Dashboard uses Service Role Key which bypasses RLS, but safe anyway)
CREATE POLICY "Admin Insert" ON public.reviewer_certificates FOR INSERT WITH CHECK (true);
