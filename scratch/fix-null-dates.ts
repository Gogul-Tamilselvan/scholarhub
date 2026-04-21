
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vzmlpfihumzrabokdono.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yzDg0UyFo1rCHbUbBIN0gg_45aKTrwz';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fix() {
  const d = new Date().toISOString();

  await supabase.from('payments').update({ submitted_at: d, date_of_payment: d }).is('submitted_at', null);
  await supabase.from('payments').update({ manuscript_title: 'Untitled (Auto Fix)' }).is('manuscript_title', null);
  
  await supabase.from('copyright_forms').update({ submitted_at: d }).is('submitted_at', null);
  await supabase.from('final_papers').update({ submitted_at: d }).is('submitted_at', null);

  console.log('Fixed null dates!');
}
fix();

