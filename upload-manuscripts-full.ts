import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Manuscript'];

  const raw = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const dataRows = raw.slice(1);

  const rows = dataRows
    .filter((row: any[]) => row[0]) // Manuscript ID must exist
    .map((row: any[]) => ({
      id: String(row[0] || ''),
      submitted_at: String(row[1] || ''),
      author_name: String(row[2] || ''),
      designation: String(row[3] || ''),
      department: String(row[4] || ''),
      affiliation: String(row[5] || ''),
      email: String(row[6] || ''),
      mobile: String(row[7] || ''),
      journal: String(row[8] || ''),
      manuscript_title: String(row[9] || ''),
      research_field: String(row[10] || ''),
      author_count: String(row[11] || ''),
      author_names: String(row[12] || ''),
      file_url: String(row[13] || ''),
      status: String(row[14] || 'Submitted'),
      doi: String(row[15] || ''),
      plagiarism_report: String(row[16] || ''),
      email_status: String(row[17] || '')
    }));

  console.log(`Found ${rows.length} valid manuscripts`);

  const { error } = await supabase.from('manuscripts').insert(rows);
  if (error) {
    console.error(`Upload failed:`, error.message);
  } else {
    console.log(`✅ Successfully uploaded ${rows.length} manuscripts with 18 columns.`);
  }
}

upload();
