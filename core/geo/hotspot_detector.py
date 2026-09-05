"""
CivicSense AI - Geo Analysis & Hotspot Detection
Uses DBSCAN clustering to find complaint hotspots.
Generates Folium maps.
"""

import numpy as np
from typing import Optional
from dataclasses import dataclass

try:
    import folium
    from folium.plugins import HeatMap, MarkerCluster
    FOLIUM_AVAILABLE = True
except ImportError:
    FOLIUM_AVAILABLE = False

try:
    from sklearn.cluster import DBSCAN
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# Severity colors for map markers
SEVERITY_COLORS = {
    "CRITICAL": "red",
    "HIGH":     "orange",
    "MEDIUM":   "blue",
    "LOW":      "green",
}

CATEGORY_ICONS = {
    "Garbage / Waste":            "trash",
    "Pothole / Road Damage":      "road",
    "Water Leakage / Sanitation": "tint",
    "Broken Streetlight":         "lightbulb-o",
    "Drainage / Flooding":        "umbrella",
    "Pollution":                  "exclamation-triangle",
    "Fallen Tree / Vegetation":   "tree",
    "Other Infrastructure":       "wrench",
}


@dataclass
class Hotspot:
    cluster_id: int
    center_lat: float
    center_lon: float
    complaint_count: int
    dominant_category: str
    dominant_severity: str
    complaint_ids: list[str]


def detect_hotspots(
    geo_complaints: list[dict],
    eps_km: float = 0.5,
    min_samples: int = 3,
) -> list[Hotspot]:
    """
    Detect geographic hotspots using DBSCAN clustering.

    Args:
        geo_complaints: List of complaints with latitude, longitude, id, issue_category, severity_level
        eps_km: Neighborhood radius in km (converted to radians for haversine)
        min_samples: Minimum complaints to form a cluster

    Returns:
        List of Hotspot objects, sorted by complaint count descending
    """
    if not SKLEARN_AVAILABLE or len(geo_complaints) < min_samples:
        return []

    valid = [c for c in geo_complaints if c.get("latitude") and c.get("longitude")]
    if len(valid) < min_samples:
        return []

    coords = np.array([[c["latitude"], c["longitude"]] for c in valid])
    eps_radians = eps_km / 6371.0

    db = DBSCAN(eps=eps_radians, min_samples=min_samples, algorithm="ball_tree", metric="haversine")
    labels = db.fit_predict(np.radians(coords))

    hotspots = []
    unique_labels = set(labels) - {-1}
    for cluster_id in unique_labels:
        mask = labels == cluster_id
        cluster_complaints = [valid[i] for i in range(len(valid)) if mask[i]]
        cluster_coords = coords[mask]
        center_lat = float(cluster_coords[:, 0].mean())
        center_lon = float(cluster_coords[:, 1].mean())

        # Dominant category
        cats = [c.get("issue_category", "Other Infrastructure") for c in cluster_complaints]
        dominant_cat = max(set(cats), key=cats.count)

        # Dominant severity
        sev_order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
        sevs = [c.get("severity_level", "LOW") for c in cluster_complaints]
        dominant_sev = max(sevs, key=lambda s: sev_order.get(s, 0))

        hotspots.append(Hotspot(
            cluster_id=int(cluster_id),
            center_lat=center_lat,
            center_lon=center_lon,
            complaint_count=len(cluster_complaints),
            dominant_category=dominant_cat,
            dominant_severity=dominant_sev,
            complaint_ids=[c.get("id", "") for c in cluster_complaints],
        ))

    hotspots.sort(key=lambda h: h.complaint_count, reverse=True)
    return hotspots


def build_hotspot_map(
    geo_complaints: list[dict],
    hotspots: Optional[list[Hotspot]] = None,
    center_lat: float = 20.5937,
    center_lon: float = 78.9629,
    zoom_start: int = 5,
) -> Optional[object]:
    """
    Build a Folium map with complaint markers and a heatmap layer.

    Returns a folium.Map object, or None if folium is not installed.
    """
    if not FOLIUM_AVAILABLE:
        return None

    m = folium.Map(location=[center_lat, center_lon], zoom_start=zoom_start, tiles="CartoDB positron")

    # Heatmap layer
    heat_data = [
        [c["latitude"], c["longitude"]]
        for c in geo_complaints
        if c.get("latitude") and c.get("longitude")
    ]
    if heat_data:
        HeatMap(heat_data, radius=20, blur=15, max_zoom=13).add_to(m)

    # Complaint markers
    marker_cluster = MarkerCluster(name="Complaints").add_to(m)
    for c in geo_complaints:
        if not (c.get("latitude") and c.get("longitude")):
            continue
        color = SEVERITY_COLORS.get(c.get("severity_level", "LOW"), "blue")
        icon_name = CATEGORY_ICONS.get(c.get("issue_category", ""), "info-sign")
        popup_text = f"""
        <b>{c.get("issue_category", "Unknown")}</b><br>
        Severity: <b>{c.get("severity_level", "—")}</b><br>
        Location: {c.get("location_text", "—")}
        """
        folium.Marker(
            location=[c["latitude"], c["longitude"]],
            popup=folium.Popup(popup_text, max_width=250),
            icon=folium.Icon(color=color, icon=icon_name, prefix="fa"),
        ).add_to(marker_cluster)

    # Hotspot circles
    if hotspots:
        for hs in hotspots:
            folium.Circle(
                location=[hs.center_lat, hs.center_lon],
                radius=500,
                color="red",
                fill=True,
                fill_opacity=0.15,
                popup=f"HOTSPOT: {hs.complaint_count} reports — {hs.dominant_category}",
            ).add_to(m)

    folium.LayerControl().add_to(m)
    return m
