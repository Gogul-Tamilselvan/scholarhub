import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

const colsToTest = [
  "submitted_at",
  "submitted_date",
  "book_title",
  "title",
  "author_name",
  "email",
  "mobile",
  "phone",
  "institution",
  "organization",
  "designation",
  "subject_area",
  "subject",
  "expected_pages",
  "pages",
  "abstract",
  "summary",
  "status"
];

async function checkCols() {
  const existingCols = [];
  for (const col of colsToTest) {
    const { error } = await supabase.from('books').select(col).limit(0);
    if (!error) {
      existingCols.push(col);
    } else {
      // console.log(`Col ${col} error:`, error.message);
    }
  }
  console.log("Existing columns in 'books' table:", existingCols);
}

checkCols();
