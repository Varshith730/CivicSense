"""
CivicSense AI - Firebase Firestore & Clean Local Adapter
Provides seamless cloud storage via Firebase Firestore with zero-config local fallback.
"""

import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

# Optional Firebase Admin SDK
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

DB_DIR = Path(__file__).parent
LOCAL_SQLITE_PATH = DB_DIR / "civicsense.db"
CREDENTIALS_PATH = DB_DIR / "firebase_credentials.json"

_firebase_app = None
_firestore_client = None


def is_firebase_configured() -> bool:
    """Check if Firebase is initialized or credentials exist."""
    global _firestore_client
    if _firestore_client is not None:
        return True
    
    # Check credentials file or environment variable
    cred_file = os.environ.get("FIREBASE_CREDENTIALS_PATH", str(CREDENTIALS_PATH))
    if os.path.exists(cred_file):
        return True
    
    if os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON"):
        return True
        
    return False


def get_firestore_client():
    """Returns Firestore client if configured, else None."""
    global _firebase_app, _firestore_client
    if not FIREBASE_AVAILABLE:
        return None
    
    if _firestore_client is not None:
        return _firestore_client

    try:
        cred_file = os.environ.get("FIREBASE_CREDENTIALS_PATH", str(CREDENTIALS_PATH))
        env_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")

        if os.path.exists(cred_file):
            cred = credentials.Certificate(cred_file)
        elif env_json:
            cred_dict = json.loads(env_json)
            cred = credentials.Certificate(cred_dict)
        else:
            return None

        if not firebase_admin._apps:
            _firebase_app = firebase_admin.initialize_app(cred)
        else:
            _firebase_app = firebase_admin.get_app()

        _firestore_client = firestore.client()
        print("[Firebase] Connected to Firestore successfully.")
        return _firestore_client
    except Exception as e:
        print(f"[Firebase] Initialization warning: {e}")
        return None


# Default official GWMC officers directory
DEFAULT_OFFICERS = [
    {
        "id": "OFF-GWMC-01",
        "name": "K. Sunitha",
        "department": "GWMC Solid Waste & Sanitation Wing",
        "designation": "Sanitation Inspector",
        "ward": "Ward 12 (Hanamkonda Central)",
        "phone": "+91 94401 23001",
        "email": "sunitha.sanitation@gwmc.gov.in",
        "active_tickets": 0,
        "status": "available"
    },
    {
        "id": "OFF-GWMC-02",
        "name": "Er. Srikanth Rao",
        "department": "GWMC Engineering & Town Planning Department",
        "designation": "Assistant Executive Engineer (Roads)",
        "ward": "Ward 24 (Kazipet Junction)",
        "phone": "+91 94401 23002",
        "email": "srikanth.roads@gwmc.gov.in",
        "active_tickets": 0,
        "status": "available"
    },
    {
        "id": "OFF-GWMC-03",
        "name": "Er. M. Ramesh",
        "department": "GWMC Mission Bhagiratha Water Works Division",
        "designation": "Junior Engineer (Water Supply)",
        "ward": "Ward 08 (MGM / Station Road)",
        "phone": "+91 94401 23003",
        "email": "ramesh.water@gwmc.gov.in",
        "active_tickets": 0,
        "status": "available"
    },
    {
        "id": "OFF-GWMC-04",
        "name": "T. Venkatesh",
        "department": "GWMC Electrical & Street Lighting Wing",
        "designation": "Assistant Engineer (Electrical)",
        "ward": "Ward 15 (Kakatiya / Subedari)",
        "phone": "+91 94401 23004",
        "email": "venkatesh.electrical@gwmc.gov.in",
        "active_tickets": 0,
        "status": "available"
    },
    {
        "id": "OFF-GWMC-05",
        "name": "V. Ravinder",
        "department": "GWMC Stormwater & Nala Maintenance Wing",
        "designation": "Superintendent Engineer (Drainage)",
        "ward": "Ward 31 (Bhadrakali / Balasamudram)",
        "phone": "+91 94401 23005",
        "email": "ravinder.nala@gwmc.gov.in",
        "active_tickets": 0,
        "status": "available"
    },
    {
        "id": "OFF-GWMC-06",
        "name": "Dr. P. Swathi",
        "department": "Telangana State Pollution Control Board (TSPCB)",
        "designation": "Environmental Scientist",
        "ward": "Warangal Regional Zone",
        "phone": "+91 94401 23006",
        "email": "swathi.tspcb@telangana.gov.in",
        "active_tickets": 0,
        "status": "available"
    }
]
