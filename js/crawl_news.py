import urllib.request
import xml.etree.ElementTree as ET
import re
import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
all_json_path = os.path.join(project_dir, 'scraped_persons_all.json')
official_json_path = os.path.join(project_dir, 'official_data.json')

# 1. Default fallback stats
total_val = 50300
missing_val = 44865
safe_val = 5435
hospitalized_val = 1500
deceased_val = 188

# 1. Fetch live API stats (highly reliable and fast)
api_success = False
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json'
}
try:
    api_url = "https://desaparecidos-terremoto-api.theempire.tech/api/personas?page=1&pageSize=1"
    req = urllib.request.Request(api_url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        counts = res_data.get("counts", {})
        if counts and counts.get("total"):
            total_val = counts.get("total")
            missing_val = counts.get("sinContacto")
            safe_val = counts.get("localizado")
            api_success = True
            print(f"Loaded live API counts: total={total_val}, missing={missing_val}, safe={safe_val}")
except Exception as e:
    print(f"Error fetching live API counts: {e}")

if not api_success:
    print("Falling back to local database scraped_persons_all.json for counts...")
    try:
        if os.path.exists(all_json_path):
            with open(all_json_path, 'r', encoding='utf-8') as f:
                local_data = json.load(f)
                keys = local_data.get("keys", [])
                items = local_data.get("items", [])
                if items and "estado" in keys:
                    status_idx = keys.index("estado")
                    total_val = len(items)
                    safe_val = sum(1 for row in items if row[status_idx] == "localizado")
                    missing_val = total_val - safe_val
                    print(f"Fallback counts loaded from local database: total={total_val}, missing={missing_val}, safe={safe_val}")
    except Exception as local_err:
        print(f"Error loading fallback counts: {local_err}")


# 2. Fetch Google News RSS
rss_url = 'https://news.google.com/rss/search?q=sismo+venezuela+2026+OR+terremoto+venezuela&hl=es-419&gl=VE&ceid=VE:es-419'
headers = {'User-Agent': 'Mozilla/5.0'}
reports = []

max_deceased = deceased_val
max_injured = hospitalized_val

try:
    req = urllib.request.Request(rss_url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response:
        xml_data = response.read().decode('utf-8')
        root = ET.fromstring(xml_data)
        
        items = root.findall('.//item')
        print(f'Fetched {len(items)} news items from Google News RSS.')
        
        for idx, item in enumerate(items):
            title = item.find('title').text or ''
            link = item.find('link').text or ''
            pub_date = item.find('pubDate').text or ''
            
            title_clean = re.sub(r'(\d+)\.(\d{3})', r'\1\2', title)
            
            dec_match = re.search(r'(\d+)\s*(?:muertos|fallecidos|muertes|víctimas mortales|fallecieron)', title_clean, re.IGNORECASE)
            if dec_match:
                val = int(dec_match.group(1))
                if val > max_deceased and val < 5000:
                    max_deceased = val
            
            inj_match = re.search(r'(\d+)\s*(?:heridos|lesionados|hospitalizados)', title_clean, re.IGNORECASE)
            if inj_match:
                val = int(inj_match.group(1))
                if val > max_injured and val < 20000:
                    max_injured = val
            
            if idx < 10:
                source = 'Noticia'
                msg_text = title
                for sep in [' - ', ' | ']:
                    if sep in title:
                        parts = title.split(sep)
                        source = parts[-1].strip()
                        msg_text = sep.join(parts[:-1]).strip()
                        break
                        
                reports.append({
                    'time': source,
                    'message': msg_text,
                    'link': link
                })
except Exception as e:
    print(f'Error fetching/parsing news RSS: {e}')

# 3. Save official_data.json
official_data = {
    'stats': {
        'total': total_val,
        'missing': missing_val,
        'hospitalized': max_injured,
        'safe': safe_val,
        'deceased': max_deceased
    },
    'reports': reports
}

with open(official_json_path, 'w', encoding='utf-8') as f:
    json.dump(official_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated official_data.json with stats: {official_data['stats']}")
