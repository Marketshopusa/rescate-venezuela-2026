import urllib.request
import sys

url = "https://venezuelatebusca.com/media/photos/94b745c6-f029-46fb-afc5-0db8d8e2416d.jpg"
print(f"Testing URL with Referer header: {url}")

try:
    req = urllib.request.Request(
        url, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://venezuelatebusca.com/',
            'Origin': 'https://venezuelatebusca.com'
        }
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        code = response.getcode()
        info = response.info()
        print(f"HTTP Status Code: {code}")
        print(f"Content-Type: {info.get('Content-Type')}")
        print(f"Content-Length: {info.get('Content-Length')}")
        print("Success! The image is accessible with the correct Referer header.")
except Exception as e:
    print(f"Error occurred: {e}", file=sys.stderr)
