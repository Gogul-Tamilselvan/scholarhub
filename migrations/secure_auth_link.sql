-- Migration: Link existing tables to Supabase Auth and enforce security
-- This migration prepares the way for session-based auth using Supabase Auth

-- 1. Update sub_admins to include the Supabase Auth ID
ALTER TABLE sub_admins ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE;

-- 2. Update users (main admin) to include the Supabase Auth ID and email
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- 4. Update reviewers (which includes Editors) to include Supabase Auth ID
ALTER TABLE reviewers ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE;

-- 5. Enable RLS and add policies
ALTER TABLE sub_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full access to authenticated admins" ON sub_admins 
    FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full access to authenticated admins" ON users 
    FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE reviewers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full access to authenticated admins" ON reviewers 
    FOR ALL USING (auth.role() = 'service_role');
