const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const env = dotenv.parse(fs.readFileSync('.env'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkColumn(colName) {
  const { data, error } = await supabase.from('journals').select(colName).limit(1);
  if (error && error.message.includes('does not exist')) return false;
  return true;
}

async function checkTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('id').limit(1);
  if (error && error.message.includes('does not exist')) return false;
  return true;
}

async function run() {
  // Check which columns need to be added
  const cols = ['issn', 'frequency', 'language', 'publisher_name', 'publisher_address', 'publication_format', 'email'];
  const missing = [];
  for (const c of cols) {
    const exists = await checkColumn(c);
    console.log(`Column ${c}: ${exists ? 'EXISTS' : 'MISSING'}`);
    if (!exists) missing.push(c);
  }

  // Check editorial_board table
  const ebExists = await checkTable('editorial_board');
  console.log(`Table editorial_board: ${ebExists ? 'EXISTS' : 'MISSING'}`);

  if (missing.length > 0 || !ebExists) {
    console.log('\n--- SQL to run in Supabase SQL Editor ---');
    for (const c of missing) {
      const defaults = {
        issn: "'XXXXX'",
        frequency: "'Quarterly'",
        language: "'English'",
        publisher_name: "'Scholar India Publishers'",
        publisher_address: "''",
        publication_format: "'Online (Open Access)'",
        email: "''"
      };
      console.log(`ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS ${c} TEXT DEFAULT ${defaults[c]};`);
    }
    if (!ebExists) {
      console.log(`
CREATE TABLE IF NOT EXISTS public.editorial_board (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'board-member',
    name TEXT NOT NULL,
    designation TEXT,
    institution TEXT,
    location TEXT,
    email TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.editorial_board ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to editorial_board" ON public.editorial_board FOR SELECT USING (true);
CREATE POLICY "Allow service role full access to editorial_board" ON public.editorial_board FOR ALL USING (true) WITH CHECK (true);
`);
    }
  } else {
    console.log('\nAll columns and tables are present!');
  }
}

run();
