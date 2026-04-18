import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAssignments() {
  const { data, error } = await supabase.from('assignments').select('*').limit(10);
  if (error) {
    console.error('Error fetching assignments:', error);
  } else {
    console.log('Assignments:', JSON.stringify(data, null, 2));
  }
}

checkAssignments();
