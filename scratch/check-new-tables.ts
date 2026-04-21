
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vzmlpfihumzrabokdono.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yzDg0UyFo1rCHbUbBIN0gg_45aKTrwz';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const p = await supabase.from('payments').select('*').eq('manuscript_id', 'MANSJHS2604XG5Q');
  console.log('payments:', p.data);
}
check();

