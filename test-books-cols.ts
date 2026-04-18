import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
async function test() {
  const { error } = await supabase.from('books').upsert([{ 
    id: "test", 
    submitted_date: new Date(), 
    book_title: 'Title', 
    publication_type: 'Book',
    publication_format: 'Online',
    author_name: "test",
    email: "t@t.com",
    mobile: "123",
    institution: "hi",
    designation: "prof",
    subject_area: "cs",
    expected_pages: "100",
    abstract: "ab",
    co_authors_count: "2",
    co_authors_details: "hi",
    proposal_link: "link",
    status: "ok",
    email_tracking_status: "ok"
  }]);
  console.log(error);
}
test();
