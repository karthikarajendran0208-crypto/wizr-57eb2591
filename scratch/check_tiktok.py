import json
import urllib.request
import os

supabase_url = "https://yfcfyeueckjqanmtoubt.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2Z5ZXVlY2tqcWFubXRvdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzQ2NDYsImV4cCI6MjA4NTAxMDY0Nn0.U-sTpWo2RkpA28QNUEjuLBPtn_VmRJD1CvVHPbLPVdQ"

# URL encoded % as %25
url = f"{supabase_url}/rest/v1/mentions?description=ilike.%25oliverxmichel%25&select=id,title,description,url,source_domain,raw_metadata&limit=10"

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
        print(f"Found {len(data)} mentions:")
        for i, m in enumerate(data):
            print(f"\n--- Mention {i+1} ---")
            print(f"ID: {m.get('id')}")
            print(f"Title: {m.get('title')}")
            print(f"Description: {m.get('description')}")
            print(f"URL: {m.get('url')}")
            print(f"Source: {m.get('source_domain')}")
            print(f"Raw Metadata: {json.dumps(m.get('raw_metadata'))}")
except Exception as e:
    print("Error:", e)
