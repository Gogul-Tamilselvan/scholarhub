import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['invite for editors'];

  // Use header:1 to get raw array, then map manually using column positions
  const raw = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const dataRows = raw.slice(1); // skip header row

  const rows = dataRows
    .filter((row: any[]) => row[0] || row[2]) // must have name or email
    .map((row: any[]) => ({
      name: String(row[0] || ''),
      email: String(row[2] || ''),
      status: String(row[3] || '')
    }));

  console.log(`Found ${rows.length} editor invites`);

  // Upload in batches of 100
  let uploaded = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from('invite_for_editors').insert(batch);
    if (error) {
      console.error(`Batch failed:`, error.message);
    } else {
      uploaded += batch.length;
      console.log(`Uploaded ${uploaded}/${rows.length}...`);
    }
  }
  console.log(`✅ Done! Uploaded ${uploaded} editor invites.`);
}

upload();
