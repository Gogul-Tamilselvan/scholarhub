import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
async function checkMore() {
  const cols = ['amount', 'payment_amount', 'total_amount', 'paid_amount', 'manuscript_id', 'ms_id', 'email', 'email_address', 'payment_method', 'method'];
  const results = {};
  for (const col of cols) {
    const { error } = await supabase.from('payments').select(col).limit(0);
    results[col] = !error;
  }
  console.log("Column check:", results);
}
checkMore();
