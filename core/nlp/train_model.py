"""
Phase 4: Train NLP Classifier on real processed NYC 311 dataset
Computes Precision, Recall, F1, Accuracy, and saves the trained model artifacts.
"""
import sys
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

import pandas as pd
from core.nlp.classifier import CivicSenseClassifier, CLASSIFIER_PATH, LABEL_ENC_PATH

train_path = ROOT_DIR / "data" / "processed" / "complaints_train.csv"
test_path = ROOT_DIR / "data" / "processed" / "complaints_test.csv"

train_df = pd.read_csv(train_path)
test_df = pd.read_csv(test_path)

print(f"Training on {len(train_df)} samples...")
clf = CivicSenseClassifier()
metrics = clf.train(train_df, text_col="text", label_col="category", test_size=0.15)

print("\n" + "="*50)
print(f"Overall Validation Accuracy: {metrics['accuracy'] * 100:.2f}%")
print("="*50)

# Evaluate on held-out test set
X_test = test_df["text"].values
y_test = test_df["category"].values
y_test_enc = clf.label_encoder.transform(y_test)
y_pred = clf.pipeline.predict(X_test)

from sklearn.metrics import accuracy_score, classification_report
test_acc = accuracy_score(y_test_enc, y_pred)
print(f"\nHeld-Out Test Accuracy: {test_acc * 100:.2f}%\n")
print("Classification Report on 1,000 Real Test Cases:")
print(classification_report(y_test_enc, y_pred, target_names=clf.label_encoder.classes_))

clf.save()
print(f"Saved trained model to: {CLASSIFIER_PATH}")
print(f"Saved label encoder to: {LABEL_ENC_PATH}")

# Quick test predictions on real-world complaints:
print("\n--- Test Real Predictions ---")
samples = [
    "Garbage has been accumulating near the market entrance for 3 days and nobody has collected it.",
    "Huge pothole on the middle of the road causing traffic jams and vehicle damage.",
    "Water pipeline burst and leaking clean drinking water on the road since morning.",
    "Streetlights on 4th cross road are not working and it is pitch dark at night.",
    "Large tree branch fell on the electric wires during the storm.",
    "Heavy black smoke and toxic air pollution from factory nearby."
]
for s in samples:
    pred = clf.predict(s)
    print(f"Input:  \"{s[:60]}...\"")
    print(f"Result: {pred['category']} (Confidence: {pred['confidence']:.1%})\n")
