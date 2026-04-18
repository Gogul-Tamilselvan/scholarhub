-- Add missing columns to manuscripts
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS organization text;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS area text;

-- Add missing columns to reviewers
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS field_of_specialization text;

-- Add missing columns to books
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS publication_type text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS publication_format text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS expected_pages text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS co_authors_count text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS co_authors_details text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS proposal_link text;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS email_tracking_status text;

-- Add missing columns to payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS date_of_payment text;
