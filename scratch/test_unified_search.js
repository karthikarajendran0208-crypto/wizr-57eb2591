import fs from 'fs';

const SUPABASE_URL = "https://bcwfyohkgqnlxszswvgn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjd2Z5b2hrZ3FubHhzenN3dmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNjc3NjcsImV4cCI6MjA5ODk0Mzc2N30.FT4pfi_yhx3Dx2Gjyh5Tn_8FrUKd9CJCelD9u4r7Bh4";

async function testUnifiedSearch() {
  console.log(`Triggering scheduled-unified-search edge function on ${SUPABASE_URL}...`);
  const startTime = Date.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/scheduled-unified-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
    console.log(`Total execution time (from client side): ${Date.now() - startTime}ms`);
  } catch(e) {
    console.error("Error:", e);
  }
}

testUnifiedSearch();
