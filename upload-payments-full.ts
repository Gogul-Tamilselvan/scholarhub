import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Payment'];

  const raw = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const dataRows = raw.slice(1);

  const rows = dataRows
    .filter((row: any[]) => row[2] || row[6]) // Author Name or Title must exist
    .map((row: any[]) => ({
      submitted_at: String(row[0] || ''),
      manuscript_id: String(row[1] || ''),
      author_name: String(row[2] || ''),
      email: String(row[3] || ''),
      affiliation: String(row[4] || ''),
      publication_type: String(row[5] || ''),
      manuscript_title: String(row[6] || ''),
      number_of_authors: String(row[7] || ''),
      author_type: String(row[8] || ''),
      currency: String(row[9] || ''),
      calculated_amount: String(row[10] || ''),
      amount: String(row[11] || ''),
      payment_method: String(row[12] || ''),
      date_of_payment: String(row[13] || ''),
      transaction_number: String(row[14] || ''),
      payment_proof_url: String(row[15] || ''),
      invoice_no: String(row[16] || ''),
      status: String(row[17] || 'Pending'),
      email_tracking: String(row[18] || '')
    }));

  console.log(`Found ${rows.length} valid payment records`);

  const { error } = await supabase.from('payments').insert(rows);
  if (error) {
    console.error(`Upload failed:`, error.message);
  } else {
    console.log(`✅ Successfully uploaded ${rows.length} payments with 19 columns.`);
  }
}

upload();
