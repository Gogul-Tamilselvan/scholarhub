import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  // We can select 1 row just to see the returned keys
  const { data, error } = await supabase.from("manuscripts").select("*").limit(1);
  if (error) {
    console.error("Error fetching manuscripts:", error);
  } else {
    if (data && data.length > 0) {
      console.log("Columns found in manuscripts:");
      console.log(Object.keys(data[0]));
    } else {
      console.log("No data returned, but query succeeded. Let's try to query an invalid column to see the full list of columns...");
      const { error: err2 } = await supabase.from("manuscripts").select("dummy_invalid_column").limit(1);
      console.log("Error when selecting invalid:", err2);
    }
  }
}

checkSchema();
