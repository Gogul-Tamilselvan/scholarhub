-- Run this in your Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste & Run

CREATE TABLE IF NOT EXISTS public.editorial_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'board-member',
  name text NOT NULL,
  designation text,
  institution text,
  location text,
  email text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.editorial_board ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (public journal pages need this)
CREATE POLICY "Public read editorial_board"
  ON public.editorial_board FOR SELECT
  USING (true);

-- Allow service role full access (admin dashboard uses service role key)
CREATE POLICY "Service role full access editorial_board"
  ON public.editorial_board FOR ALL
  USING (true)
  WITH CHECK (true);
