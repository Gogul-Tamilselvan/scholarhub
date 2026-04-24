import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: finalPapers } = await supabase.from('final_papers').select('*');
  const { data: copyrights } = await supabase.from('copyright_forms').select('*');
  console.log("Final Papers:", finalPapers);
  console.log("Copyrights:", copyrights);
}
main();
