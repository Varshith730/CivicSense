"""
Fetch a balanced sample of real NYC 311 complaints directly from the NYC Open Data Socrata API.
No manual download or API key required.
"""
import requests
import pandas as pd
from pathlib import Path

DATA_DIR = Path("c:/PROJECTS/Sustainability/civicsense-ai/data/raw")
DATA_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE = DATA_DIR / "nyc_311_sample.csv"

# NYC 311 Open Data Socrata Endpoint
API_URL = "https://data.cityofnewyork.us/resource/erm2-nwe9.json"

# Key complaint categories mapped to our 8 CivicSense categories
COMPLAINT_TYPES = [
    "Illegal Dumping",
    "Dirty Conditions",
    "Missed Collection (Trash)",
    "Pothole",
    "Street Condition",
    "Water System",
    "Sewer",
    "Street Light Condition",
    "Traffic Signal Condition",
    "Damaged Tree",
    "Overgrown Tree/Branches",
    "Air Quality",
    "Noise - Commercial"
]

all_records = []
print("Fetching real NYC 311 complaints via Socrata API...")

for c_type in COMPLAINT_TYPES:
    print(f"  Fetching: {c_type}...")
    params = {
        "$select": "unique_key,created_date,complaint_type,descriptor,incident_address,borough,latitude,longitude,status",
        "$where": f"complaint_type = '{c_type}' AND descriptor IS NOT NULL",
        "$limit": 500,
        "$order": "created_date DESC"
    }
    try:
        resp = requests.get(API_URL, params=params, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            all_records.extend(data)
            print(f"    -> Retrieved {len(data)} records")
        else:
            print(f"    -> Warning: Status {resp.status_code}")
    except Exception as e:
        print(f"    -> Error fetching {c_type}: {e}")

if all_records:
    df = pd.DataFrame(all_records)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n[SUCCESS] Saved {len(df)} real NYC 311 records to:")
    print(f"  {OUTPUT_FILE}")
else:
    print("\n[ERROR] Could not fetch records. Please check internet connection.")
