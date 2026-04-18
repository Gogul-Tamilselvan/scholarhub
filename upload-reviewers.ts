import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import * as path from 'path';

const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
const workbook = xlsx.readFile(file);
const worksheet = workbook.Sheets['Reviewers'];

// Read raw data
const data = xlsx.utils.sheet_to_json(worksheet, { raw: false });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadData() {
  console.log(`Starting upload of ${data.length} records to reviewers table...`);

  // Map to DB schema based on standard Supabase setup
  const mappedData = data.map((row: any) => {
     let submittedAt = null;
     if (row['Submitted Date']) {
       const dateStr = row['Submitted Date'];
       const parts = dateStr.split('/');
       if (parts.length === 3) {
          // DD/MM/YYYY
          const pDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          submittedAt = isNaN(pDate.getTime()) ? null : pDate.toISOString();
       } else {
          const pDate = new Date(dateStr);
          submittedAt = isNaN(pDate.getTime()) ? null : pDate.toISOString();
       }
     }

     return {
        id: row['Reviewer ID'] || undefined,
        submitted_date: submittedAt,
        first_name: row['First Name'] || null,
        email: row['Email'] || null,
        mobile: row['Mobile'] ? String(row['Mobile']) : null,
        role: row['Role'] || null,
        designation: row['Designation'] || null,
        area_of_interest: row['Area of Interest'] || null,
        journal: row['Journal'] || null,
        orcid: row['ORCID'] || null,
        google_scholar: row['Google Scholar'] || null,
        institution: row['Institution'] || null,
        state: row['State'] || null,
        district: row['District'] || null,
        pin_number: row['Pin Number'] ? String(row['Pin Number']) : null,
        nationality: row['Nationality'] || null,
        status: row['Status'] || null
        // institutional_profile: row['Institutional Profile Page'] || null,
        // email_tracking: row['Email Tracking'] || null
     };
  }).filter((x: any) => x.id); // Filter out empty rows without IDs

  if (mappedData.length === 0) {
    console.log("No valid records to upload.");
    return;
  }

  // Deduplicate array by 'id' to fix 'ON CONFLICT DO UPDATE command cannot affect row a second time' error
  const uniqueMappedData = Array.from(
     new Map(mappedData.map((item: any) => [item.id, item])).values()
  );

  // Upload in chunks
  const chunkSize = 50;
  for (let i = 0; i < uniqueMappedData.length; i += chunkSize) {
    const chunk = uniqueMappedData.slice(i, i + chunkSize);
    console.log(`Uploading reviewer chunk ${i} to ${i + chunk.length}...`);
    
    // upsert matches by primary key and updates if exists
    const { error } = await supabase.from('reviewers').upsert(chunk, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error uploading reviewer chunk ${i}:`, error);
      process.exit(1);
    }
  }

  console.log("Reviewers upload completed successfully!");
}

uploadData();
