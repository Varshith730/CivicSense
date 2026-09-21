import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from database import db
from core.ai_assistant.rag_engine import ingest_document, retrieve_relevant_chunks, generate_llm_response

print("=== 1. Checking Fresh Database ===")
db.init_db()
print("Complaints count:", db.get_total_count())
officers = db.get_all_officers()
print(f"Municipal Officers count: {len(officers)}")
assert len(officers) >= 6, "Expected at least 6 default GWMC officers"

print("\n=== 2. Testing Complaint Submission & Officer Assignment ===")
cid = db.insert_complaint(
    text="Mission Bhagiratha pipeline crack leaking drinking water on road near MGM Hospital",
    location_text="MGM Hospital Road, Warangal",
    latitude=17.9812,
    longitude=79.5982
)
comp = db.get_complaint(cid)
print("Inserted complaint Ticket ID:", comp["ticket_id"])
assert comp["status"] == "pending"

# Assign to first officer
first_officer = officers[0]
db.assign_complaint_officer(
    complaint_id=cid,
    officer_id=first_officer["id"],
    officer_name=first_officer["name"],
    notes="Urgent site inspection ordered"
)
updated = db.get_complaint(cid)
print("Updated complaint status:", updated["status"])
print("Assigned officer:", updated["assigned_officer_name"])
assert updated["status"] == "assigned"

print("\n=== 3. Testing RAG Document Ingestion & Retrieval ===")
sample_doc_path = ROOT_DIR / "uploads" / "sample_gwmc_water_guideline.txt"
sample_doc_path.parent.mkdir(exist_ok=True)
sample_doc_path.write_text(
    "GREATER WARANGAL MUNICIPAL CORPORATION (GWMC)\n"
    "Water Works Department - Mission Bhagiratha SOP 2026\n"
    "Drinking water pipeline leaks must be reported to the zonal Junior Engineer.\n"
    "Repair teams are mandated to arrive on-site within 2 hours of priority ticket assignment.\n"
    "Citizens can track repair progress via CivicSense portal using their GWMC ticket number.",
    encoding="utf-8"
)

info = ingest_document(sample_doc_path, title="GWMC Mission Bhagiratha Water Works SOP")
print("Ingested RAG document:", info["title"], "Chunks:", info["chunks_indexed"])

chunks = retrieve_relevant_chunks("What is the response time for water pipeline leaks in Warangal?")
print(f"Retrieved {len(chunks)} relevant chunks")
assert len(chunks) > 0, "Expected at least 1 relevant chunk"

print("\n=== 4. Testing Assistant Grounded Response ===")
res = generate_llm_response(
    prompt="What is the response time for pipeline leaks?",
    context_chunks=chunks,
    ticket_info=updated
)
print("Assistant response preview:")
print(res["answer"][:200] + "...")

print("\n=== ALL BACKEND FEATURES VERIFIED SUCCESSFULLY ===")
