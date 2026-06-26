import urllib.request
import json
import time
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
all_json_path = os.path.join(project_dir, "scraped_persons_all.json")
mini_json_path = os.path.join(project_dir, "scraped_persons_mini.json")

# Try to use a larger page size (100) to fetch faster and reduce request count
url_template = "https://desaparecidos-terremoto-api.theempire.tech/api/personas?page={}&pageSize=100"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
}

# 1. Read existing local database count
existing_count = 0
existing_items = []
if os.path.exists(all_json_path):
    try:
        with open(all_json_path, "r", encoding="utf-8") as f:
            local_data = json.load(f)
            existing_items = local_data.get("items", [])
            existing_count = len(existing_items)
    except Exception as e:
        print(f"Error reading existing local database: {e}")

print(f"Local database currently has {existing_count} records.")

# 2. Check live API count
print("Checking live API for updates...")
live_count = 0
total_pages = 1
try:
    req = urllib.request.Request(url_template.format(1), headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response:
        data = json.loads(response.read().decode('utf-8'))
        live_count = data.get("total", 0)
        total_pages = data.get("totalPages", 1)
except Exception as e:
    print(f"Error checking live API: {e}")
    if "403" in str(e):
        print("API is protected by reCAPTCHA or returned 403 Forbidden. Skipping synchronization gracefully.")
        exit(0)
    exit(1)

print(f"Live API currently has {live_count} records.")

if live_count <= existing_count and existing_count > 0:
    print("Database is already up to date or live count is lower. No updates needed.")
    exit(0)

# 3. Fetch all pages from live API with robust retry logic
print(f"Fetching updated database ({live_count} records, {total_pages} pages)...")
all_items = []
page = 1
max_retries = 5

while page <= total_pages:
    url = url_template.format(page)
    success = False
    
    for retry in range(1, max_retries + 1):
        print(f"Fetching page {page} of {total_pages} (Attempt {retry}/{max_retries})...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as response:
                data = json.loads(response.read().decode('utf-8'))
                items = data.get("items", [])
                all_items.extend(items)
                success = True
                break
        except Exception as e:
            backoff = retry * 3
            print(f"Error on page {page}: {e}. Retrying in {backoff} seconds...")
            time.sleep(backoff)
            
    if not success:
        print(f"Failed to fetch page {page} after {max_retries} attempts. Aborting database save to protect local data.")
        exit(1)
        
    page += 1
    time.sleep(0.15) # small delay

# 4. Save and overwrite files ONLY if we successfully fetched the entire database
if len(all_items) >= live_count * 0.95:  # tolerance threshold of 95%
    keys = ['id', 'nombre', 'edad', 'ubicacion', 'descripcion', 'contacto', 'foto', 'estado', 'createdAt']
    
    # Compress all items to list of lists format
    compressed_all = [[x.get(k) for k in keys] for x in all_items]
    all_data = {
        "keys": keys,
        "items": compressed_all,
        "total": len(compressed_all)
    }
    
    # Save all database without indentation to minimize size
    with open(all_json_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False)
    print(f"Saved {len(all_items)} records (compressed) to scraped_persons_all.json")
    
    # Compress mini items (first 200)
    mini_items = all_items[:200]
    compressed_mini = [[x.get(k) for k in keys] for x in mini_items]
    mini_data = {
        "keys": keys,
        "items": compressed_mini,
        "total": len(compressed_mini)
    }
    
    # Save mini database
    with open(mini_json_path, "w", encoding="utf-8") as f:
        json.dump(mini_data, f, ensure_ascii=False)
    print(f"Saved {len(mini_items)} records (compressed) to scraped_persons_mini.json")
else:
    print(f"Verification failed: expected {live_count} records, but only fetched {len(all_items)}. Database was not overwritten to protect integrity.")
    exit(1)

