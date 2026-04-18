import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import * as path from 'path';

const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
const workbook = xlsx.readFile(file);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Read raw data
const data = xlsx.utils.sheet_to_json(worksheet, { raw: false });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadData() {
  console.log(`Starting upload of ${data.length} records...`);

  // Map to DB schema
  const mappedData = data.map((row: any) => {
     let submittedAt = null;
     if (row['Submitted At']) {
       const dateStr = row['Submitted At'];
       // Excel sometimes formats dates awkwardly in JSON export. 
       // If it's a valid string format like ISO, parse it.
       const pDate = new Date(dateStr);
       submittedAt = isNaN(pDate.getTime()) ? null : pDate.toISOString();
     }

     return {
        id: row['Manuscript ID'] || undefined,
        submitted_at: submittedAt,
        author_name: row['Author Name'] || null,
        designation: row['Designation'] || null,
        department: row['Department'] || null,
        affiliation: row['Affiliation'] || null,
        email: row['Email'] || null,
        mobile: row['Mobile'] ? String(row['Mobile']) : null,
        journal: row['Journal'] || null,
        manuscript_title: row['Manuscript Title'] || null,
        author_count: row['Author Count'] ? parseInt(row['Author Count'], 10) : null,
        author_names: row['Author Names'] || null,
        file_url: row['File URL'] || null,
        status: row['Status'] || null,
        doi: row['DOI'] || null,
        email_status: row['Email Status'] || null
     };
  }).filter((x: any) => x.id); // Filter out empty rows without IDs

  if (mappedData.length === 0) {
    console.log("No valid records to upload.");
    return;
  }

  // Upload in chunks to avoid single request payload limits
  const chunkSize = 50;
  for (let i = 0; i < mappedData.length; i += chunkSize) {
    const chunk = mappedData.slice(i, i + chunkSize);
    console.log(`Uploading chunk ${i} to ${i + chunk.length}...`);
    
    // upsert matches by primary key and updates if exists
    const { error } = await supabase.from('manuscripts').upsert(chunk, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error uploading chunk ${i}:`, error);
      process.exit(1);
    }
  }

  console.log("Upload completed successfully!");
}

uploadData();
