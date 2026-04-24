-- Add files to journal_special_issues for multiple file PDF uploads
ALTER TABLE journal_special_issues 
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;
