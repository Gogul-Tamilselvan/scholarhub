import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

const commonCols = {
  id: "TEST_ID_" + Date.now(),
  submitted_date: new Date().toISOString(),
  book_title: "Test Title",
  author_name: "Test Author",
  email: "test@example.com"
};

const abstractVariations = [
  "abstract",
  "abstract_text",
  "abstract_summary",
  "summary",
  "description",
  "book_abstract",
  "proposal_abstract"
];

async function findAbstractCol() {
  for (const variant of abstractVariations) {
    console.log(`Trying ${variant}...`);
    const { error } = await supabase.from('books').insert([{ ...commonCols, [variant]: "Test Abstract" }]);
    if (!error) {
      console.log(`SUCCESS! Column name is: ${variant}`);
      return variant;
    } else {
      console.log(`Failed ${variant}:`, error.message);
    }
  }
  
  // If all failed, maybe some other columns are wrong.
  // Let's try minimal insert.
  console.log("Trying minimal insert (only id)...");
  const { error: minError } = await supabase.from('books').insert([{ id: "MIN_TEST_" + Date.now() }]);
  if (minError) {
    console.log("Minimal insert failed:", minError.message);
  } else {
    console.log("Minimal insert worked!");
  }
}

findAbstractCol();
