"""
CivicSense AI — SDG Mapper
Maps issue categories to UN Sustainable Development Goals.
Primary focus: SDG 11 (Sustainable Cities and Communities)
"""

from dataclasses import dataclass

# ── Issue Categories ───────────────────────────────────────────────────────────
ISSUE_CATEGORIES = [
    "Garbage / Waste",
    "Pothole / Road Damage",
    "Water Leakage / Sanitation",
    "Broken Streetlight",
    "Drainage / Flooding",
    "Pollution",
    "Fallen Tree / Vegetation",
    "Other Infrastructure",
]

# ── SDG Definitions (relevant subset) ─────────────────────────────────────────
SDG_INFO = {
    "SDG 6":  {"title": "Clean Water and Sanitation",           "color": "#26BDE2"},
    "SDG 11": {"title": "Sustainable Cities and Communities",   "color": "#FD9D24"},
    "SDG 12": {"title": "Responsible Consumption and Production","color": "#BF8B2E"},
    "SDG 13": {"title": "Climate Action",                       "color": "#3F7E44"},
    "SDG 15": {"title": "Life on Land",                         "color": "#56C02B"},
}

# ── Category → SDG Mapping ─────────────────────────────────────────────────────
# Primary SDG is always SDG 11 for civic infrastructure issues.
# Secondary SDGs are issue-specific and grounded in rationale.
CATEGORY_SDG_MAP = {
    "Garbage / Waste": {
        "primary":   "SDG 11",
        "secondary": ["SDG 12"],
        "rationale": (
            "Uncollected waste degrades urban living conditions (SDG 11 — target 11.6: "
            "reduce per-capita environmental impact of cities). It also reflects unsustainable "
            "consumption and production patterns (SDG 12 — target 12.5: substantially reduce waste generation)."
        ),
    },
    "Pothole / Road Damage": {
        "primary":   "SDG 11",
        "secondary": [],
        "rationale": (
            "Road damage directly undermines safe and inclusive transport infrastructure "
            "(SDG 11 — target 11.2: provide access to safe, affordable, and sustainable transport systems). "
            "No secondary SDG applies strongly to this category."
        ),
    },
    "Water Leakage / Sanitation": {
        "primary":   "SDG 11",
        "secondary": ["SDG 6"],
        "rationale": (
            "Water leakage impacts urban water distribution (SDG 11) and represents "
            "a direct challenge to universal clean water access (SDG 6 — target 6.1: "
            "achieve universal safe drinking water; target 6.4: substantially increase water-use efficiency)."
        ),
    },
    "Broken Streetlight": {
        "primary":   "SDG 11",
        "secondary": [],
        "rationale": (
            "Non-functional public lighting compromises safety and accessibility of urban public spaces "
            "(SDG 11 — target 11.7: provide universal access to safe, inclusive, accessible public spaces). "
            "No strong secondary SDG applies."
        ),
    },
    "Drainage / Flooding": {
        "primary":   "SDG 11",
        "secondary": ["SDG 13"],
        "rationale": (
            "Drainage failures increase flood risk in urban areas (SDG 11 — target 11.5: "
            "significantly reduce the number of deaths and people affected by disasters). "
            "Urban flooding is increasingly linked to climate change impacts (SDG 13 — target 13.1: "
            "strengthen resilience and adaptive capacity to climate hazards)."
        ),
    },
    "Pollution": {
        "primary":   "SDG 11",
        "secondary": ["SDG 13"],
        "rationale": (
            "Air and environmental pollution degrades urban quality of life and health "
            "(SDG 11 — target 11.6: reduce adverse per-capita environmental impact of cities). "
            "Pollution, particularly from waste burning, contributes to greenhouse emissions (SDG 13)."
        ),
    },
    "Fallen Tree / Vegetation": {
        "primary":   "SDG 11",
        "secondary": ["SDG 15"],
        "rationale": (
            "Fallen or damaged urban trees reduce the green canopy that supports urban livability "
            "(SDG 11 — target 11.7: provide access to safe green spaces). "
            "Urban tree loss also affects biodiversity and terrestrial ecosystems (SDG 15 — target 15.1: "
            "ensure conservation and sustainable use of terrestrial ecosystems)."
        ),
    },
    "Other Infrastructure": {
        "primary":   "SDG 11",
        "secondary": [],
        "rationale": (
            "General infrastructure issues affect the safety and sustainability of urban settlements "
            "(SDG 11 — target 11.1: ensure adequate, safe, and affordable housing and basic services)."
        ),
    },
}


@dataclass
class SDGResult:
    primary: str
    secondary: list[str]
    rationale: str
    primary_title: str
    secondary_titles: list[str]


def map_category_to_sdg(issue_category: str) -> SDGResult:
    """
    Map an issue category to its primary and secondary SDGs.
    Returns SDGResult with rationale.
    """
    mapping = CATEGORY_SDG_MAP.get(issue_category, CATEGORY_SDG_MAP["Other Infrastructure"])
    primary = mapping["primary"]
    secondary = mapping["secondary"]
    return SDGResult(
        primary=primary,
        secondary=secondary,
        rationale=mapping["rationale"],
        primary_title=SDG_INFO[primary]["title"],
        secondary_titles=[SDG_INFO[s]["title"] for s in secondary if s in SDG_INFO],
    )


def get_sdg_color(sdg_code: str) -> str:
    """Return the official SDG color for a given SDG code."""
    return SDG_INFO.get(sdg_code, {}).get("color", "#888888")


def get_all_sdg_info() -> dict:
    """Return all SDG info."""
    return SDG_INFO


def get_all_categories() -> list[str]:
    """Return the list of issue categories."""
    return ISSUE_CATEGORIES
