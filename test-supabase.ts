import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data, error, count } = await supabase.from('manuscripts').select('*', { count: 'exact' }).limit(5);
  console.log('[Service Role] Error:', error);
  console.log('[Service Role] Count:', count);
  console.log('[Service Role] Data:', data);
  
  const { data: revData, error: revError } = await supabase.from('reviewers').select('*').limit(5);
  console.log('[Service Role] Reviewers Error:', revError);
  console.log('[Service Role] Reviewers Data:', revData);
}

testQuery();
