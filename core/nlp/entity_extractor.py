"""
CivicSense AI — NLP Entity Extractor
Uses spaCy with rule-based patterns to extract:
  - Duration (how long the issue has been present)
  - Location mentions
  - Affected population indicators
"""

import re
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ExtractedEntities:
    duration_text: Optional[str] = None     # e.g. "three days", "a week"
    duration_days: Optional[float] = None   # Numeric days
    location_mentions: list[str] = field(default_factory=list)
    affected_desc: Optional[str] = None     # e.g. "residents", "students"
    raw_text_length: int = 0


# ── Duration Patterns ─────────────────────────────────────────────────────────
DURATION_PATTERNS = [
    # "for X days/weeks/months"
    (r'for\s+(\d+)\s+day', 1.0, "days"),
    (r'for\s+(\d+)\s+week', 7.0, "weeks"),
    (r'for\s+(\d+)\s+month', 30.0, "months"),
    (r'for\s+(\d+)\s+hour', 1/24, "hours"),
    # "past X days"
    (r'past\s+(\d+)\s+day', 1.0, "days"),
    (r'past\s+(\d+)\s+week', 7.0, "weeks"),
    (r'last\s+(\d+)\s+day', 1.0, "days"),
    (r'last\s+(\d+)\s+week', 7.0, "weeks"),
    # Written numbers
    (r'for\s+(one|a)\s+day', None, "one_day"),
    (r'for\s+(two)\s+day', None, "two_days"),
    (r'for\s+(three)\s+day', None, "three_days"),
    (r'for\s+(a|one)\s+week', None, "one_week"),
    (r'since\s+(yesterday|last\s+night)', None, "yesterday"),
    (r'since\s+(morning|this\s+morning)', None, "same_day"),
]

WORD_TO_DAYS = {
    "one_day":   1.0,
    "two_days":  2.0,
    "three_days": 3.0,
    "one_week":  7.0,
    "yesterday": 1.0,
    "same_day":  0.5,
}

# ── Location Keywords ─────────────────────────────────────────────────────────
LOCATION_KEYWORDS = [
    r'\b(?:near|outside|in\s+front\s+of|behind|beside|next\s+to|at|in)\b\s+[\w\s]{2,30}',
    r'\b(?:main\s+gate|hostel|campus|street|road|lane|block|colony|market|park|station|hospital|school|temple|mosque|church)\b[\w\s]*',
    r'\bward\s+(?:no\.?\s*)?\d+\b',
    r'\bsector\s+\d+\b',
    r'\bplot\s+(?:no\.?\s*)?\d+\b',
]

# ── Affected Population Keywords ──────────────────────────────────────────────
AFFECTED_KEYWORDS = {
    "HIGH":   ["everyone", "all residents", "hundreds", "thousands", "whole area",
               "entire colony", "all students", "public", "commuters"],
    "MEDIUM": ["residents", "students", "neighbors", "workers", "families",
               "people nearby", "locals", "shopkeepers"],
    "LOW":    ["few", "some", "couple", "nearby house", "our house", "my house"],
}


def extract_duration(text: str) -> tuple[Optional[str], Optional[float]]:
    """Extract duration mention from text. Returns (raw_text, days_float)."""
    text_lower = text.lower()
    for pattern, multiplier, label in DURATION_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            raw = match.group(0)
            if multiplier is None:
                # Word-based
                days = WORD_TO_DAYS.get(label, 1.0)
            else:
                try:
                    qty = float(match.group(1))
                    days = qty * multiplier
                except (IndexError, ValueError):
                    days = multiplier
            return raw, round(days, 2)
    return None, None


def extract_locations(text: str) -> list[str]:
    """Extract location mentions from text."""
    found = []
    for pattern in LOCATION_KEYWORDS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        found.extend(m.strip() for m in matches if len(m.strip()) > 3)
    # Deduplicate (case-insensitive)
    seen = set()
    result = []
    for loc in found:
        if loc.lower() not in seen:
            seen.add(loc.lower())
            result.append(loc)
    return result[:5]  # Limit to top 5


def extract_affected(text: str) -> Optional[str]:
    """Extract affected population description."""
    text_lower = text.lower()
    for level in ["HIGH", "MEDIUM", "LOW"]:
        for keyword in AFFECTED_KEYWORDS[level]:
            if keyword in text_lower:
                return keyword
    return None


def extract_entities(text: str) -> ExtractedEntities:
    """
    Main entity extraction function.
    
    Args:
        text: Raw complaint text
    
    Returns:
        ExtractedEntities dataclass
    """
    duration_text, duration_days = extract_duration(text)
    locations = extract_locations(text)
    affected = extract_affected(text)
    
    return ExtractedEntities(
        duration_text=duration_text,
        duration_days=duration_days,
        location_mentions=locations,
        affected_desc=affected,
        raw_text_length=len(text),
    )


def entities_to_dict(entities: ExtractedEntities) -> dict:
    """Convert ExtractedEntities to a serializable dict."""
    return {
        "duration_text":      entities.duration_text,
        "duration_days":      entities.duration_days,
        "location_mentions":  entities.location_mentions,
        "affected_desc":      entities.affected_desc,
        "raw_text_length":    entities.raw_text_length,
    }
