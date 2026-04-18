import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
async function getTableSchema() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'books' });
  if (error) {
    console.log("RPC Error:", error);
    // Try raw query if enabled (usually not in Supabase JS client)
    const { data: cols, error: colError } = await supabase.from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'books')
      .eq('table_schema', 'public');
    
    if (colError) {
      console.log("Direct Query Error:", colError);
      // Let's just try to insert a row with a key that definitely doesn't exist and parse the error
      const { error: e } = await supabase.from('books').insert([{ "NON_EXISTENT_COLUMN_XYZ": 1 }]);
      console.log("Insert Error (check message for valid columns if possible):", e);
    } else {
      console.log("Columns:", cols);
    }
  } else {
    console.log("Columns:", data);
  }
}
getTableSchema();
