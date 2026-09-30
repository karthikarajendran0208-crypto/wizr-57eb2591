import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from("mentions")
    .select("id, title, description, url, source_domain, raw_metadata")
    .ilike("description", "%oliverxmichel%")
    .limit(10);

  if (error) {
    console.error("Error querying mentions:", error);
    return;
  }

  console.log(`Found ${data.length} mentions:`);
  data.forEach((m, i) => {
    console.log(`\n--- Mention ${i + 1} ---`);
    console.log(`ID: ${m.id}`);
    console.log(`Title: ${m.title}`);
    console.log(`Description: ${m.description}`);
    console.log(`URL: ${m.url}`);
    console.log(`Source: ${m.source_domain}`);
    console.log(`Raw Metadata:`, JSON.stringify(m.raw_metadata));
  });
}

run();
