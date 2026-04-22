-- Restructure Special Archives to Journal -> Volumes -> Issues -> Articles
-- 1. Add journal_id to si_volumes to allow direct selection
ALTER TABLE public.si_volumes 
ADD COLUMN IF NOT EXISTS journal_id TEXT;

-- 2. Add Special Issue details to si_issues so the "Theme" can be defined at the issue level
ALTER TABLE public.si_issues
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS theme TEXT,
ADD COLUMN IF NOT EXISTS guest_editor TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published';

-- 3. Update existing si_volumes if possible (optional but good for data integrity)
-- UPDATE public.si_volumes v SET journal_id = si.journal_id FROM public.journal_special_issues si WHERE v.special_issue_id = si.id;
