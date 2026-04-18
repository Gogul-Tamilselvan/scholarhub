import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
async function checkCols() {
  const cols = ['amount', 'payment_amount', 'transaction_id', 'transaction_number', 'status', 'submitted_at'];
  const existing = [];
  for (const col of cols) {
    const { error } = await supabase.from('payments').select(col).limit(0);
    if (!error) existing.push(col);
  }
  console.log("Existing columns in 'payments':", existing);
}
checkCols();
