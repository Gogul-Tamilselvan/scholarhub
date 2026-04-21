import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function check() {
  const tables = ['admin_messages', 'admin_replies', 'reviewer_messages', 'admin_direct_messages'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0);
    console.log(`Table ${table} exists?`, !error);
    if (error) {
      console.log(`Error for ${table}:`, error.message);
    }
  }
}

check();
