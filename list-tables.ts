import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // This might not work if RPC doesn't exist
  if (error) {
    // Try querying information_schema
    const { data: tables, error: tableError } = await supabase.from('pg_tables').select('tablename').eq('schemaname', 'public');
    if (tableError) {
       console.log("Could not list tables:", tableError);
       // Last resort: try common names
       const names = ['books', 'book_submissions', 'proposals', 'publications'];
       for(const name of names) {
         const { error: e } = await supabase.from(name).select('*').limit(0);
         console.log(`Table ${name} exists?`, !e);
       }
    } else {
       console.log("Tables:", tables);
    }
  } else {
    console.log("Tables:", data);
  }
}
listTables();
