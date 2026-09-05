"""
Phase 3: Data Preprocessing
Preprocess raw NYC 311 records into structured train/test datasets for CivicSense AI NLP Classifier.
"""
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split

RAW_PATH = Path("c:/PROJECTS/Sustainability/civicsense-ai/data/raw/nyc_311_sample.csv")
PROC_DIR = Path("c:/PROJECTS/Sustainability/civicsense-ai/data/processed")
PROC_DIR.mkdir(parents=True, exist_ok=True)

TRAIN_PATH = PROC_DIR / "complaints_train.csv"
TEST_PATH = PROC_DIR / "complaints_test.csv"

# Category mapping
MAP = {
    "Illegal Dumping": "Garbage / Waste",
    "Street Condition": "Pothole / Road Damage",
    "Water System": "Water Leakage / Sanitation",
    "Sewer": "Drainage / Flooding",
    "Street Light Condition": "Broken Streetlight",
    "Traffic Signal Condition": "Broken Streetlight",
    "Damaged Tree": "Fallen Tree / Vegetation",
    "Overgrown Tree/Branches": "Fallen Tree / Vegetation",
    "Air Quality": "Pollution",
    "Noise - Commercial": "Pollution"
}

df = pd.read_csv(RAW_PATH)
print(f"Loaded {len(df)} raw records.")

# Synthesize realistic complaint text using descriptor + location + context
# E.g. "Pothole reported near 5th Ave in Queens. Status: open."
def build_text(row):
    desc = str(row.get('descriptor', '')).strip()
    addr = str(row.get('incident_address', '')).strip()
    boro = str(row.get('borough', '')).strip()
    ctype = str(row.get('complaint_type', '')).strip()
    
    parts = []
    if desc and desc != "nan":
        parts.append(desc)
    else:
        parts.append(f"Issue with {ctype}")
        
    loc_parts = []
    if addr and addr != "nan":
        loc_parts.append(f"at {addr}")
    if boro and boro != "nan" and boro != "Unspecified":
        loc_parts.append(f"in {boro}")
        
    if loc_parts:
        parts.append(" ".join(loc_parts))
        
    text = ". ".join(parts)
    if not text.endswith('.'):
        text += '.'
    return text

df['text'] = df.apply(build_text, axis=1)
df['category'] = df['complaint_type'].map(MAP).fillna("Other Infrastructure")

# Filter clean samples
clean_df = df[['text', 'category', 'latitude', 'longitude', 'borough']].dropna(subset=['text', 'category'])
clean_df = clean_df[clean_df['text'].str.len() > 10]

print("\nClass distribution:")
print(clean_df['category'].value_counts())

train_df, test_df = train_test_split(
    clean_df, test_size=0.20, random_state=42, stratify=clean_df['category']
)

train_df.to_csv(TRAIN_PATH, index=False)
test_df.to_csv(TEST_PATH, index=False)

print(f"\nSaved {len(train_df)} training rows to: {TRAIN_PATH}")
print(f"Saved {len(test_df)} testing rows to: {TEST_PATH}")
