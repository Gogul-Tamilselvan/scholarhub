import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function seedJournals() {
  const journalsToInsert = [
    {
      slug: "sjcm",
      title: "Scholar Journal of Commerce and Management",
      subject: "Commerce and Management",
      starting_year: "2024",
      reference_style: "APA"
    },
    {
      slug: "sjhss",
      title: "Scholar Journal of Humanities and Social Sciences",
      subject: "Humanities and Social Sciences",
      starting_year: "2024",
      reference_style: "APA"
    }
  ];

  console.log("Checking if journals exist...");
  
  for (const journal of journalsToInsert) {
    // Upsert logic (insert if not exists, otherwise update based on 'slug')
    const { data: existing, error: checkError } = await supabase
      .from("journals")
      .select("id")
      .eq("slug", journal.slug)
      .single();
      
    if (existing) {
       console.log(`Journal "${journal.title}" already exists, skipping...`);
       continue;
    }

    console.log(`Inserting: ${journal.title}`);
    const { error: insertError } = await supabase
      .from("journals")
      .insert([journal]);

    if (insertError) {
      console.error(`Error inserting ${journal.title}:`, insertError.message);
    } else {
      console.log(`✅ Successfully seeded "${journal.title}"`);
    }
  }
}

seedJournals();
