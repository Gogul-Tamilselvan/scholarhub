import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['copyright'];

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
      author_names: String(row[4] || ''),
      institution: String(row[5] || ''),
      department: String(row[6] || ''),
      supporting_author: String(row[7] || ''),
      email: String(row[8] || ''),
      mobile: String(row[9] || ''),
      conflict_of_interest: String(row[10] || ''),
      funding_support: String(row[11] || ''),
      license_agreement: String(row[12] || ''),
      file_url: String(row[13] || ''),
      status: String(row[14] || 'Submitted')
    }));

  console.log(`Found ${rows.length} valid copyright entries`);

  // Upload
  const { error } = await supabase.from('copyright_forms').insert(rows);
  if (error) {
    console.error(`Upload failed:`, error.message);
  } else {
    console.log(`✅ Successfully uploaded ${rows.length} copyright entries.`);
  }
}

upload();
