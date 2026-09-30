async function run() {
    console.log("Starting Twitter search...");
    const res = await fetch("https://yfcfyeueckjqanmtoubt.supabase.co/functions/v1/apify-scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        platform: "twitter",
        query: "Actinver",
        maxResults: 25
      })
    });
    
    const data = await res.json();
    console.log("Start Response:", data);
}
run();
