-- ==========================================
-- SETUP ADMIN LOGIN FOR SUPABASE
-- ==========================================

-- 1. Create the users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'admin'
);

-- 2. Insert your first Admin user
-- Change the email and password here to your preferred credentials
INSERT INTO users (email, username, password, role)
VALUES ('editor@scholarindiapub.com', 'Admin', 'Edupertz@004', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 3. Verify
SELECT * FROM users;
