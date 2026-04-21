-- Publication Tasks Table
-- Tracks final submission work assigned to sub-admins for PDF preparation and upload
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS publication_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  manuscript_id text NOT NULL,          -- references manuscripts.id
  manuscript_title text,
  assigned_to_email text NOT NULL,      -- sub-admin email
  assigned_to_name text,
  assigned_by text DEFAULT 'main_admin',
  status text DEFAULT 'Assigned',       -- Assigned | In Progress | Submitted | Approved
  notes text,                           -- admin instructions
  published_pdf_url text,               -- uploaded by sub-admin
  published_pdf_name text,
  submitted_at timestamptz,             -- when sub-admin uploaded
  approved_at timestamptz
);

ALTER TABLE publication_tasks DISABLE ROW LEVEL SECURITY;
