"""
CivicSense AI — Computer Vision Module
Uses OpenAI CLIP for zero-shot civic image classification.

CLIP can classify images into predefined categories without
any custom training data — ideal for a prototype.

Honest limitation: CLIP is not perfect for all civic categories.
Confidence scores are always shown. Low-confidence results are flagged
for human verification.
"""

import io
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

from PIL import Image

# CLIP import with graceful fallback
try:
    import clip
    import torch
    CLIP_AVAILABLE = True
except ImportError:
    CLIP_AVAILABLE = False

# ── Civic Issue Categories for CLIP ───────────────────────────────────────────
# These text prompts are what CLIP compares against the image.
CIVIC_PROMPTS = {
    "Garbage / Waste":              "a photo of garbage, trash, or waste accumulation on a street or public area",
    "Pothole / Road Damage":        "a photo of a pothole or road damage on a street",
    "Water Leakage / Sanitation":   "a photo of a water pipe leak, water leakage, or sewage overflow",
    "Broken Streetlight":           "a photo of a broken or non-functioning street light or lamp post",
    "Drainage / Flooding":          "a photo of flooded streets or blocked drainage causing waterlogging",
    "Pollution":                    "a photo showing air pollution, smoke, or environmental contamination",
    "Fallen Tree / Vegetation":     "a photo of a fallen tree or large branches blocking a road or path",
    "Other Infrastructure":         "a photo of damaged or broken public infrastructure in a city",
}

# ── Confidence Thresholds ─────────────────────────────────────────────────────
HIGH_CONFIDENCE_THRESHOLD    = 0.70
MEDIUM_CONFIDENCE_THRESHOLD  = 0.40
LOW_CONFIDENCE_LABEL         = "⚠ Low confidence — human review recommended"


@dataclass
class VisionResult:
    label: str
    confidence: float
    top_3: list[dict]               # [{label, confidence}]
    confidence_tier: str            # HIGH / MEDIUM / LOW
    verification_required: bool
    note: str
    clip_available: bool


def _load_clip_model():
    """Load CLIP model (cached after first load)."""
    if not CLIP_AVAILABLE:
        return None, None, None
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    return model, preprocess, device


_clip_model = None
_clip_preprocess = None
_clip_device = None
_clip_loaded = False


def _ensure_clip_loaded():
    global _clip_model, _clip_preprocess, _clip_device, _clip_loaded
    if not _clip_loaded:
        _clip_model, _clip_preprocess, _clip_device = _load_clip_model()
        _clip_loaded = True


def classify_image(image_input) -> VisionResult:
    """
    Classify a civic image using CLIP zero-shot classification.
    
    Args:
        image_input: PIL Image, file path (str/Path), or bytes
    
    Returns:
        VisionResult with label, confidence, and explanation
    """
    _ensure_clip_loaded()

    # Load image
    try:
        if isinstance(image_input, (str, Path)):
            image = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, Image.Image):
            image = image_input.convert("RGB")
        else:
            return _unavailable_result("Unsupported image format")
    except Exception as e:
        return _unavailable_result(f"Could not load image: {e}")

    if not CLIP_AVAILABLE or _clip_model is None:
        return _unavailable_result("CLIP library not installed — install: pip install git+https://github.com/openai/CLIP.git")

    try:
        import torch
        categories = list(CIVIC_PROMPTS.keys())
        prompts    = list(CIVIC_PROMPTS.values())

        # Encode image
        image_input_tensor = _clip_preprocess(image).unsqueeze(0).to(_clip_device)
        text_tokens = clip.tokenize(prompts).to(_clip_device)

        with torch.no_grad():
            image_features = _clip_model.encode_image(image_input_tensor)
            text_features  = _clip_model.encode_text(text_tokens)
            logits, _      = _clip_model(image_input_tensor, text_tokens)
            probs          = logits.softmax(dim=-1).cpu().numpy()[0]

        # Sort by probability
        sorted_idx = probs.argsort()[::-1]
        top_label      = categories[sorted_idx[0]]
        top_confidence = float(probs[sorted_idx[0]])
        top_3 = [
            {"label": categories[i], "confidence": round(float(probs[i]), 3)}
            for i in sorted_idx[:3]
        ]

        # Confidence tier
        if top_confidence >= HIGH_CONFIDENCE_THRESHOLD:
            tier = "HIGH"
            verify = False
            note = f"CLIP identified this as '{top_label}' with high confidence."
        elif top_confidence >= MEDIUM_CONFIDENCE_THRESHOLD:
            tier = "MEDIUM"
            verify = True
            note = f"CLIP suggests '{top_label}' with moderate confidence. Human review recommended."
        else:
            tier = "LOW"
            verify = True
            note = LOW_CONFIDENCE_LABEL + f" CLIP best guess: '{top_label}'."

        return VisionResult(
            label=top_label,
            confidence=round(top_confidence, 3),
            top_3=top_3,
            confidence_tier=tier,
            verification_required=verify,
            note=note,
            clip_available=True,
        )

    except Exception as e:
        return _unavailable_result(f"CLIP inference error: {e}")


def _unavailable_result(reason: str) -> VisionResult:
    """Return a result when CLIP is unavailable or fails."""
    return VisionResult(
        label="Unable to classify",
        confidence=0.0,
        top_3=[],
        confidence_tier="LOW",
        verification_required=True,
        note=reason,
        clip_available=False,
    )


def get_confidence_color(confidence: float) -> str:
    """Return a hex color for a confidence score (for UI)."""
    if confidence >= HIGH_CONFIDENCE_THRESHOLD:
        return "#28a745"   # Green
    if confidence >= MEDIUM_CONFIDENCE_THRESHOLD:
        return "#ffc107"   # Amber
    return "#dc3545"       # Red
