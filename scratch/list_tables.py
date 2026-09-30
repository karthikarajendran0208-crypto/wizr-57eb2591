import urllib.request
import json

supabase_url = "https://yfcfyeueckjqanmtoubt.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2Z5ZXVlY2tqcWFubXRvdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzQ2NDYsImV4cCI6MjA4NTAxMDY0Nn0.U-sTpWo2RkpA28QNUEjuLBPtn_VmRJD1CvVHPbLPVdQ"

url = f"{supabase_url}/rest/v1/?apikey={supabase_key}"

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
        paths = data.get("paths", {})
        tables = [p.strip("/") for p in paths.keys() if p != "/"]
        print("Available endpoints/tables:")
        for t in sorted(tables):
            print(" -", t)
except Exception as e:
    print("Error:", e)
