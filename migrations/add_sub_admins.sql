-- Sub-Admins Table
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS sub_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  allowed_tabs text[] DEFAULT '{}',  -- array of tab IDs they can access
  is_active boolean DEFAULT true,
  created_by text DEFAULT 'main_admin',
  last_login timestamptz
);

-- Disable RLS so admin client can read/write freely
ALTER TABLE sub_admins DISABLE ROW LEVEL SECURITY;
