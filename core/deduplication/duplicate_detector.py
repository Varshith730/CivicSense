"""
CivicSense AI - Duplicate / Similarity Detection
Uses sentence-transformers + cosine similarity to find duplicate complaints.
Geo proximity filtering ensures we only cluster complaints in the same area.
"""

import numpy as np
from typing import Optional
from dataclasses import dataclass
from sklearn.metrics.pairwise import cosine_similarity

try:
    from sentence_transformers import SentenceTransformer
    SBERT_AVAILABLE = True
except ImportError:
    SBERT_AVAILABLE = False

from sklearn.feature_extraction.text import TfidfVectorizer

# Similarity threshold above which complaints are considered potential duplicates
SIMILARITY_THRESHOLD = 0.72

# Max distance (km) for two complaints to be considered geographically co-located
GEO_RADIUS_KM = 1.0

_sbert_model = None
_sbert_loaded = False

def _get_sbert():
    global _sbert_model, _sbert_loaded
    if not _sbert_loaded:
        if SBERT_AVAILABLE:
            try:
                _sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                _sbert_model = None
        _sbert_loaded = True
    return _sbert_model


def _tfidf_similarity(texts):
    """Fallback: TF-IDF cosine similarity matrix."""
    if len(texts) < 2:
        return np.ones((len(texts), len(texts)))
    vec = TfidfVectorizer(ngram_range=(1,2), max_features=5000)
    try:
        matrix = vec.fit_transform(texts)
        return cosine_similarity(matrix)
    except Exception:
        return np.zeros((len(texts), len(texts)))


def embed_texts(texts):
    """Embed texts using SBERT or fall back to TF-IDF."""
    model = _get_sbert()
    if model is not None:
        try:
            return model.encode(texts, show_progress_bar=False)
        except Exception:
            pass
    # TF-IDF fallback: return the similarity matrix directly
    return None


def haversine_km(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two lat/lon points."""
    if None in (lat1, lon1, lat2, lon2):
        return float("inf")
    R = 6371.0
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
    return R * 2 * np.arcsin(np.sqrt(a))


@dataclass
class SimilarComplaint:
    complaint_id: str
    ticket_id: str
    text: str
    similarity_score: float
    location_text: Optional[str]
    category: Optional[str]


def find_similar_complaints(
    new_text: str,
    new_lat: Optional[float],
    new_lon: Optional[float],
    existing_complaints: list[dict],
    category: Optional[str] = None,
) -> list[SimilarComplaint]:
    """
    Find complaints similar to the new one from the existing database.

    Args:
        new_text: Text of the new complaint
        new_lat/lon: Coordinates of new complaint
        existing_complaints: List of dicts from database (must have id, text, latitude, longitude)
        category: If provided, filter to same-category complaints only

    Returns:
        List of SimilarComplaint sorted by descending similarity
    """
    if not existing_complaints:
        return []

    # Filter by category if provided
    candidates = existing_complaints
    if category:
        candidates = [c for c in existing_complaints if c.get("issue_category") == category]
    if not candidates:
        candidates = existing_complaints  # fallback to all

    # Filter by geo proximity
    geo_candidates = []
    for c in candidates:
        dist = haversine_km(new_lat, new_lon, c.get("latitude"), c.get("longitude"))
        if dist <= GEO_RADIUS_KM or dist == float("inf"):  # include if no geo info
            geo_candidates.append(c)

    if not geo_candidates:
        return []

    candidate_texts = [c.get("text", "") for c in geo_candidates]
    all_texts = [new_text] + candidate_texts

    # Try SBERT
    model = _get_sbert()
    if model is not None:
        try:
            embeddings = model.encode(all_texts, show_progress_bar=False)
            sim_matrix = cosine_similarity(embeddings)
            similarities = sim_matrix[0, 1:]
        except Exception:
            similarities = _tfidf_similarity(all_texts)[0, 1:]
    else:
        similarities = _tfidf_similarity(all_texts)[0, 1:]

    results = []
    for i, c in enumerate(geo_candidates):
        score = float(similarities[i])
        if score >= SIMILARITY_THRESHOLD:
            results.append(SimilarComplaint(
                complaint_id=c.get("id", ""),
                ticket_id=c.get("ticket_id", ""),
                text=c.get("text", ""),
                similarity_score=round(score, 3),
                location_text=c.get("location_text"),
                category=c.get("issue_category"),
            ))

    results.sort(key=lambda x: x.similarity_score, reverse=True)
    return results
