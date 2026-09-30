import json
import urllib.request

supabase_url = "https://yfcfyeueckjqanmtoubt.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2Z5ZXVlY2tqcWFubXRvdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzQ2NDYsImV4cCI6MjA4NTAxMDY0Nn0.U-sTpWo2RkpA28QNUEjuLBPtn_VmRJD1CvVHPbLPVdQ"

url = f"{supabase_url}/rest/v1/mentions?select=id,project_id,title,source_domain,url&limit=10"

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
        print(f"Total records returned: {len(data)}")
        for i, m in enumerate(data):
            print(f"Mention {i+1}: Project={m.get('project_id')} | Title={m.get('title')} | Source={m.get('source_domain')} | URL={m.get('url')}")
except Exception as e:
    print("Error:", e)
