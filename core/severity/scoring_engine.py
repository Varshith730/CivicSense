"""
CivicSense AI — Severity Scoring Engine
Transparent, factor-based severity scoring system.
Every score decision is explainable.
"""

from dataclasses import dataclass
from typing import Optional


# ── Scoring Factors and Maximum Points ────────────────────────────────────────
FACTOR_WEIGHTS = {
    "public_safety":        25,   # Does this pose an immediate danger to people?
    "environmental_impact": 20,   # Does this harm the local environment?
    "duration":             15,   # How long has this been reported / ongoing?
    "affected_people":      15,   # How many people are affected?
    "evidence_strength":    15,   # How strong is the evidence (image, text detail)?
    "similar_complaints":   10,   # How many similar nearby complaints exist?
}
# Total possible: 100 points

# ── Thresholds ─────────────────────────────────────────────────────────────────
SEVERITY_THRESHOLDS = {
    "CRITICAL": 75,
    "HIGH":     50,
    "MEDIUM":   25,
    "LOW":       0,
}

# ── Category Profiles (default factor scores before adjustment) ────────────────
# Scale 0.0–1.0 per factor (multiplied by max weight)
CATEGORY_PROFILES = {
    "Garbage / Waste": {
        "public_safety":        0.5,   # Health risk but not immediately life-threatening
        "environmental_impact": 0.9,   # High environmental degradation
    },
    "Pothole / Road Damage": {
        "public_safety":        0.8,   # Accidents, vehicle damage
        "environmental_impact": 0.2,
    },
    "Water Leakage / Sanitation": {
        "public_safety":        0.7,   # Contamination, slippery surfaces
        "environmental_impact": 0.7,   # Water waste, soil contamination
    },
    "Broken Streetlight": {
        "public_safety":        0.6,   # Nighttime safety
        "environmental_impact": 0.1,
    },
    "Drainage / Flooding": {
        "public_safety":        0.9,   # High — flooding is life-threatening
        "environmental_impact": 0.7,
    },
    "Pollution": {
        "public_safety":        0.7,
        "environmental_impact": 1.0,   # Maximum environmental impact
    },
    "Fallen Tree / Vegetation": {
        "public_safety":        0.8,   # Blocks road/path, risk of further fall
        "environmental_impact": 0.5,
    },
    "Other Infrastructure": {
        "public_safety":        0.4,
        "environmental_impact": 0.2,
    },
}


@dataclass
class SeverityResult:
    score: float                    # 0.0 – 100.0
    level: str                      # LOW | MEDIUM | HIGH | CRITICAL
    factors: dict[str, float]       # Factor name → actual points awarded
    factor_reasons: dict[str, str]  # Factor name → human-readable reason
    explanation: str                # Full natural language explanation
    ai_confidence: float            # 0.0 – 1.0


def score_duration(duration_days: Optional[float]) -> tuple[float, str]:
    """Score the duration factor (0–15 points)."""
    max_pts = FACTOR_WEIGHTS["duration"]
    if duration_days is None:
        return max_pts * 0.3, "Duration not specified — moderate baseline applied"
    if duration_days >= 7:
        return max_pts * 1.0, f"Issue ongoing for {duration_days:.0f}+ days — chronic problem"
    if duration_days >= 3:
        return max_pts * 0.7, f"Issue ongoing for {duration_days:.0f} days — persistent"
    if duration_days >= 1:
        return max_pts * 0.4, f"Issue reported within {duration_days:.0f} day(s) — recent"
    return max_pts * 0.2, "Issue appears very recent — minimal duration penalty"


def score_affected_people(affected_desc: Optional[str], location_text: Optional[str]) -> tuple[float, str]:
    """Heuristic score for affected population (0–15 points)."""
    max_pts = FACTOR_WEIGHTS["affected_people"]
    if not affected_desc and not location_text:
        return max_pts * 0.3, "Affected population unknown — moderate baseline applied"
    
    combined = ((affected_desc or "") + " " + (location_text or "")).lower()
    
    high_keywords = ["market", "school", "hospital", "station", "main", "highway",
                     "hundreds", "many", "everyone", "residents", "colony", "area"]
    medium_keywords = ["street", "road", "park", "lane", "block", "hostel", "campus"]
    
    if any(k in combined for k in high_keywords):
        return max_pts * 1.0, "Location suggests high-density area — many people affected"
    if any(k in combined for k in medium_keywords):
        return max_pts * 0.6, "Location suggests moderate population density"
    return max_pts * 0.3, "Appears to be a localised issue with limited direct impact"


def score_evidence(has_image: bool, text_length: int, image_confidence: Optional[float]) -> tuple[float, str]:
    """Score evidence strength (0–15 points)."""
    max_pts = FACTOR_WEIGHTS["evidence_strength"]
    score = 0.0
    reasons = []
    
    if has_image:
        if image_confidence and image_confidence >= 0.70:
            score += max_pts * 0.6
            reasons.append(f"Image uploaded with high confidence ({image_confidence:.0%})")
        elif image_confidence and image_confidence >= 0.40:
            score += max_pts * 0.4
            reasons.append(f"Image uploaded with moderate confidence ({image_confidence:.0%})")
        else:
            score += max_pts * 0.25
            reasons.append("Image uploaded but confidence is low — manual review recommended")
    
    if text_length >= 100:
        score += max_pts * 0.4
        reasons.append("Detailed complaint text provides strong context")
    elif text_length >= 40:
        score += max_pts * 0.2
        reasons.append("Complaint text provides moderate detail")
    else:
        reasons.append("Brief complaint text — limited evidence")
    
    score = min(score, max_pts)
    return score, "; ".join(reasons) if reasons else "Minimal evidence provided"


def score_similar_complaints(similar_count: int) -> tuple[float, str]:
    """Score based on number of similar nearby complaints (0–10 points)."""
    max_pts = FACTOR_WEIGHTS["similar_complaints"]
    if similar_count >= 5:
        return max_pts * 1.0, f"{similar_count} similar nearby complaints — confirmed hotspot"
    if similar_count >= 3:
        return max_pts * 0.7, f"{similar_count} similar nearby complaints — emerging pattern"
    if similar_count >= 1:
        return max_pts * 0.4, f"{similar_count} similar nearby complaint(s) — possible duplicate"
    return 0.0, "No similar nearby complaints found"


def compute_severity(
    issue_category: str,
    duration_days: Optional[float] = None,
    affected_desc: Optional[str] = None,
    location_text: Optional[str] = None,
    has_image: bool = False,
    text_length: int = 0,
    image_confidence: Optional[float] = None,
    similar_complaint_count: int = 0,
) -> SeverityResult:
    """
    Compute the severity score for a complaint.
    
    All factors are computed transparently and explained.
    Returns a SeverityResult with score, level, factors, and explanation.
    """
    profile = CATEGORY_PROFILES.get(issue_category, CATEGORY_PROFILES["Other Infrastructure"])
    factors = {}
    factor_reasons = {}

    # Factor 1: Public Safety
    safety_score = FACTOR_WEIGHTS["public_safety"] * profile.get("public_safety", 0.4)
    factors["public_safety"] = round(safety_score, 1)
    factor_reasons["public_safety"] = (
        f"{issue_category} has a {_level_label(profile.get('public_safety', 0.4))} "
        f"public safety impact profile"
    )

    # Factor 2: Environmental Impact
    env_score = FACTOR_WEIGHTS["environmental_impact"] * profile.get("environmental_impact", 0.2)
    factors["environmental_impact"] = round(env_score, 1)
    factor_reasons["environmental_impact"] = (
        f"{issue_category} has a {_level_label(profile.get('environmental_impact', 0.2))} "
        f"environmental impact profile"
    )

    # Factor 3: Duration
    dur_score, dur_reason = score_duration(duration_days)
    factors["duration"] = round(dur_score, 1)
    factor_reasons["duration"] = dur_reason

    # Factor 4: Affected People
    aff_score, aff_reason = score_affected_people(affected_desc, location_text)
    factors["affected_people"] = round(aff_score, 1)
    factor_reasons["affected_people"] = aff_reason

    # Factor 5: Evidence Strength
    ev_score, ev_reason = score_evidence(has_image, text_length, image_confidence)
    factors["evidence_strength"] = round(ev_score, 1)
    factor_reasons["evidence_strength"] = ev_reason

    # Factor 6: Similar Complaints
    sim_score, sim_reason = score_similar_complaints(similar_complaint_count)
    factors["similar_complaints"] = round(sim_score, 1)
    factor_reasons["similar_complaints"] = sim_reason

    # Total score
    total = sum(factors.values())
    total = min(total, 100.0)

    # Severity level
    level = "LOW"
    for lvl, threshold in SEVERITY_THRESHOLDS.items():
        if total >= threshold:
            level = lvl
            break

    # AI confidence: based on completeness of inputs
    confidence_components = [
        1.0 if issue_category != "Other Infrastructure" else 0.5,
        0.3 if has_image else 0.0,
        min(text_length / 200, 0.3),
        0.2 if duration_days is not None else 0.0,
        min(similar_complaint_count * 0.05, 0.2),
    ]
    ai_confidence = min(sum(confidence_components), 1.0)

    explanation = _build_explanation(level, total, factors, factor_reasons)

    return SeverityResult(
        score=round(total, 1),
        level=level,
        factors=factors,
        factor_reasons=factor_reasons,
        explanation=explanation,
        ai_confidence=round(ai_confidence, 2),
    )


def _level_label(score_fraction: float) -> str:
    if score_fraction >= 0.75:
        return "HIGH"
    if score_fraction >= 0.45:
        return "MODERATE"
    return "LOW"


def _build_explanation(level: str, total: float, factors: dict, reasons: dict) -> str:
    """Build a natural-language explanation of the severity decision."""
    level_descriptions = {
        "CRITICAL": "immediate action is required — this issue poses significant risk",
        "HIGH":     "this issue warrants urgent attention within 24–48 hours",
        "MEDIUM":   "this issue should be addressed within the next few days",
        "LOW":      "this issue can be scheduled for routine maintenance",
    }
    lines = [
        f"SEVERITY: {level} (Score: {total:.0f}/100)",
        f"This means {level_descriptions.get(level, '')}.",
        "",
        "FACTOR BREAKDOWN:",
    ]
    for factor, pts in factors.items():
        max_pts = FACTOR_WEIGHTS[factor]
        pct = int((pts / max_pts) * 100)
        display_name = factor.replace("_", " ").title()
        lines.append(f"  ✓ {display_name}: {pts:.0f}/{max_pts} pts ({pct}%) — {reasons[factor]}")
    return "\n".join(lines)
