import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

const tableCols: Record<string, string[]> = {
  manuscripts: [
    'id', 'submitted_at', 'author_name', 'designation', 'department', 'affiliation',
    'email', 'mobile', 'journal', 'manuscript_title', 'research_field', 'author_count',
    'author_names', 'file_url', 'status', 'doi', 'organization', 'area'
  ],
  reviewers: [
    'id', 'submitted_date', 'first_name', 'last_name', 'email', 'mobile', 'role',
    'designation', 'area_of_interest', 'journal', 'orcid', 'google_scholar', 'institution',
    'state', 'district', 'pin_number', 'nationality', 'message_to_editor', 'profile_pdf_link',
    'status', 'reviews_submitted', 'last_submission_date', 'new_password',
    'department', 'country', 'whatsapp', 'field_of_specialization'
  ],
  books: [
    'id', 'submitted_at', 'book_title', 'author_name', 'email', 'mobile',
    'institution', 'designation', 'subject_area', 'abstract', 'status',
    'publication_type', 'publication_format', 'expected_pages', 'co_authors_count',
    'co_authors_details', 'proposal_link', 'email_tracking_status'
  ],
  payments: [
    'id', 'submitted_at', 'manuscript_id', 'email', 'amount', 'transaction_number',
    'payment_method', 'status', 'payment_method', 'author_name', 'author_type',
    'currency', 'date_of_payment', 'number_of_authors', 'publication_type', 'email_tracking'
  ],
  assignments: [
    'id', 'assigned_at', 'reviewer_id', 'manuscript_id', 'due_date', 'notes', 'status',
    'manuscript_link', 'recommendation', 'overall_marks', 'reviewer_email',
    'reviewer_full_name', 'manuscript_title', 'certificate_no', 'importance',
    'title_feedback', 'abstract_feedback', 'scientific_correctness', 'references_feedback',
    'language_quality', 'general_comments', 'ethical_issues', 'ethical_details',
    'competing_interests', 'plagiarism_suspected', 'reviewer_email_status'
  ]
};

async function checkCols() {
  for (const [table, cols] of Object.entries(tableCols)) {
    console.log(`\nChecking ${table}...`);
    const missing: string[] = [];
    const existing: string[] = [];
    for (const col of cols) {
      const { error } = await supabase.from(table).select(col).limit(0);
      if (error) {
        missing.push(col);
      } else {
        existing.push(col);
      }
    }
    console.log(`  Existing: ${existing.join(', ')}`);
    console.log(`  MISSING:  ${missing.join(', ')}`);
  }
}

checkCols();
