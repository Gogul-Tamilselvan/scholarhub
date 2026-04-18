import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function upload() {
  const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Assignments'];

  const raw = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const dataRows = raw.slice(1);

  const rows = dataRows
    .filter((row: any[]) => row[1] || row[2]) // ReviewerID or ManuscriptID must exist
    .map((row: any[]) => ({
      assigned_at: String(row[0] || ''),
      reviewer_id: String(row[1] || ''),
      manuscript_id: String(row[2] || ''),
      due_date: String(row[3] || ''),
      notes: String(row[4] || ''),
      status: String(row[5] || 'Pending'),
      manuscript_link: String(row[6] || ''),
      recommendation: String(row[7] || ''),
      overall_marks: String(row[8] || ''),
      reviewer_email: String(row[9] || ''),
      reviewer_full_name: String(row[10] || ''),
      manuscript_title: String(row[11] || ''),
      certificate_no: String(row[12] || ''),
      importance: String(row[13] || ''),
      title_feedback: String(row[14] || ''),
      abstract_feedback: String(row[15] || ''),
      scientific_correctness: String(row[16] || ''),
      references_feedback: String(row[17] || ''),
      language_quality: String(row[18] || ''),
      general_comments: String(row[19] || ''),
      ethical_issues: String(row[20] || ''),
      ethical_details: String(row[21] || ''),
      competing_interests: String(row[22] || ''),
      plagiarism_suspected: String(row[23] || ''),
      submission_date: String(row[24] || ''),
      reviews_submitted_total: String(row[25] || ''),
      last_submission_date: String(row[26] || ''),
      reviewer_email_status: String(row[27] || ''),
      extra_col_1: String(row[28] || ''),
      extra_col_2: String(row[29] || '')
    }));

  console.log(`Found ${rows.length} valid assignment records`);

  const { error } = await supabase.from('assignments').insert(rows);
  if (error) {
    console.error(`Upload failed:`, error.message);
  } else {
    console.log(`✅ Successfully uploaded ${rows.length} assignments with 30 columns.`);
  }
}

upload();
