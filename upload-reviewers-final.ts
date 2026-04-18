import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Reviewers'];

  const raw = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const dataRows = raw.slice(1);

  const rows = dataRows
    .filter((row: any[]) => row[0]) // Reviewer ID must exist
    .map((row: any[]) => ({
      id: String(row[0] || ''),
      submitted_at: String(row[1] || ''),
      first_name: String(row[2] || ''),
      last_name: String(row[3] || ''),
      email: String(row[4] || ''),
      mobile: String(row[5] || ''),
      role: String(row[6] || ''),
      designation: String(row[7] || ''),
      area_of_interest: String(row[8] || ''),
      journal: String(row[9] || ''),
      orcid: String(row[10] || ''),
      google_scholar: String(row[11] || ''),
      institution: String(row[12] || ''),
      state: String(row[13] || ''),
      district: String(row[14] || ''),
      pin_number: String(row[15] || ''),
      nationality: String(row[16] || ''),
      message_to_editor: String(row[17] || ''),
      status: String(row[18] || 'Pending'),
      institutional_profile_url: String(row[19] || ''),
      profile_pdf_link: String(row[20] || ''),
      reviews_count: String(row[22] || '0'),
      last_review_date: String(row[23] || ''),
      new_password: String(row[24] || ''),
      email_tracking: String(row[25] || '')
    }));

  console.log(`Uploading ${rows.length} reviewer records...`);

  const { error } = await supabase.from('reviewers').insert(rows);
  if (error) {
    console.error(`Upload failed:`, error.message);
  } else {
    console.log(`✅ Successfully uploaded ${rows.length} reviewers!`);
  }
}

upload();
