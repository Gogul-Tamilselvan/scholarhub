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
  const data = xlsx.utils.sheet_to_json(worksheet);

  // Fetch all manuscripts to map titles to IDs
  console.log("Fetching manuscripts for mapping...");
  const { data: manuscripts, error: msError } = await supabase.from('manuscripts').select('id, manuscript_title');
  if (msError) {
    console.error("Error fetching manuscripts:", msError.message);
    return;
  }

  const msMap = new Map();
  manuscripts.forEach(m => {
    if (m.manuscript_title) {
      msMap.set(m.manuscript_title.trim().toLowerCase(), m.id);
    }
  });

  const rows = data.map((row: any) => {
    const title = (row['Manuscript Title'] || "").trim().toLowerCase();
    const manuscriptId = msMap.get(title) || 'Unknown';
    
    let submitted_at = row['Submitted At'];
    if (typeof submitted_at === 'string' && submitted_at.includes(',')) {
       // Handle "13/1/2026, 4:03:41 pm"
       const parts = submitted_at.split(', ');
       const dateParts = parts[0].split('/');
       submitted_at = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1]}`;
    }

    return {
      submitted_at: submitted_at,
      manuscript_id: manuscriptId,
      email: row['Email'],
      amount: String(row['Amount Paid'] || row['Calculated Amount']),
      transaction_id: String(row['Transaction Number'] || ""),
      payment_method: row['Mode of Payment'],
      status: row['Status'] || 'Pending'
    };
  });

  console.log(`Uploading ${rows.length} payments...`);

  const { error } = await supabase.from('payments').insert(rows);

  if (error) {
    console.error("Error uploading payments:", error.message);
  } else {
    console.log(`Successfully uploaded ${rows.length} payments!`);
  }
}

uploadPayments();
