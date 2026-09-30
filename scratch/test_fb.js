import fs from 'fs';

const SUPABASE_URL = "https://yfcfyeueckjqanmtoubt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2Z5ZXVlY2tqcWFubXRvdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzQ2NDYsImV4cCI6MjA4NTAxMDY0Nn0.U-sTpWo2RkpA28QNUEjuLBPtn_VmRJD1CvVHPbLPVdQ";

async function testFb() {
  console.log("Testing apify-scrape edge function for facebook...");
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/apify-scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        platform: "facebook",
        query: "Actinver",
        maxResults: 25
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch(e) {
    console.error("Error:", e);
  }
}

testFb();
