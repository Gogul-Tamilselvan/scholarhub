import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Contact'];

  const raw = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const dataRows = raw.slice(1);

  const rows = dataRows
    .filter((row: any[]) => row[1] || row[3]) // First Name or Email
    .map((row: any[]) => ({
      submitted_at: String(row[0] || ''),
      first_name: String(row[1] || ''),
      last_name: String(row[2] || ''),
      email: String(row[3] || ''),
      phone: String(row[4] || ''),
      enquiry_type: String(row[5] || ''),
      subject: String(row[6] || ''),
      message: String(row[7] || ''),
      is_read_excel: String(row[8] || ''),
      is_replied: String(row[9] || '')
    }));

  console.log(`Found ${rows.length} valid contact messages`);

  const { error } = await supabase.from('contact_messages').insert(rows);
  if (error) {
    console.error(`Upload failed:`, error.message);
  } else {
    console.log(`✅ Successfully uploaded ${rows.length} contact messages.`);
  }
}

upload();
