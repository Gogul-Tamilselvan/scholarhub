const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addRejectionReasonColumn() {
  const { data, error } = await supabase.rpc('query', { 
    sql_query: "ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;" 
  });
  
  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log('Query success:', data);
  }
}

addRejectionReasonColumn();
