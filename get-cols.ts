import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getColumns() {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .limit(1);
    
  if (error && error.code === 'PGRST116') {
     console.log("No rows, trying insert error logic");
  } else {
     console.log("data:", data);
  }
}

getColumns();
