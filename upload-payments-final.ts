import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function uploadPayments() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheetName = 'Payment';
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    console.error("Sheet 'Payment' not found!");
    return;
  }
  const data = xlsx.utils.sheet_to_json(worksheet);

  console.log("Fetching manuscripts for mapping...");
  const { data: manuscripts, error: msError } = await supabase.from('manuscripts').select('id, manuscript_title');
  
  const msMap = new Map();
  if (manuscripts) {
    manuscripts.forEach(m => {
      if (m.manuscript_title) {
        msMap.set(m.manuscript_title.trim().toLowerCase(), m.id);
      }
    });
  }

  const rows = data.map((row: any) => {
    const title = (row['Manuscript Title'] || "").trim().toLowerCase();
    const manuscriptId = msMap.get(title) || 'Unknown';
    
    return {
      submitted_at: new Date().toISOString(),
      manuscript_id: manuscriptId,
      email: row['Email'],
      amount: String(row['Amount Paid'] || row['Calculated Amount'] || '0'),
      transaction_number: String(row['Transaction Number'] || ""),
      payment_method: row['Mode of Payment'] || 'UPI',
      status: row['Status'] || 'Pending'
    };
  });

  console.log(`Uploading ${rows.length} payments...`);

  const response = await supabase.from('payments').insert(rows);

  if (response.error) {
    console.error("Error uploading payments:", response.error.message);
    console.error("Full error:", response.error);
  } else {
    console.log(`Successfully migrated ${rows.length} payment records!`);
    console.log("Response data:", response.data);
  }
}

uploadPayments();
