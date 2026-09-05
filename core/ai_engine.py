"""
CivicSense AI - Main AI Engine
Orchestrates the full analysis pipeline for a complaint.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.nlp.classifier import classify_complaint
from core.nlp.entity_extractor import extract_entities, entities_to_dict
from core.severity.scoring_engine import compute_severity
from core.sdg.sdg_mapper import map_category_to_sdg
from core.recommendations.recommendation_engine import build_recommendation
from database import db


def analyze_complaint(
    complaint_id: str,
    text: str,
    image_path=None,
    location_text=None,
    latitude=None,
    longitude=None,
) -> dict:
    """
    Full AI pipeline for a civic complaint.
    Returns a complete analysis dict and persists it to the database.
    """
    # Step 1: NLP Classification
    clf_result = classify_complaint(text)
    issue_category = clf_result["category"]
    nlp_confidence = clf_result["confidence"]

    # Step 2: Entity Extraction
    entities = extract_entities(text)
    entities_dict = entities_to_dict(entities)

    # Step 3: Computer Vision (if image provided)
    image_label = None
    image_confidence = None
    if image_path:
        try:
            from core.vision.clip_classifier import classify_image
            vision_result = classify_image(image_path)
            image_label = vision_result.label
            image_confidence = vision_result.confidence
            # If CV agrees with NLP with high confidence, boost category confidence
            if vision_result.label == issue_category and vision_result.confidence >= 0.70:
                nlp_confidence = min(nlp_confidence + 0.10, 1.0)
        except Exception:
            pass

    # Step 4: Duplicate / Similarity Check
    existing = db.get_all_complaints()
    similar_count = 0
    try:
        from core.deduplication.duplicate_detector import find_similar_complaints
        similars = find_similar_complaints(text, latitude, longitude, existing, issue_category)
        similar_count = len(similars)
    except Exception:
        similars = []

    # Step 5: Severity Scoring
    severity_result = compute_severity(
        issue_category=issue_category,
        duration_days=entities.duration_days,
        affected_desc=entities.affected_desc,
        location_text=location_text,
        has_image=image_path is not None,
        text_length=len(text),
        image_confidence=image_confidence,
        similar_complaint_count=similar_count,
    )

    # Step 6: SDG Mapping
    sdg_result = map_category_to_sdg(issue_category)

    # Step 7: Recommendations
    rec = build_recommendation(issue_category, severity_result.level)

    # Assemble result
    analysis = {
        "complaint_id":         complaint_id,
        "issue_category":       issue_category,
        "nlp_confidence":       nlp_confidence,
        "nlp_top3":             clf_result.get("top_3", []),
        "extracted_entities":   entities_dict,
        "severity_score":       severity_result.score,
        "severity_level":       severity_result.level,
        "severity_factors":     severity_result.factors,
        "severity_explanation": severity_result.explanation,
        "image_label":          image_label,
        "image_confidence":     image_confidence,
        "ai_confidence":        severity_result.ai_confidence,
        "sdg_primary":          sdg_result.primary,
        "sdg_secondary":        sdg_result.secondary,
        "sdg_rationale":        sdg_result.rationale,
        "department":           rec.get("department", rec.get("department", "")),
        "action_recommendation":rec.get("action_recommendation", rec.get("action", "")),
        "escalation_hint":      rec.get("escalation_contact", rec.get("escalation_hint", "")),
        "similar_count":        similar_count,
        "similar_complaints":   [
            {"id": s.complaint_id, "ticket": s.ticket_id, "score": s.similarity_score, "text": s.text[:100]}
            for s in similars
        ],
    }

    # Persist to database
    db.insert_analysis(complaint_id, analysis)

    return analysis
