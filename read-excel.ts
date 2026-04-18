import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
const workbook = xlsx.readFile(file);
const worksheet = workbook.Sheets['Books'];
const data = xlsx.utils.sheet_to_json(worksheet, { raw: false });

console.log(`\n============== EXCEL COLUMNS (Books) ==============`);
if (data.length > 0) {
  console.log(Object.keys(data[0] as object));
  console.log("\nFirst Row Data Preview:", data[0]);
} else {
  console.log("Empty sheet");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data: dbData, error } = await supabase.from('books').select('*').limit(1);
  if (error) {
    console.log("DB Error:", error);
  } else {
    console.log("\n============== DB COLUMNS (books) ==============");
    if (dbData && dbData.length > 0) {
      console.log(Object.keys(dbData[0]));
    } else {
      console.log("Books table is empty or no columns found.");
    }
  }
}

testQuery();
