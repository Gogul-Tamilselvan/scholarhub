import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Final paper'];

  // Use header:1 to get raw array
  const raw = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const dataRows = raw.slice(1); // skip header row

  const rows = dataRows
    .filter((row: any[]) => row[1] || row[3]) // manuscript id or title
    .map((row: any[]) => ({
      submitted_at: String(row[0] || ''),
      manuscript_id: String(row[1] || ''),
      journal: String(row[2] || ''),
      title: String(row[3] || ''),
      author_name: String(row[4] || ''),
      email: String(row[5] || ''),
      mobile: String(row[6] || ''),
      file_url: String(row[8] || ''),
      status: String(row[9] || 'Submitted'),
      publication_type: String(row[10] || ''),
      article_title: String(row[11] || ''),
      production_email_status: String(row[23] || '')
    }));

  console.log(`Found ${rows.length} valid final paper entries`);

  // Upload in batches of 100
  let uploaded = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from('final_papers').insert(batch);
    if (error) {
      console.error(`Batch failed:`, error.message);
    } else {
      uploaded += batch.length;
      console.log(`Uploaded ${uploaded}/${rows.length}...`);
    }
  }
  console.log(`✅ Done! Uploaded ${uploaded} final paper entries.`);
}

upload();
