import json
import urllib.request

supabase_url = "https://yfcfyeueckjqanmtoubt.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2Z5ZXVlY2tqcWFubXRvdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzQ2NDYsImV4cCI6MjA4NTAxMDY0Nn0.U-sTpWo2RkpA28QNUEjuLBPtn_VmRJD1CvVHPbLPVdQ"

url = f"{supabase_url}/rest/v1/project_search_schedules?select=id,project_id,frequency,is_enabled,last_run_at,next_run_at,last_error,run_count"

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
        print(f"Total schedules returned: {len(data)}")
        for i, m in enumerate(data):
            print(f"\nSchedule {i+1}:")
            print(f"  ID:           {m.get('id')}")
            print(f"  Project ID:   {m.get('project_id')}")
            print(f"  Enabled:      {m.get('is_enabled')}")
            print(f"  Frequency:    {m.get('frequency')}")
            print(f"  Last Run At:  {m.get('last_run_at')}")
            print(f"  Next Run At:  {m.get('next_run_at')}")
            print(f"  Run Count:    {m.get('run_count')}")
            print(f"  Last Error:   {m.get('last_error')}")
except Exception as e:
    print("Error:", e)
