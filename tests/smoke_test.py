import sys
sys.path.insert(0, 'c:/PROJECTS/Sustainability/civicsense-ai')
print("=== Testing Core Modules ===")

# 1. Database
from database.db import init_db, insert_complaint, get_complaint, insert_analysis, get_analysis
init_db()
cid = insert_complaint(
    text="Garbage accumulating near main gate for three days. Huge pile and foul smell.",
    location_text="Near Main Gate, Sector 12",
    latitude=19.0760,
    longitude=72.8777,
)
print(f"[OK] DB: complaint inserted: {cid[:8]}...")

# 2. Entity Extraction
from core.nlp.entity_extractor import extract_entities
ents = extract_entities("Garbage accumulating near main gate for three days. Huge pile and foul smell.")
print(f"[OK] Entity extractor: duration={ents.duration_days} days, locations={ents.location_mentions[:2]}")

# 3. NLP Classifier
from core.nlp.classifier import classify_complaint
result = classify_complaint("Garbage accumulating near main gate for three days")
print(f"[OK] Classifier: {result['category']} ({result['confidence']:.0%}) [{result.get('source','model')}]")

# 4. Severity Engine
from core.severity.scoring_engine import compute_severity
sev = compute_severity(
    issue_category="Garbage / Waste",
    duration_days=3.0,
    affected_desc="residents",
    location_text="Near Main Gate",
    has_image=True,
    text_length=80,
    image_confidence=0.82,
    similar_complaint_count=2,
)
print(f"[OK] Severity: {sev.level} (score={sev.score}/100, confidence={sev.ai_confidence:.0%})")

# 5. SDG Mapper
from core.sdg.sdg_mapper import map_category_to_sdg
sdg = map_category_to_sdg("Garbage / Waste")
print(f"[OK] SDG: primary={sdg.primary}, secondary={sdg.secondary}")

# 6. Recommendation Engine
from core.recommendations.recommendation_engine import build_recommendation
rec = build_recommendation("Garbage / Waste", "HIGH")
print(f"[OK] Recommendation: {rec['department'][:40]}...")

# 7. Save and retrieve analysis
insert_analysis(cid, {
    "issue_category": result["category"],
    "extracted_entities": {"duration_days": 3, "location_mentions": ["main gate"]},
    "severity_score": sev.score,
    "severity_level": sev.level,
    "severity_factors": sev.factors,
    "severity_explanation": sev.explanation,
    "ai_confidence": sev.ai_confidence,
    "sdg_primary": sdg.primary,
    "sdg_secondary": sdg.secondary,
    "sdg_rationale": sdg.rationale,
    "department": rec["department"],
    "action_recommendation": rec["action"],
})
analysis = get_analysis(cid)
print(f"[OK] Analysis persisted: severity={analysis['severity_level']}, sdg={analysis['sdg_primary']}")

print("")
print("=== ALL CORE MODULES PASSED ===")
