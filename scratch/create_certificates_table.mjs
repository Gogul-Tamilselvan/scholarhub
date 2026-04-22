import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: 'y:\\ReplitExport-scholarindiapub 14 April 26\\Scholar-India-Publishers\\.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.reviewer_certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reviewer_id TEXT NOT NULL,
        reviewer_name TEXT NOT NULL,
        journal_name TEXT NOT NULL,
        manuscript_title TEXT NOT NULL,
        certificate_url TEXT NOT NULL,
        cert_no TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public.reviewer_certificates ENABLE ROW LEVEL SECURITY;
    
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access' AND tablename = 'reviewer_certificates') THEN
        CREATE POLICY "Public Read Access" ON public.reviewer_certificates FOR SELECT USING (true);
      END IF;
    END $$;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
        console.log('exec_sql RPC not found. Please run the SQL manually in Supabase SQL Editor:');
        console.log(sql);
    } else {
        console.error('Error creating table:', error);
    }
  } else {
    console.log('Successfully created reviewer_certificates table');
  }
}

createTable();
