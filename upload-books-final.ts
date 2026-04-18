import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function uploadBooks() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheetName = 'Books';
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  const rows = data.map((row: any) => {
    return {
      id: row['Book Ref Number'],
      book_title: row['Book Title'],
      author_name: row['Author Name'],
      email: row['Email'],
      mobile: row['Mobile'],
      institution: row['Institution'],
      designation: row['Designation'],
      subject_area: row['Subject Area'],
      abstract: row['Abstract'],
      status: row['Status'] || 'Submitted'
    };
  }).filter(r => r.id);

  console.log(`Uploading ${rows.length} books to newly fixed table...`);

  const { error } = await supabase.from('books').upsert(rows);

  if (error) {
    console.error("Error uploading books:", error.message);
  } else {
    console.log(`Successfully uploaded ${rows.length} books!`);
  }
}

uploadBooks();
