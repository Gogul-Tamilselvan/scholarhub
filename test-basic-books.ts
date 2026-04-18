import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
async function testInsert() {
  const { error } = await supabase.from('books').upsert([{ id: 'TEST_REF', book_title: 'Test', author_name: 'Test' }]);
  if (error) {
     console.log("Insert failed:", error.message);
  } else {
     console.log("Insert worked with id, book_title, author_name");
  }
}
testInsert();
