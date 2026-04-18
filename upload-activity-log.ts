import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Activity Log'];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(`Found ${data.length} activity log entries`);

  const rows = data.map((row: any) => ({
    timestamp: String(row['Timestamp'] || ''),
    user: String(row['User'] || ''),
    action: String(row['Action'] || ''),
    target_id: String(row['Target ID'] || ''),
    status: String(row['Status'] || ''),
    details: String(row['Details'] || ''),
    status_result: String(row['Status_1'] || ''),
    ip_address: String(row['IP Address'] || '')
  }));

  // Upload in batches of 100 to avoid timeouts
  const batchSize = 100;
  let uploaded = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('activity_log').insert(batch);
    if (error) {
      console.error(`Batch ${i}-${i + batchSize} failed:`, error.message);
    } else {
      uploaded += batch.length;
      console.log(`Uploaded ${uploaded}/${rows.length}...`);
    }
  }
  console.log(`✅ Done! Uploaded ${uploaded} activity log entries.`);
}

upload();
