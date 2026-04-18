import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Books'];

  const raw = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const dataRows = raw.slice(1);

  const rows = dataRows
    .filter((row: any[]) => row[1]) // Book Ref Number must exist
    .map((row: any[]) => ({
      submitted_at: String(row[0] || ''),
      id: String(row[1] || ''),
      book_title: String(row[2] || ''),
      publication_type: String(row[3] || ''),
      publication_format: String(row[4] || ''),
      author_name: String(row[5] || ''),
      email: String(row[6] || ''),
      mobile: String(row[7] || ''),
      institution: String(row[8] || ''),
      designation: String(row[9] || ''),
      subject_area: String(row[10] || ''),
      expected_pages: String(row[11] || ''),
      abstract: String(row[12] || ''),
      doi: String(row[13] || ''),
      isbn: String(row[14] || ''),
      co_authors_count: String(row[15] || ''),
      co_authors_details: String(row[16] || ''),
      proposal_link: String(row[17] || ''),
      status: String(row[18] || 'Submitted'),
      plagiarism_percent: String(row[19] || ''),
      email_tracking_status: String(row[20] || '')
    }));

  console.log(`Found ${rows.length} valid books`);

  const { error } = await supabase.from('books').insert(rows);
  if (error) {
    console.error(`Upload failed:`, error.message);
  } else {
    console.log(`✅ Successfully uploaded ${rows.length} books with 21 columns.`);
  }
}

upload();
