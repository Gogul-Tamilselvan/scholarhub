-- SQL Schema for Scholar India Publishers Supabase Migration

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL
);

-- Journal Stats
CREATE TABLE IF NOT EXISTS journal_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id text NOT NULL UNIQUE,
  journal_title text NOT NULL,
  visitors integer NOT NULL DEFAULT 0,
  downloads integer NOT NULL DEFAULT 0
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id text NOT NULL,
  manuscript_id text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reviewer Passwords
CREATE TABLE IF NOT EXISTS reviewer_passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Admin Messages
CREATE TABLE IF NOT EXISTS admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  target_role text NOT NULL DEFAULT 'Reviewer',
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Login Activity
CREATE TABLE IF NOT EXISTS login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id text NOT NULL,
  first_name text,
  last_name text,
  email text,
  role text,
  journal text,
  activity_type text NOT NULL DEFAULT 'login',
  login_time timestamptz NOT NULL DEFAULT now(),
  ip_address text
);

-- Message Read Status
CREATE TABLE IF NOT EXISTS message_read_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id text NOT NULL,
  manuscript_id text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_by_both boolean NOT NULL DEFAULT false,
  admin_read_at timestamptz,
  reviewer_read_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, manuscript_id)
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz NOT NULL DEFAULT now()
);

-- Assignment Status
CREATE TABLE IF NOT EXISTS assignment_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id text NOT NULL,
  manuscript_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  accepted_at timestamptz,
  rejection_reason text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, manuscript_id)
);

-- Book Downloads
CREATE TABLE IF NOT EXISTS book_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL UNIQUE,
  book_title text NOT NULL,
  downloads integer NOT NULL DEFAULT 0
);

-- Manuscripts Table (New - migrated from Google Sheets)
CREATE TABLE IF NOT EXISTS manuscripts (
  id text PRIMARY KEY, -- Using the Google Sheets ID initially
  submitted_at timestamptz DEFAULT now(),
  author_name text,
  designation text,
  department text,
  affiliation text,
  email text,
  mobile text,
  journal text,
  title text,
  research_field text,
  author_count integer,
  author_names text,
  file_url text,
  status text DEFAULT 'submitted',
  doi text
);

-- Reviewers Table (New - migrated from Google Sheets)
CREATE TABLE IF NOT EXISTS reviewers (
  id text PRIMARY KEY,
  submitted_date timestamptz DEFAULT now(),
  first_name text,
  last_name text,
  email text UNIQUE,
  mobile text,
  role text,
  designation text,
  area_of_interest text,
  journal text,
  orcid text,
  google_scholar text,
  institution text,
  state text,
  district text,
  pin_number text,
  nationality text,
  message_to_editor text,
  profile_pdf_link text,
  status text DEFAULT 'pending',
  reviews_submitted integer DEFAULT 0,
  last_submission_date timestamptz,
  new_password text -- Temporary for migration
);

-- Assignments Table (New - migrated from Google Sheets)
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_at timestamptz DEFAULT now(),
  reviewer_id text REFERENCES reviewers(id),
  manuscript_id text REFERENCES manuscripts(id),
  due_date date,
  notes text,
  status text DEFAULT 'Pending',
  manuscript_link text,
  recommendation text,
  overall_marks text,
  reviewer_email text
);

-- Payments Table (New - migrated from Google Sheets)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at timestamptz DEFAULT now(),
  manuscript_id text,
  email text,
  author_name text,
  manuscript_title text,
  amount text,
  transaction_id text,
  payment_method text,
  payment_proof_url text,
  status text DEFAULT 'Pending'
);
