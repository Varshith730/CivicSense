"""
CivicSense AI - Database Seeder (GWMC Warangal Edition)
Seeds with realistic civic complaints mapped to real GWMC landmarks.
All data is SYNTHETIC for demonstration purposes.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import db
from core.ai_engine import analyze_complaint

DEMO_COMPLAINTS = [
    # GARBAGE cluster — Hanamkonda Market (hotspot zone 1)
    {
        "text": "[SYNTHETIC] Garbage has been accumulating near Hanamkonda Rythu Bazar for four days. Waste bins are overflowing and the foul smell is affecting the entire market. Stray dogs are scattering the trash across the road.",
        "location_text": "Hanamkonda Rythu Bazar, Hanamkonda",
        "latitude": 18.0003, "longitude": 79.5676,
    },
    {
        "text": "[SYNTHETIC] Huge pile of municipal solid waste has not been collected for a week near Nakkalagutta Junction. The garbage is blocking half the footpath and creating a breeding ground for mosquitoes.",
        "location_text": "Nakkalagutta Junction, Hanamkonda",
        "latitude": 18.0032, "longitude": 79.5715,
    },
    {
        "text": "[SYNTHETIC] Illegal dumping of construction debris and household garbage near Subedari crossroads. Residents are suffering. GWMC has not responded in 5 days.",
        "location_text": "Subedari Crossroads, Hanamkonda",
        "latitude": 17.9889, "longitude": 79.5741,
    },
    {
        "text": "[SYNTHETIC] Sanitation workers have skipped collection in our ward for 5 consecutive days. Garbage is piling up outside every house near Bhadrakali Temple.",
        "location_text": "Bhadrakali Temple Street, Hanamkonda",
        "latitude": 18.0010, "longitude": 79.5690,
    },
    # POTHOLE cluster — NIT Gate / KU Road (hotspot zone 2)
    {
        "text": "[SYNTHETIC] Large dangerous pothole on the main road near NIT Warangal Gate 2. Two motorcycles slipped yesterday evening. The pothole is almost a foot deep and unmarked.",
        "location_text": "Near NIT Warangal Gate 2, Kazipet Road",
        "latitude": 17.9850, "longitude": 79.5300,
    },
    {
        "text": "[SYNTHETIC] The road between Kakatiya University main gate and the hostel block has completely broken down after the last monsoon. Multiple potholes causing accidents daily.",
        "location_text": "KU Main Gate Road, Warangal",
        "latitude": 17.9735, "longitude": 79.5522,
    },
    {
        "text": "[SYNTHETIC] A 3-foot wide crater on Kazipet-Hanamkonda bypass road near the fuel station. Heavy vehicles swerving dangerously every hour.",
        "location_text": "Kazipet-Hanamkonda Bypass, near Fuel Station",
        "latitude": 17.9720, "longitude": 79.5410,
    },
    # WATER LEAKAGE — MGM Hospital area
    {
        "text": "[SYNTHETIC] Mission Bhagiratha drinking water pipeline has burst near MGM Hospital road junction. Clean water gushing onto road since yesterday. Massive wastage of potable water.",
        "location_text": "MGM Hospital Road, Warangal",
        "latitude": 17.9746, "longitude": 79.5941,
    },
    {
        "text": "[SYNTHETIC] Water supply pipe burst near Warangal Railway Station colony. Road flooded and railway underpass getting waterlogged.",
        "location_text": "Near Warangal Railway Station Colony",
        "latitude": 17.9644, "longitude": 79.5112,
    },
    # BROKEN STREETLIGHT — Fort Warangal
    {
        "text": "[SYNTHETIC] Street lights on Fort Road near the bus depot have been non-functional for 8 days. Road is completely dark at night. Incidents of theft and accidents are increasing.",
        "location_text": "Fort Road, near Bus Depot, Warangal",
        "latitude": 17.9693, "longitude": 79.5858,
    },
    # DRAINAGE / FLOODING — Kazipet
    {
        "text": "[SYNTHETIC] The nala near Kazipet Railway Junction is completely blocked with silt and plastic waste. Every monsoon rain floods the entire colony with knee-deep water. This has been happening for 3 years.",
        "location_text": "Near Kazipet Railway Junction Nala",
        "latitude": 17.9660, "longitude": 79.5125,
    },
    # POLLUTION — Industrial belt
    {
        "text": "[SYNTHETIC] A granite cutting unit near Elkathurthi is releasing thick dust and noise pollution every morning. Residents of nearby colony are developing respiratory problems. TSPCB should inspect immediately.",
        "location_text": "Elkathurthi Industrial Area, Warangal",
        "latitude": 17.9580, "longitude": 79.6100,
    },
    # FALLEN TREE — Balasamudram
    {
        "text": "[SYNTHETIC] Large old tree has fallen across road near Balasamudram Lake due to yesterdays storm. Completely blocking traffic to Engineering College. Branches resting on electricity wires.",
        "location_text": "Balasamudram Lake Road, Warangal",
        "latitude": 18.0080, "longitude": 79.5770,
    },
]


def seed():
    print("Initialising GWMC CivicSense AI Database...")
    db.init_db()

    print(f"\nSeeding {len(DEMO_COMPLAINTS)} GWMC Warangal synthetic demo complaints...")
    for i, c in enumerate(DEMO_COMPLAINTS, 1):
        cid = db.insert_complaint(
            text=c["text"],
            location_text=c.get("location_text"),
            latitude=c.get("latitude"),
            longitude=c.get("longitude"),
        )
        analyze_complaint(
            complaint_id=cid,
            text=c["text"],
            location_text=c.get("location_text"),
            latitude=c.get("latitude"),
            longitude=c.get("longitude"),
        )
        print(f"  [{i}/{len(DEMO_COMPLAINTS)}] {c['location_text']}")

    print(f"\nTotal GWMC complaints: {db.get_total_count()}")
    print("GWMC seeding complete.")


if __name__ == "__main__":
    seed()
