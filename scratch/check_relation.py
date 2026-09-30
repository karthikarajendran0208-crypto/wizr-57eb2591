import json
import urllib.request

supabase_url = "https://yfcfyeueckjqanmtoubt.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2Z5ZXVlY2tqcWFubXRvdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzQ2NDYsImV4cCI6MjA4NTAxMDY0Nn0.U-sTpWo2RkpA28QNUEjuLBPtn_VmRJD1CvVHPbLPVdQ"

url = f"{supabase_url}/rest/v1/project_search_schedules?select=*,projects(id,nombre)"

req = urllib.request.Request(
    url,
    headers={
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}"
    }
)

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode())
except Exception as e:
    print("Error:", e)
