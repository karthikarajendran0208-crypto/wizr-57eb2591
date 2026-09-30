import json
import urllib.request

supabase_url = "https://yfcfyeueckjqanmtoubt.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2Z5ZXVlY2tqcWFubXRvdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzQ2NDYsImV4cCI6MjA4NTAxMDY0Nn0.U-sTpWo2RkpA28QNUEjuLBPtn_VmRJD1CvVHPbLPVdQ"

url = f"{supabase_url}/rest/v1/social_scrape_jobs?select=id,platform,search_type,search_value,status,error_message,created_at&order=created_at.desc&limit=5"

req = urllib.request.Request(
    url,
    headers={
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}"
    }
)

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(f"Total jobs returned: {len(data)}")
        for i, m in enumerate(data):
            print(f"\nJob {i+1}:")
            print(f"  ID:            {m.get('id')}")
            print(f"  Created At:    {m.get('created_at')}")
            print(f"  Platform:      {m.get('platform')}")
            print(f"  Search Type:   {m.get('search_type')}")
            print(f"  Search Value:  {m.get('search_value')}")
            print(f"  Status:        {m.get('status')}")
            print(f"  Error Message: {m.get('error_message')}")
except Exception as e:
    print("Error:", e)
