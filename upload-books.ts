import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function uploadBooks() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('book')) || workbook.SheetNames[2];
  console.log(`Reading from sheet: ${sheetName}`);
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  // Define potential mappings
  const mapping: any = {
    'Book Ref Number': 'id',
    'Submitted Date': 'submitted_at',
    'Book Title': 'book_title',
    'Publication Type': 'publication_type',
    'Publication Format': 'publication_format',
    'Author Name': 'author_name',
    'Email': 'email',
    'Mobile': 'mobile',
    'Institution': 'institution',
    'Designation': 'designation',
    'Subject Area': 'subject_area',
    'Expected Pages': 'expected_pages',
    'Abstract': 'abstract',
    'Co-Authors Count': 'co_authors_count',
    'Co-Authors Details': 'co_authors_details',
    'Proposal Link': 'proposal_link',
    'Status': 'status',
    'Email Tracking Status': 'email_tracking_status'
  };

  // Find existing columns in Supabase
  const targetCols = Object.values(mapping);
  const existingCols: string[] = [];
  for (const col of targetCols as string[]) {
    const { error } = await supabase.from('books').select(col).limit(0);
    if (!error) {
      existingCols.push(col);
    }
  }
  
  console.log("Existing columns in Supabase 'books' table:", existingCols);

  const rows = data.map((row: any) => {
    const mapped: any = {};
    for (const [excelKey, dbCol] of Object.entries(mapping)) {
      if (existingCols.includes(dbCol as string) && row[excelKey] !== undefined) {
        let value = row[excelKey];
        // Handle dates
        if (dbCol === 'submitted_at' && typeof value === 'number') {
           value = new Date((value - 25569) * 86400 * 1000).toISOString();
        }
        mapped[dbCol as string] = value;
      }
    }
    return mapped;
  }).filter(r => r.id);

  console.log(`Prepared ${rows.length} rows for upload.`);

  if (rows.length === 0) {
    console.log("No valid rows found to upload.");
    return;
  }

  const { error } = await supabase.from('books').upsert(rows);

  if (error) {
    console.error("Error uploading books:", error);
  } else {
    console.log(`Successfully uploaded ${rows.length} books!`);
  }
}

uploadBooks();
