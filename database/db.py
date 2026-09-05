"""
CivicSense AI - Database Layer
SQLite connection and CRUD helper functions.
"""

import sqlite3
import json
import uuid
import os
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "civicsense.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    with get_connection() as conn:
        with open(SCHEMA_PATH, "r") as f:
            conn.executescript(f.read())
    return True


def generate_ticket_id() -> str:
    date_str = datetime.now().strftime("%Y%m%d")
    suffix = str(uuid.uuid4())[:4].upper()
    return f"CS-{date_str}-{suffix}"


# -- Complaints --

def insert_complaint(text, image_path=None, location_text=None, latitude=None, longitude=None):
    complaint_id = str(uuid.uuid4())
    ticket_id = generate_ticket_id()
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO complaints (id, ticket_id, text, image_path, location_text, latitude, longitude) VALUES (?,?,?,?,?,?,?)",
            (complaint_id, ticket_id, text, image_path, location_text, latitude, longitude)
        )
    return complaint_id


def get_complaint(complaint_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,)).fetchone()
    return dict(row) if row else None


def get_complaint_by_ticket(ticket_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM complaints WHERE ticket_id = ?", (ticket_id,)).fetchone()
    return dict(row) if row else None


def get_all_complaints(status=None, category=None, severity=None, limit=500):
    query = """
        SELECT c.*, ar.issue_category, ar.severity_level, ar.sdg_primary,
               ar.department, ar.ai_confidence, ar.image_label
        FROM complaints c
        LEFT JOIN analysis_results ar ON c.id = ar.complaint_id
        WHERE 1=1
    """
    params = []
    if status:
        query += " AND c.status = ?"
        params.append(status)
    if category:
        query += " AND ar.issue_category = ?"
        params.append(category)
    if severity:
        query += " AND ar.severity_level = ?"
        params.append(severity)
    query += " ORDER BY c.submitted_at DESC LIMIT ?"
    params.append(limit)
    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
    return [dict(r) for r in rows]


def update_complaint_status(complaint_id, status):
    with get_connection() as conn:
        conn.execute("UPDATE complaints SET status = ? WHERE id = ?", (status, complaint_id))


# -- Analysis Results --

def insert_analysis(complaint_id, result):
    with get_connection() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO analysis_results
               (complaint_id, issue_category, extracted_entities, severity_score, severity_level,
                severity_factors, severity_explanation, image_label, image_confidence, ai_confidence,
                sdg_primary, sdg_secondary, sdg_rationale, department, action_recommendation)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                complaint_id,
                result.get("issue_category"),
                json.dumps(result.get("extracted_entities", {})),
                result.get("severity_score"),
                result.get("severity_level"),
                json.dumps(result.get("severity_factors", {})),
                result.get("severity_explanation"),
                result.get("image_label"),
                result.get("image_confidence"),
                result.get("ai_confidence"),
                result.get("sdg_primary"),
                json.dumps(result.get("sdg_secondary", [])),
                result.get("sdg_rationale"),
                result.get("department"),
                result.get("action_recommendation"),
            )
        )


def get_analysis(complaint_id):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM analysis_results WHERE complaint_id = ?", (complaint_id,)
        ).fetchone()
    if not row:
        return None
    d = dict(row)
    for field in ("extracted_entities", "severity_factors", "sdg_secondary"):
        if d.get(field):
            try:
                d[field] = json.loads(d[field])
            except Exception:
                pass
    return d


# -- Incidents --

def insert_incident(issue_category, location_text, latitude=None, longitude=None, severity_level="MEDIUM"):
    incident_id = str(uuid.uuid4())
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO incidents (id, issue_category, location_text, latitude, longitude, severity_level) VALUES (?,?,?,?,?,?)",
            (incident_id, issue_category, location_text, latitude, longitude, severity_level)
        )
    return incident_id


def link_complaint_to_incident(complaint_id, incident_id, similarity):
    with get_connection() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO complaint_incidents VALUES (?,?,?)",
            (complaint_id, incident_id, similarity)
        )
        conn.execute(
            "UPDATE incidents SET report_count = report_count + 1 WHERE id = ?",
            (incident_id,)
        )


def get_all_incidents():
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM incidents ORDER BY report_count DESC").fetchall()
    return [dict(r) for r in rows]


def get_complaints_for_incident(incident_id):
    with get_connection() as conn:
        rows = conn.execute(
            """SELECT c.*, ci.similarity_score FROM complaints c
               JOIN complaint_incidents ci ON c.id = ci.complaint_id
               WHERE ci.incident_id = ?""",
            (incident_id,)
        ).fetchall()
    return [dict(r) for r in rows]


# -- Analytics --

def get_category_counts():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT ar.issue_category, COUNT(*) as count FROM analysis_results ar GROUP BY ar.issue_category ORDER BY count DESC"
        ).fetchall()
    return [dict(r) for r in rows]


def get_severity_counts():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT severity_level, COUNT(*) as count FROM analysis_results GROUP BY severity_level"
        ).fetchall()
    return [dict(r) for r in rows]


def get_complaints_with_geo():
    with get_connection() as conn:
        rows = conn.execute(
            """SELECT c.id, c.latitude, c.longitude, c.location_text,
                      ar.issue_category, ar.severity_level
               FROM complaints c
               JOIN analysis_results ar ON c.id = ar.complaint_id
               WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL"""
        ).fetchall()
    return [dict(r) for r in rows]


def get_daily_trend(days=30):
    with get_connection() as conn:
        rows = conn.execute(
            f"""SELECT date(submitted_at) as date, COUNT(*) as count
                FROM complaints
                WHERE submitted_at >= date('now', '-{days} days')
                GROUP BY date(submitted_at) ORDER BY date"""
        ).fetchall()
    return [dict(r) for r in rows]


def get_sdg_counts():
    with get_connection() as conn:
        rows = conn.execute(
            """SELECT sdg_primary, COUNT(*) as count FROM analysis_results
               WHERE sdg_primary IS NOT NULL GROUP BY sdg_primary ORDER BY count DESC"""
        ).fetchall()
    return [dict(r) for r in rows]


def get_total_count():
    with get_connection() as conn:
        row = conn.execute("SELECT COUNT(*) as c FROM complaints").fetchone()
    return row["c"] if row else 0


def get_critical_count():
    with get_connection() as conn:
        row = conn.execute(
            "SELECT COUNT(*) as c FROM analysis_results WHERE severity_level IN ('HIGH','CRITICAL')"
        ).fetchone()
    return row["c"] if row else 0
