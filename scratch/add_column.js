const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://lzghovclshgnguuzunly.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  console.log("Adding allowed_journals column to sub_admins table...");
  const { error } = await supabase.rpc('run_sql', {
    sql: "ALTER TABLE sub_admins ADD COLUMN IF NOT EXISTS allowed_journals text[] DEFAULT '{}';"
  });

  if (error) {
    console.error("Error adding column:", error);
    console.log("Trying alternative approach (assuming rpc run_sql might not exist)...");
    
    // Sometimes run_sql is not enabled. We might have to tell the user to do it manually.
    console.log("Please run this in your Supabase SQL Editor:");
    console.log("ALTER TABLE sub_admins ADD COLUMN IF NOT EXISTS allowed_journals text[] DEFAULT '{}';");
  } else {
    console.log("Successfully added column!");
  }
}

run();
