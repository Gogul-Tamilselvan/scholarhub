const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: 'mail-server/.env' });

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addRejectionReasonColumn() {
  const { data, error } = await supabase.rpc('query', { 
    sql_query: "ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;" 
  });
  // Since we don't know if rpc('query') exists or works (often not), we can use the REST API or just alter via another way.
  // Actually, we can use psql if connection string is available, or use supabase client to just insert a dummy with rejection_reason and see if it fails.
  
  // Let's first fetch a single manuscript to see its columns
  const { data: selectData, error: selectError } = await supabase.from('manuscripts').select('*').limit(1);
  if (selectError) {
    console.error('Select Error:', selectError);
    return;
  }
  
  const m = selectData[0];
  if (m && 'rejection_reason' in m) {
    console.log('Column rejection_reason already exists.');
  } else {
    console.log('Column rejection_reason does not exist. We need to add it.');
    // In many setups, people use a direct psql connection. 
    // Let's check if the user has a connection string.
  }
}

addRejectionReasonColumn();
