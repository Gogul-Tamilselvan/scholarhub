-- Create Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id text PRIMARY KEY, -- Using Book Ref Number
    submitted_at timestamptz DEFAULT now(),
    book_title text,
    publication_type text,
    publication_format text,
    author_name text,
    email text,
    mobile text,
    institution text,
    designation text,
    subject_area text,
    expected_pages text,
    abstract text,
    co_authors_count text,
    co_authors_details text,
    proposal_link text,
    status text DEFAULT 'Submitted',
    email_tracking_status text
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create Policy for public read
CREATE POLICY "Enable read access for all users" ON public.books FOR SELECT USING (true);

-- Create Policy for service role write
-- (Usually service role bypasses RLS, but for clarity)
CREATE POLICY "Enable insert for authenticated users only" ON public.books FOR INSERT WITH CHECK (true);
