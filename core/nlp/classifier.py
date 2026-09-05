"""
CivicSense AI — NLP Classifier
Trains and uses a TF-IDF + Logistic Regression classifier
for civic complaint categorisation.

Supports:
  - Training from a labeled CSV
  - Saving/loading the trained model
  - Predicting issue category + confidence
"""

import os
import pickle
import warnings
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────────
MODELS_DIR = Path(__file__).parent.parent.parent / "models"
CLASSIFIER_PATH = MODELS_DIR / "nlp_classifier.pkl"
VECTORIZER_PATH = MODELS_DIR / "tfidf_vectorizer.pkl"
LABEL_ENC_PATH  = MODELS_DIR / "label_encoder.pkl"

MODELS_DIR.mkdir(exist_ok=True)

# ── Category mapping: NYC 311 → CivicSense categories ─────────────────────────
NYC311_CATEGORY_MAP = {
    # Garbage / Waste
    "ILLEGAL DUMPING":              "Garbage / Waste",
    "DIRTY CONDITIONS":             "Garbage / Waste",
    "UNSANITARY CONDITION":         "Garbage / Waste",
    "MISSED COLLECTION (TRASH)":    "Garbage / Waste",
    "DERELICT VEHICLES":            "Garbage / Waste",
    "OVERFLOWING LITTER BASKETS":   "Garbage / Waste",
    "ABANDONED BICYCLE":            "Garbage / Waste",
    # Pothole / Road Damage
    "POTHOLE":                      "Pothole / Road Damage",
    "STREET CONDITION":             "Pothole / Road Damage",
    "BROKEN PAVEMENT":              "Pothole / Road Damage",
    "SIDEWALK CONDITION":           "Pothole / Road Damage",
    # Water Leakage / Sanitation
    "WATER SYSTEM":                 "Water Leakage / Sanitation",
    "SEWER":                        "Water Leakage / Sanitation",
    "BROKEN HYDRANT":               "Water Leakage / Sanitation",
    "WATER MAIN":                   "Water Leakage / Sanitation",
    "DEP STREET FLOODING":          "Drainage / Flooding",
    # Broken Streetlight
    "STREET LIGHT CONDITION":       "Broken Streetlight",
    "TRAFFIC SIGNAL CONDITION":     "Broken Streetlight",
    # Drainage / Flooding
    "CATCH BASIN":                  "Drainage / Flooding",
    "FLOODING":                     "Drainage / Flooding",
    "STORM":                        "Drainage / Flooding",
    # Pollution
    "AIR QUALITY":                  "Pollution",
    "NOISE":                        "Pollution",
    "SMOKING":                      "Pollution",
    "ODOR COMPLAINT":               "Pollution",
    # Fallen Tree
    "OVERGROWN TREE/BRANCHES":      "Fallen Tree / Vegetation",
    "FALLEN TREE":                  "Fallen Tree / Vegetation",
    "TREE & LIMB":                  "Fallen Tree / Vegetation",
    "DAMAGED TREE":                 "Fallen Tree / Vegetation",
    # Other Infrastructure
    "BUILDING/USE":                 "Other Infrastructure",
    "CONSTRUCTION":                 "Other Infrastructure",
    "HIGHWAY CONDITION":            "Other Infrastructure",
    "INFRASTRUCTURE":               "Other Infrastructure",
    "OTHER":                        "Other Infrastructure",
}

CIVICSENSE_CATEGORIES = list(set(NYC311_CATEGORY_MAP.values()))


class CivicSenseClassifier:
    """
    TF-IDF + Logistic Regression classifier for civic complaint classification.
    """

    def __init__(self):
        self.pipeline: Optional[Pipeline] = None
        self.label_encoder: Optional[LabelEncoder] = None
        self.is_trained: bool = False
        self._load_if_exists()

    def _load_if_exists(self):
        """Load saved model from disk if available."""
        if CLASSIFIER_PATH.exists() and LABEL_ENC_PATH.exists():
            try:
                with open(CLASSIFIER_PATH, "rb") as f:
                    self.pipeline = pickle.load(f)
                with open(LABEL_ENC_PATH, "rb") as f:
                    self.label_encoder = pickle.load(f)
                self.is_trained = True
            except Exception:
                self.is_trained = False

    def save(self):
        """Save the trained model to disk."""
        if self.pipeline:
            with open(CLASSIFIER_PATH, "wb") as f:
                pickle.dump(self.pipeline, f)
        if self.label_encoder:
            with open(LABEL_ENC_PATH, "wb") as f:
                pickle.dump(self.label_encoder, f)

    def train(self, df: pd.DataFrame, text_col: str = "text",
              label_col: str = "category", test_size: float = 0.2) -> dict:
        """
        Train the classifier on a labeled DataFrame.
        
        Args:
            df: DataFrame with text and label columns
            text_col: Column with complaint text
            label_col: Column with category labels
            test_size: Fraction for test split
        
        Returns:
            dict with training metrics
        """
        df = df[[text_col, label_col]].dropna()
        df[text_col] = df[text_col].astype(str).str.strip()
        df = df[df[text_col].str.len() > 5]

        X = df[text_col].values
        y = df[label_col].values

        self.label_encoder = LabelEncoder()
        y_enc = self.label_encoder.fit_transform(y)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y_enc, test_size=test_size, random_state=42, stratify=y_enc
        )

        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=50_000,
                sublinear_tf=True,
                min_df=2,
            )),
            ("clf", LogisticRegression(
                max_iter=1000,
                C=5.0,
                class_weight="balanced",
                solver="lbfgs",
                multi_class="auto",
            )),
        ])
        self.pipeline.fit(X_train, y_train)

        y_pred = self.pipeline.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        report = classification_report(
            y_test, y_pred,
            target_names=self.label_encoder.classes_,
            output_dict=True,
        )

        self.is_trained = True
        self.save()

        return {
            "accuracy": round(acc, 4),
            "classification_report": report,
            "train_size": len(X_train),
            "test_size":  len(X_test),
            "classes":    list(self.label_encoder.classes_),
        }

    def predict(self, text: str) -> dict:
        """
        Predict the issue category for a complaint text.
        
        Returns:
            dict with category, confidence, top_3 alternatives
        """
        if not self.is_trained or not self.pipeline:
            # Fallback: keyword-based rule classifier
            return self._keyword_fallback(text)

        proba = self.pipeline.predict_proba([text])[0]
        top_idx = np.argsort(proba)[::-1]
        classes = self.label_encoder.classes_

        return {
            "category":    classes[top_idx[0]],
            "confidence":  round(float(proba[top_idx[0]]), 3),
            "top_3": [
                {"category": classes[i], "confidence": round(float(proba[i]), 3)}
                for i in top_idx[:3]
            ],
        }

    def _keyword_fallback(self, text: str) -> dict:
        """Rule-based fallback when model is not trained yet."""
        text_lower = text.lower()
        rules = [
            (["garbage", "trash", "waste", "dump", "litter", "rubbish"], "Garbage / Waste"),
            (["pothole", "road damage", "broken road", "crack", "pavement"], "Pothole / Road Damage"),
            (["water leak", "pipe", "water main", "sewage", "sanitation"], "Water Leakage / Sanitation"),
            (["street light", "streetlight", "lamp post", "light out"], "Broken Streetlight"),
            (["flood", "drain", "waterlog", "overflow"], "Drainage / Flooding"),
            (["pollution", "air quality", "smoke", "smell", "odor"], "Pollution"),
            (["tree", "branch", "fallen tree", "vegetation"], "Fallen Tree / Vegetation"),
        ]
        for keywords, category in rules:
            if any(k in text_lower for k in keywords):
                return {
                    "category":   category,
                    "confidence": 0.65,
                    "top_3": [{"category": category, "confidence": 0.65}],
                    "source":     "keyword_fallback",
                }
        return {
            "category":   "Other Infrastructure",
            "confidence": 0.40,
            "top_3": [{"category": "Other Infrastructure", "confidence": 0.40}],
            "source":     "keyword_fallback",
        }


# ── Module-level singleton ─────────────────────────────────────────────────────
_classifier_instance: Optional[CivicSenseClassifier] = None


def get_classifier() -> CivicSenseClassifier:
    """Return (or create) the module-level classifier instance."""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = CivicSenseClassifier()
    return _classifier_instance


def classify_complaint(text: str) -> dict:
    """Convenience function to classify a complaint text."""
    return get_classifier().predict(text)


def map_nyc311_category(nyc_type: str) -> str:
    """Map a NYC 311 complaint type to a CivicSense category."""
    return NYC311_CATEGORY_MAP.get(nyc_type.upper(), "Other Infrastructure")
