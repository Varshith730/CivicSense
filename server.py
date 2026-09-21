"""
CivicSense AI - FastAPI Backend Server
Serves REST API endpoints for React UI to interact with AI Engine, Database, and Analytics.
"""

import os
import shutil
import uuid
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import db
from core.ai_engine import analyze_complaint
from core.nlp.classifier import classify_complaint
from core.nlp.entity_extractor import extract_entities, entities_to_dict
from core.severity.scoring_engine import compute_severity, FACTOR_WEIGHTS
from core.sdg.sdg_mapper import map_category_to_sdg, SDG_INFO, CATEGORY_SDG_MAP, get_all_categories
from core.recommendations.recommendation_engine import build_recommendation
from core.geo.hotspot_detector import detect_hotspots

from core.ai_assistant.rag_engine import (
    ingest_document, 
    retrieve_relevant_chunks, 
    generate_llm_response, 
    check_complaint_status_in_query
)
from database.firebase_db import is_firebase_configured

# Ensure database is initialized
db.init_db()

app = FastAPI(title="CivicSense AI API", version="2.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# ── Pydantic Request Models ─────────────────────────────────────
class StatusUpdateRequest(BaseModel):
    status: str

class QuestionRequest(BaseModel):
    question: str

class AssignOfficerRequest(BaseModel):
    officer_id: str
    officer_name: str
    notes: Optional[str] = None

class CreateOfficerRequest(BaseModel):
    name: str
    department: str
    designation: str
    ward: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""

class ChatRequest(BaseModel):
    message: str

class SystemConfigRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    firebase_service_account_json: Optional[str] = None


# ── Endpoints ───────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "CivicSense AI API", "version": "2.0.0"}


@app.get("/api/kpi")
def get_kpis():
    """Summary KPI metrics for the SaasAble dashboard top cards."""
    total = db.get_total_count()
    critical = db.get_critical_count()
    incidents = len(db.get_all_incidents())
    all_complaints = db.get_all_complaints()
    resolved = sum(1 for c in all_complaints if c.get("status") == "resolved")
    pending = sum(1 for c in all_complaints if c.get("status") == "pending")

    sev_counts = {r["severity_level"]: r["count"] for r in db.get_severity_counts()}
    cat_counts = db.get_category_counts()

    return {
        "total_complaints": total,
        "critical_issues": critical,
        "incident_clusters": incidents,
        "resolved_complaints": resolved,
        "pending_complaints": pending,
        "severity_breakdown": sev_counts,
        "top_categories": cat_counts[:5] if cat_counts else [],
    }


@app.get("/api/complaints")
def list_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 200
):
    """List complaints with filtering and search."""
    complaints = db.get_all_complaints(
        status=status if status and status != "all" else None,
        category=category if category and category != "all" else None,
        severity=severity if severity and severity != "all" else None,
        limit=limit
    )

    if search:
        s = search.lower()
        complaints = [
            c for c in complaints 
            if s in (c.get("text") or "").lower() or s in (c.get("location_text") or "").lower() or s in (c.get("ticket_id") or "").lower()
        ]

    # enrich with image url if available
    for c in complaints:
        if c.get("image_path") and os.path.exists(c["image_path"]):
            c["image_url"] = f"/uploads/{Path(c['image_path']).name}"
        else:
            c["image_url"] = None

    return {"count": len(complaints), "complaints": complaints}


@app.get("/api/complaints/{complaint_id}")
def get_complaint_detail(complaint_id: str):
    """Retrieve full complaint details with AI analysis, XAI breakdown, and similarity links."""
    # Find by ID or ticket ID
    complaint = db.get_complaint(complaint_id)
    if not complaint:
        complaint = db.get_complaint_by_ticket(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    analysis = db.get_analysis(complaint["id"])

    # Image URL
    image_url = None
    if complaint.get("image_path") and os.path.exists(complaint["image_path"]):
        image_url = f"/uploads/{Path(complaint['image_path']).name}"

    # Similar complaints check
    similar_list = []
    if analysis:
        try:
            from core.deduplication.duplicate_detector import find_similar_complaints
            existing = db.get_all_complaints()
            existing_filtered = [c for c in existing if c.get("id") != complaint["id"]]
            sims = find_similar_complaints(
                complaint["text"],
                complaint.get("latitude"),
                complaint.get("longitude"),
                existing_filtered,
                analysis.get("issue_category")
            )
            similar_list = [
                {
                    "id": s.complaint_id,
                    "ticket_id": s.ticket_id,
                    "text": s.text,
                    "similarity_score": s.similarity_score,
                    "location_text": s.location_text
                }
                for s in sims
            ]
        except Exception:
            similar_list = []

    return {
        **complaint,
        "complaint": complaint,
        "image_url": image_url,
        "analysis": analysis,
        "similar_complaints": similar_list,
        "factor_weights": FACTOR_WEIGHTS
    }


@app.patch("/api/complaints/{complaint_id}/status")
def update_status(complaint_id: str, req: StatusUpdateRequest):
    valid_statuses = ["pending", "in_review", "resolved", "closed"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    complaint = db.get_complaint(complaint_id)
    if not complaint:
        complaint = db.get_complaint_by_ticket(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    db.update_complaint_status(complaint["id"], req.status)
    return {"success": True, "id": complaint["id"], "status": req.status}


@app.delete("/api/complaints/{complaint_id}")
def delete_complaint_endpoint(complaint_id: str):
    """Delete a complaint and its analysis by ID or ticket ID."""
    success = db.delete_complaint(complaint_id)
    return {"success": success, "id": complaint_id}



@app.post("/api/complaints")
async def create_complaint(
    text: str = Form(...),
    location_text: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Citizen complaint submission with automated AI triage & SQLite storage."""
    saved_image_path = None
    if image and image.filename:
        ext = Path(image.filename).suffix or ".jpg"
        unique_name = f"{uuid.uuid4()}{ext}"
        target_path = UPLOAD_DIR / unique_name
        with open(target_path, "wb") as f:
            shutil.copyfileobj(image.file, f)
        saved_image_path = str(target_path)

    cid = db.insert_complaint(
        text=text,
        image_path=saved_image_path,
        location_text=location_text,
        latitude=latitude,
        longitude=longitude
    )

    # Run AI analysis
    analysis_result = analyze_complaint(
        complaint_id=cid,
        text=text,
        image_path=saved_image_path,
        location_text=location_text,
        latitude=latitude,
        longitude=longitude
    )

    saved_complaint = db.get_complaint(cid)
    ticket_id = saved_complaint.get("ticket_id") if saved_complaint else f"GWMC-{datetime.now().strftime('%Y%m%d')}-{cid[:4].upper()}"
    return {
        "success": True,
        "ticket_id": ticket_id,
        "complaint": saved_complaint,
        "analysis": analysis_result
    }


@app.post("/api/analyze-test")
async def test_ai_analysis(
    text: str = Form(...),
    location_text: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None)
):
    """Sandbox endpoint for testing AI analysis on raw inputs without persisting to DB."""
    temp_img_path = None
    if image and image.filename:
        ext = Path(image.filename).suffix or ".jpg"
        temp_img_path = str(UPLOAD_DIR / f"test_{uuid.uuid4()}{ext}")
        with open(temp_img_path, "wb") as f:
            shutil.copyfileobj(image.file, f)

    clf = classify_complaint(text)
    entities = extract_entities(text)
    ents_dict = entities_to_dict(entities)

    image_label = None
    image_confidence = None
    if temp_img_path:
        try:
            from core.vision.clip_classifier import classify_image
            vr = classify_image(temp_img_path)
            image_label = vr.label
            image_confidence = vr.confidence
        except Exception:
            pass

    sev = compute_severity(
        issue_category=clf["category"],
        duration_days=entities.duration_days,
        affected_desc=entities.affected_desc,
        location_text=location_text,
        has_image=temp_img_path is not None,
        text_length=len(text),
        image_confidence=image_confidence,
        similar_complaint_count=0
    )

    sdg = map_category_to_sdg(clf["category"])
    rec = build_recommendation(clf["category"], sev.level)

    return {
        "category": clf["category"],
        "confidence": clf["confidence"],
        "top_3": clf.get("top_3", []),
        "entities": ents_dict,
        "severity": {
            "score": sev.score,
            "level": sev.level,
            "factors": sev.factors,
            "factor_reasons": sev.factor_reasons,
            "explanation": sev.explanation,
            "ai_confidence": sev.ai_confidence
        },
        "sdg": {
            "primary": sdg.primary,
            "primary_title": sdg.primary_title,
            "secondary": sdg.secondary,
            "secondary_titles": sdg.secondary_titles,
            "rationale": sdg.rationale
        },
        "recommendation": rec,
        "image_analysis": {
            "label": image_label,
            "confidence": image_confidence
        } if temp_img_path else None
    }


@app.get("/api/hotspots")
def get_hotspot_data(eps_km: float = 0.5, min_samples: int = 3):
    """Returns all geo-tagged complaints and detected DBSCAN hotspots."""
    geo_complaints = db.get_complaints_with_geo()
    hotspots = detect_hotspots(geo_complaints, eps_km=eps_km, min_samples=min_samples)

    return {
        "complaints_count": len(geo_complaints),
        "complaints": geo_complaints,
        "hotspots_count": len(hotspots),
        "hotspots": [
            {
                "cluster_id": h.cluster_id,
                "center_lat": h.center_lat,
                "center_lon": h.center_lon,
                "complaint_count": h.complaint_count,
                "dominant_category": h.dominant_category,
                "dominant_severity": h.dominant_severity,
                "complaint_ids": h.complaint_ids
            }
            for h in hotspots
        ]
    }


@app.get("/api/analytics")
def get_analytics():
    """Aggregated charts and trends for Recharts."""
    cat_counts = db.get_category_counts()
    sev_counts = db.get_severity_counts()
    daily_trends = db.get_daily_trend(days=30)
    incidents = db.get_all_incidents()

    all_c = db.get_all_complaints()
    status_counts = {}
    for c in all_c:
        s = c.get("status", "pending")
        status_counts[s] = status_counts.get(s, 0) + 1

    return {
        "categories": cat_counts,
        "severities": sev_counts,
        "daily_trends": daily_trends,
        "incidents": incidents[:10],
        "statuses": [{"status": k, "count": v} for k, v in status_counts.items()]
    }


@app.get("/api/sustainability")
def get_sustainability_insights():
    """SDG 11 primary tracker, secondary distribution, and category mapping."""
    sdg_counts = db.get_sdg_counts()
    return {
        "primary_sdg": "SDG 11",
        "sdg_counts": sdg_counts,
        "sdg_definitions": SDG_INFO,
        "category_mapping": CATEGORY_SDG_MAP
    }


@app.post("/api/chat")
def chat_with_assistant(req: ChatRequest):
    """RAG-grounded LLM civic assistant."""
    ticket_info = check_complaint_status_in_query(req.message)
    context_chunks = retrieve_relevant_chunks(req.message, top_k=3)
    result = generate_llm_response(req.message, context_chunks, ticket_info)
    return result


@app.post("/api/assistant")
def legacy_assistant(req: QuestionRequest):
    """Backward-compatible endpoint for existing UI components."""
    ticket_info = check_complaint_status_in_query(req.question)
    context_chunks = retrieve_relevant_chunks(req.question, top_k=3)
    res = generate_llm_response(req.question, context_chunks, ticket_info)
    return {
        "question": req.question,
        "answer": res["answer"],
        "source": f"CivicSense RAG Knowledge Base ({res.get('model', 'LLM')})"
    }


# ── Officers & Workforce Management ──────────────────────────────
@app.get("/api/officers")
def list_officers():
    """Retrieve all municipal officers for ticket assignment."""
    return {"officers": db.get_all_officers()}


@app.post("/api/officers")
def create_officer(req: CreateOfficerRequest):
    """Admin creates a new municipal department officer."""
    oid = db.insert_officer(
        name=req.name,
        department=req.department,
        designation=req.designation,
        ward=req.ward or "",
        phone=req.phone or "",
        email=req.email or ""
    )
    return {"success": True, "officer_id": oid, "message": f"Officer {req.name} successfully registered."}


@app.post("/api/complaints/{complaint_id}/assign")
def assign_officer(complaint_id: str, req: AssignOfficerRequest):
    """Admin assigns a civic complaint to a specific field officer."""
    complaint = db.get_complaint(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    db.assign_complaint_officer(
        complaint_id=complaint_id,
        officer_id=req.officer_id,
        officer_name=req.officer_name,
        notes=req.notes
    )
    return {
        "success": True, 
        "message": f"Complaint {complaint.get('ticket_id', complaint_id)} successfully assigned to {req.officer_name}."
    }


# ── RAG Knowledge Hub Endpoints ──────────────────────────────────
@app.post("/api/admin/rag/upload")
async def upload_rag_document(file: UploadFile = File(...), title: Optional[str] = Form(None)):
    """Admin uploads a municipal circular or policy PDF/TXT to index into RAG."""
    suffix = Path(file.filename).suffix.lower()
    if suffix not in [".pdf", ".txt", ".md"]:
        raise HTTPException(status_code=400, detail="Only PDF, TXT, and Markdown files are supported for RAG indexing.")

    rag_dir = Path(__file__).parent / "uploads" / "rag_docs"
    rag_dir.mkdir(parents=True, exist_ok=True)
    dest_path = rag_dir / file.filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        info = ingest_document(dest_path, title=title)
        return {
            "success": True, 
            "document": info, 
            "message": f"Document '{file.filename}' indexed into {info['chunks_indexed']} knowledge chunks."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {e}")


@app.get("/api/admin/rag/documents")
def list_rag_documents():
    """List all indexed municipal documents in RAG."""
    return {"documents": db.get_all_rag_documents()}


@app.delete("/api/admin/rag/documents/{doc_id}")
def delete_rag_document(doc_id: str):
    """Admin deletes a document from the RAG knowledge base."""
    db.delete_rag_document(doc_id)
    return {"success": True, "message": "Document and chunks removed from RAG knowledge base."}


# ── System Control & Clean Slate ────────────────────────────────
@app.post("/api/admin/clear-all")
def clear_all_data():
    """Wipes all complaints and analysis data to start from clean scratch."""
    db.clear_all_complaints()
    return {"success": True, "message": "All complaints wiped clean. System running from scratch with 0 demo data."}


@app.get("/api/system/status")
def get_system_status():
    """Telemetry on database connection, Firebase status, and LLM configuration."""
    return {
        "firebase_configured": is_firebase_configured(),
        "gemini_configured": bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")),
        "total_complaints": db.get_total_count(),
        "officers_count": len(db.get_all_officers()),
        "rag_documents_count": len(db.get_all_rag_documents())
    }


@app.post("/api/system/config")
def update_system_config(req: SystemConfigRequest):
    """Dynamically update API keys or Firebase service account configuration."""
    if req.gemini_api_key:
        os.environ["GEMINI_API_KEY"] = req.gemini_api_key.strip()
    if req.firebase_service_account_json:
        os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"] = req.firebase_service_account_json.strip()
    return {
        "success": True,
        "firebase_configured": is_firebase_configured(),
        "gemini_configured": bool(os.environ.get("GEMINI_API_KEY"))
    }

@app.post("/api/sync-live-nyc311")
def sync_live_nyc311(limit: int = 25):
    """
    Query the live NYC OpenData 311 Socrata endpoint in real-time.
    Triages incoming complaints using the CivicSense AI Engine and persists to SQLite.
    """
    import requests
    api_url = "https://data.cityofnewyork.us/resource/erm2-nwe9.json"
    params = {
        "$limit": limit,
        "$order": "created_date DESC"
    }
    try:
        resp = requests.get(api_url, params=params, timeout=15)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"NYC OpenData API returned status {resp.status_code}")
        records = resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Network error contacting NYC OpenData: {e}")

    synced = 0
    for r in records:
        unique_key = r.get("unique_key") or str(uuid.uuid4())[:8]
        ticket_id = f"CS-NYC-{unique_key}"
        
        # Check if already in database
        existing = db.get_complaint_by_ticket(ticket_id)
        if existing:
            continue

        desc = r.get("descriptor") or r.get("complaint_type") or "Civic service request"
        addr = r.get("incident_address") or ""
        boro = r.get("borough") or "New York"
        ctype = r.get("complaint_type") or ""

        parts = [desc]
        if addr and addr != "Unspecified":
            parts.append(f"at {addr}")
        if boro and boro != "Unspecified":
            parts.append(f"in {boro}")
        if ctype:
            parts.append(f"(Filed under {ctype})")
        text = ". ".join(parts) + "."

        loc_text = f"{addr}, {boro}".strip(", ") or "New York City"

        lat = None
        lon = None
        try:
            if r.get("latitude"):
                lat = float(r["latitude"])
            if r.get("longitude"):
                lon = float(r["longitude"])
        except (ValueError, TypeError):
            pass

        cid = str(uuid.uuid4())
        with db.get_connection() as conn:
            conn.execute(
                "INSERT INTO complaints (id, ticket_id, text, image_path, location_text, latitude, longitude) VALUES (?,?,?,?,?,?,?)",
                (cid, ticket_id, text, None, loc_text, lat, lon)
            )

        analyze_complaint(
            complaint_id=cid,
            text=text,
            image_path=None,
            location_text=loc_text,
            latitude=lat,
            longitude=lon
        )
        synced += 1

    return {
        "success": True,
        "count": synced,
        "message": f"Successfully pulled and AI-triaged {synced} live complaints directly from NYC 311 OpenData API!"
    }
