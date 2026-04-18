import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Reviewer Messages'];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(`Found ${data.length} reviewer messages`);

  const rows = data.map((row: any) => ({
    submitted_at: String(row['Submitted At'] || ''),
    reviewer_id: String(row['Reviewer ID'] || ''),
    reviewer_name: String(row['Reviewer Name'] || ''),
    manuscript_id: String(row['Manuscript ID'] || ''),
    message: String(row['Message'] || '')
  }));

  const { error } = await supabase.from('reviewer_messages').insert(rows);
  if (error) {
    console.error('Upload failed:', error.message);
  } else {
    console.log(`✅ Successfully uploaded ${rows.length} reviewer messages!`);
  }
}

upload();
