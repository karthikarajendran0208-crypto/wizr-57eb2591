import fs from 'fs';

const SUPABASE_URL = "https://yfcfyeueckjqanmtoubt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2Z5ZXVlY2tqcWFubXRvdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzQ2NDYsImV4cCI6MjA4NTAxMDY0Nn0.U-sTpWo2RkpA28QNUEjuLBPtn_VmRJD1CvVHPbLPVdQ";

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
