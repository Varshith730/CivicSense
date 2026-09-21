"""
CivicSense AI - Unified Database Layer
Supports Firebase Firestore with seamless local SQLite fallback.
All operations start from scratch with zero demo complaints.
"""

import sqlite3
import json
import uuid
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

from database.firebase_db import (
    get_firestore_client,
    is_firebase_configured,
    DEFAULT_OFFICERS
)

DB_PATH = Path(__file__).parent / "civicsense.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(reset: bool = False):
    """Initializes tables and seeds default municipal officers if empty."""
    with get_connection() as conn:
        with open(SCHEMA_PATH, "r") as f:
            conn.executescript(f.read())
            
        if reset:
            conn.execute("DELETE FROM complaints")
            conn.execute("DELETE FROM analysis_results")
            conn.execute("DELETE FROM incidents")
            conn.execute("DELETE FROM complaint_incidents")
            conn.commit()

        # Seed default GWMC officers if none exist
        cursor = conn.execute("SELECT COUNT(*) as count FROM officers")
        if cursor.fetchone()["count"] == 0:
            for off in DEFAULT_OFFICERS:
                conn.execute(
                    """INSERT OR REPLACE INTO officers 
                       (id, name, department, designation, ward, phone, email, active_tickets, status)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (off["id"], off["name"], off["department"], off["designation"], 
                     off.get("ward", ""), off.get("phone", ""), off.get("email", ""), 
                     off.get("active_tickets", 0), off.get("status", "available"))
                )
            conn.commit()

    # If Firebase Firestore is active, seed officers collection if empty
    fs = get_firestore_client()
    if fs:
        try:
            docs = list(fs.collection("officers").limit(1).stream())
            if not docs:
                for off in DEFAULT_OFFICERS:
                    fs.collection("officers").document(off["id"]).set(off)
                print("[Firebase] Seeded default municipal officers.")
        except Exception as e:
            print(f"[Firebase] Officer init note: {e}")

    return True


def clear_all_complaints():
    """Wipes all complaints and analysis results for a completely clean start from scratch."""
    with get_connection() as conn:
        conn.execute("DELETE FROM complaints")
        conn.execute("DELETE FROM analysis_results")
        conn.execute("DELETE FROM incidents")
        conn.execute("DELETE FROM complaint_incidents")
        conn.commit()

    fs = get_firestore_client()
    if fs:
        try:
            for doc in fs.collection("complaints").stream():
                doc.reference.delete()
        except Exception as e:
            print(f"[Firebase] Clear complaints note: {e}")

    return True


def generate_ticket_id() -> str:
    date_str = datetime.now().strftime("%Y%m%d")
    suffix = str(uuid.uuid4())[:4].upper()
    return f"GWMC-{date_str}-{suffix}"


# ── Complaints CRUD ───────────────────────────────────────────────

def insert_complaint(text: str, image_path: Optional[str] = None, 
                     location_text: Optional[str] = None, 
                     latitude: Optional[float] = None, 
                     longitude: Optional[float] = None) -> str:
    complaint_id = str(uuid.uuid4())
    ticket_id = generate_ticket_id()
    now = datetime.now().isoformat()

    # Local SQLite
    with get_connection() as conn:
        conn.execute(
            """INSERT INTO complaints 
               (id, ticket_id, submitted_at, text, image_path, location_text, latitude, longitude, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')""",
            (complaint_id, ticket_id, now, text, image_path, location_text, latitude, longitude)
        )
        conn.commit()

    # Cloud Firebase Firestore
    fs = get_firestore_client()
    if fs:
        try:
            fs.collection("complaints").document(complaint_id).set({
                "id": complaint_id,
                "ticket_id": ticket_id,
                "submitted_at": now,
                "text": text,
                "image_path": image_path,
                "location_text": location_text,
                "latitude": latitude,
                "longitude": longitude,
                "status": "pending",
                "assigned_officer_id": None,
                "assigned_officer_name": None,
                "officer_notes": None
            })
        except Exception as e:
            print(f"[Firebase] Error inserting complaint: {e}")

    return complaint_id


def get_complaint(complaint_id: str) -> Optional[Dict[str, Any]]:
    # Try Firestore first if available
    fs = get_firestore_client()
    if fs:
        try:
            doc = fs.collection("complaints").document(complaint_id).get()
            if doc.exists:
                data = doc.to_dict()
                # merge analysis if present
                analysis = get_analysis(complaint_id)
                if analysis:
                    data.update(analysis)
                return data
        except Exception:
            pass

    with get_connection() as conn:
        row = conn.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,)).fetchone()
        if not row:
            return None
        c = dict(row)
        analysis = get_analysis(complaint_id)
        if analysis:
            c.update(analysis)
        return c


def get_complaint_by_ticket(ticket_id: str) -> Optional[Dict[str, Any]]:
    fs = get_firestore_client()
    if fs:
        try:
            docs = list(fs.collection("complaints").where("ticket_id", "==", ticket_id).limit(1).stream())
            if docs:
                data = docs[0].to_dict()
                analysis = get_analysis(data["id"])
                if analysis:
                    data.update(analysis)
                return data
        except Exception:
            pass

    with get_connection() as conn:
        row = conn.execute("SELECT * FROM complaints WHERE ticket_id = ?", (ticket_id,)).fetchone()
        if not row:
            return None
        c = dict(row)
        analysis = get_analysis(c["id"])
        if analysis:
            c.update(analysis)
        return c


def get_all_complaints(status: Optional[str] = None, 
                       category: Optional[str] = None, 
                       severity: Optional[str] = None, 
                       limit: int = 200) -> List[Dict[str, Any]]:
    query = """
        SELECT c.*, 
               a.issue_category, a.severity_score, a.severity_level, 
               a.sdg_primary, a.sdg_secondary, a.department, 
               a.action_recommendation, a.ai_confidence
        FROM complaints c
        LEFT JOIN analysis_results a ON c.id = a.complaint_id
        WHERE 1=1
    """
    params = []
    if status and status != "all":
        query += " AND c.status = ?"
        params.append(status)
    if category and category != "all":
        query += " AND a.issue_category = ?"
        params.append(category)
    if severity and severity != "all":
        query += " AND a.severity_level = ?"
        params.append(severity)
    query += " ORDER BY c.submitted_at DESC LIMIT ?"
    params.append(limit)

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


def update_complaint_status(complaint_id: str, status: str) -> bool:
    with get_connection() as conn:
        conn.execute("UPDATE complaints SET status = ? WHERE id = ?", (status, complaint_id))
        conn.commit()

    fs = get_firestore_client()
    if fs:
        try:
            fs.collection("complaints").document(complaint_id).update({"status": status})
        except Exception:
            pass
    return True


def assign_complaint_officer(complaint_id: str, officer_id: str, officer_name: str, notes: Optional[str] = None) -> bool:
    now = datetime.now().isoformat()
    with get_connection() as conn:
        conn.execute(
            """UPDATE complaints 
               SET status = 'assigned', assigned_officer_id = ?, assigned_officer_name = ?, officer_notes = ?, assigned_at = ?
               WHERE id = ?""",
            (officer_id, officer_name, notes, now, complaint_id)
        )
        # Update officer active tickets count
        conn.execute("UPDATE officers SET active_tickets = active_tickets + 1 WHERE id = ?", (officer_id,))
        conn.commit()

    fs = get_firestore_client()
    if fs:
        try:
            fs.collection("complaints").document(complaint_id).update({
                "status": "assigned",
                "assigned_officer_id": officer_id,
                "assigned_officer_name": officer_name,
                "officer_notes": notes,
                "assigned_at": now
            })
            fs.collection("officers").document(officer_id).update({
                "active_tickets": firestore.Increment(1)
            })
        except Exception:
            pass
    return True


def delete_complaint(complaint_id_or_ticket_id: str) -> bool:
    """Deletes a complaint by ID or ticket ID from SQLite and Firestore, cleaning up related records and images."""
    complaint = get_complaint(complaint_id_or_ticket_id)
    if not complaint:
        complaint = get_complaint_by_ticket(complaint_id_or_ticket_id)

    target_id = complaint["id"] if complaint else complaint_id_or_ticket_id
    ticket_id = complaint.get("ticket_id") if complaint else complaint_id_or_ticket_id
    image_path = complaint.get("image_path") if complaint else None
    officer_id = complaint.get("assigned_officer_id") if complaint else None

    # 1. SQLite cleanup
    with get_connection() as conn:
        conn.execute("DELETE FROM complaints WHERE id = ? OR ticket_id = ?", (target_id, ticket_id))
        conn.execute("DELETE FROM analysis_results WHERE complaint_id = ?", (target_id,))
        conn.execute("DELETE FROM complaint_incidents WHERE complaint_id = ?", (target_id,))
        if officer_id:
            conn.execute("UPDATE officers SET active_tickets = MAX(0, active_tickets - 1) WHERE id = ?", (officer_id,))
        conn.commit()

    # 2. Firestore cleanup
    fs = get_firestore_client()
    if fs:
        try:
            fs.collection("complaints").document(target_id).delete()
            if ticket_id:
                for doc in fs.collection("complaints").where("ticket_id", "==", ticket_id).stream():
                    doc.reference.delete()
        except Exception as e:
            print(f"[Firebase] Error deleting complaint {target_id}: {e}")

    # 3. Clean up physical image file if present
    if image_path and os.path.exists(image_path):
        try:
            os.remove(image_path)
        except Exception:
            pass

    return True



# ── Analysis CRUD ─────────────────────────────────────────────────

def insert_analysis(complaint_id: str, analysis: Dict[str, Any]):
    with get_connection() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO analysis_results 
               (complaint_id, issue_category, extracted_entities, severity_score, severity_level, 
                severity_factors, severity_explanation, image_label, image_confidence, ai_confidence, 
                sdg_primary, sdg_secondary, sdg_rationale, department, action_recommendation)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                complaint_id,
                analysis.get("issue_category"),
                json.dumps(analysis.get("extracted_entities", {})),
                analysis.get("severity_score"),
                analysis.get("severity_level"),
                json.dumps(analysis.get("severity_factors", {})),
                analysis.get("severity_explanation"),
                analysis.get("image_label"),
                analysis.get("image_confidence"),
                analysis.get("ai_confidence"),
                analysis.get("sdg_primary"),
                json.dumps(analysis.get("sdg_secondary", [])) if isinstance(analysis.get("sdg_secondary"), list) else str(analysis.get("sdg_secondary")),
                analysis.get("sdg_rationale"),
                analysis.get("department"),
                analysis.get("action_recommendation"),
            )
        )
        conn.commit()

    fs = get_firestore_client()
    if fs:
        try:
            fs.collection("analysis_results").document(complaint_id).set(analysis)
            # Also update complaint document with summary fields
            fs.collection("complaints").document(complaint_id).update({
                "issue_category": analysis.get("issue_category"),
                "severity_level": analysis.get("severity_level"),
                "severity_score": analysis.get("severity_score"),
                "department": analysis.get("department")
            })
        except Exception:
            pass


def get_analysis(complaint_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM analysis_results WHERE complaint_id = ?", (complaint_id,)).fetchone()
        if not row:
            return None
        d = dict(row)
        for json_col in ["extracted_entities", "severity_factors", "sdg_secondary"]:
            if d.get(json_col):
                try:
                    d[json_col] = json.loads(d[json_col])
                except Exception:
                    pass
        return d


# ── Officers CRUD ─────────────────────────────────────────────────

def get_all_officers() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM officers ORDER BY department, name").fetchall()
        return [dict(r) for r in rows]


def insert_officer(name: str, department: str, designation: str, 
                   ward: str = "", phone: str = "", email: str = "") -> str:
    officer_id = f"OFF-{str(uuid.uuid4())[:6].upper()}"
    with get_connection() as conn:
        conn.execute(
            """INSERT INTO officers (id, name, department, designation, ward, phone, email, active_tickets, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'available')""",
            (officer_id, name, department, designation, ward, phone, email)
        )
        conn.commit()

    fs = get_firestore_client()
    if fs:
        try:
            fs.collection("officers").document(officer_id).set({
                "id": officer_id, "name": name, "department": department,
                "designation": designation, "ward": ward, "phone": phone,
                "email": email, "active_tickets": 0, "status": "available"
            })
        except Exception:
            pass

    return officer_id


# ── RAG Documents & Chunks CRUD ───────────────────────────────────

def insert_rag_document(doc_id: str, title: str, filename: str, file_type: str, 
                        chunk_count: int, preview: str) -> str:
    now = datetime.now().isoformat()
    with get_connection() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO rag_documents 
               (id, title, filename, file_type, uploaded_at, chunk_count, content_preview)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (doc_id, title, filename, file_type, now, chunk_count, preview)
        )
        conn.commit()

    fs = get_firestore_client()
    if fs:
        try:
            fs.collection("rag_documents").document(doc_id).set({
                "id": doc_id, "title": title, "filename": filename,
                "file_type": file_type, "uploaded_at": now,
                "chunk_count": chunk_count, "content_preview": preview
            })
        except Exception:
            pass

    return doc_id


def get_all_rag_documents() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM rag_documents ORDER BY uploaded_at DESC").fetchall()
        return [dict(r) for r in rows]


def delete_rag_document(doc_id: str) -> bool:
    with get_connection() as conn:
        conn.execute("DELETE FROM rag_chunks WHERE document_id = ?", (doc_id,))
        conn.execute("DELETE FROM rag_documents WHERE id = ?", (doc_id,))
        conn.commit()

    fs = get_firestore_client()
    if fs:
        try:
            fs.collection("rag_documents").document(doc_id).delete()
            chunks = fs.collection("rag_chunks").where("document_id", "==", doc_id).stream()
            for c in chunks:
                c.reference.delete()
        except Exception:
            pass
    return True


def insert_rag_chunk(doc_id: str, chunk_index: int, content: str, metadata: str = "") -> str:
    chunk_id = str(uuid.uuid4())
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO rag_chunks (id, document_id, chunk_index, content, metadata) VALUES (?, ?, ?, ?, ?)",
            (chunk_id, doc_id, chunk_index, content, metadata)
        )
        conn.commit()

    fs = get_firestore_client()
    if fs:
        try:
            fs.collection("rag_chunks").document(chunk_id).set({
                "id": chunk_id, "document_id": doc_id,
                "chunk_index": chunk_index, "content": content, "metadata": metadata
            })
        except Exception:
            pass
    return chunk_id


def get_all_rag_chunks() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM rag_chunks ORDER BY document_id, chunk_index").fetchall()
        return [dict(r) for r in rows]


# ── Analytics & KPI Telemetry ─────────────────────────────────────

def get_total_count() -> int:
    with get_connection() as conn:
        return conn.execute("SELECT COUNT(*) FROM complaints").fetchone()[0]


def get_critical_count() -> int:
    with get_connection() as conn:
        return conn.execute(
            "SELECT COUNT(*) FROM analysis_results WHERE severity_level IN ('CRITICAL', 'HIGH')"
        ).fetchone()[0]


def get_severity_counts() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT severity_level, COUNT(*) as count FROM analysis_results GROUP BY severity_level"
        ).fetchall()
        return [dict(r) for r in rows]


def get_category_counts() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            """SELECT issue_category, COUNT(*) as count 
               FROM analysis_results 
               WHERE issue_category IS NOT NULL 
               GROUP BY issue_category 
               ORDER BY count DESC"""
        ).fetchall()
        return [dict(r) for r in rows]


def get_sdg_counts() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            """SELECT sdg_primary, COUNT(*) as count 
               FROM analysis_results 
               WHERE sdg_primary IS NOT NULL 
               GROUP BY sdg_primary 
               ORDER BY count DESC"""
        ).fetchall()
        return [dict(r) for r in rows]


def get_all_incidents() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM incidents ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]
