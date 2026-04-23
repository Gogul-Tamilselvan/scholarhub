-- Add file_url to journal_special_issues for single-file PDF uploads
ALTER TABLE journal_special_issues 
ADD COLUMN IF NOT EXISTS file_url TEXT;
