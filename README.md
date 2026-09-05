# CivicSense AI
## AI-Powered Civic Issue Intelligence & Sustainable Response System

> **Internship:** 1M1B AI for Sustainability Virtual Internship in collaboration with IBM SkillsBuild & AICTE  
> **Mandatory Integration:** Co-Developed with **IBM BOB** (Ideation, Development, Execution)  
> **Primary SDG:** SDG 11 — Sustainable Cities and Communities  
> **Localized Municipality:** Greater Warangal Municipal Corporation (GWMC), Telangana, India  
> **Submission Window:** September 7, 2026 – September 21, 2026  

---

## 🏛️ Executive Overview

**CivicSense AI** is a production-grade, full-stack civic intelligence platform designed to transform unstructured citizen complaints (text, photographs, and geographic locations) into structured, actionable, and explainable data for municipal corporations.

Built specifically for the **Greater Warangal Municipal Corporation (GWMC)**, CivicSense AI automates civic grievance triage across Hanamkonda, Kazipet, and Warangal zones, bridging the gap between citizen reporting and sustainable urban governance.

---

## 🤖 Incorporation of IBM BOB

As required by the **1M1B x IBM SkillsBuild x AICTE Project Guidelines**, **IBM BOB** (IBM's agentic AI development partner) was actively incorporated throughout all stages of the project:

- **Ideation Stage:** Formulating the 6-factor deterministic severity scoring rubric, defining UN SDG 11 indicators, and structuring the GWMC departmental routing ontology.
- **Development Stage:** Co-architecting the decoupled FastAPI backend and React 19 frontend, implementing DBSCAN geospatial clustering for Warangal coordinates, and integrating the live Socrata SODA OpenData API.
- **Execution & Verification Stage:** Designing machine-executable test suites and the Explainable AI (XAI) transparent audit modal.

*(Complete prompt logs and architectural artifacts are documented in [`docs/IBM_BOB_INTEGRATION.md`](docs/IBM_BOB_INTEGRATION.md))*.

---

## 🌟 Key Features

1. **Multimodal AI Triage:**
   - **NLP Text Classification:** TF-IDF + Logistic Regression trained on benchmark real-world 311 complaints with >94% confidence.
   - **Named Entity Extraction:** Automatic extraction of duration, persistence, and landmark entities.
   - **CLIP Zero-Shot Vision:** Multimodal validation comparing complaint images against civic category labels.
2. **Deterministic 6-Factor Severity Engine:**
   - Evaluates Public Safety (25%), Environmental Impact (20%), Duration (15%), Population Impact (15%), Evidence (15%), and Frequency (10%).
3. **DBSCAN Geospatial Hotspot Detection:**
   - Clusters GPS coordinates using Haversine distance to detect spatial complaint clusters across Hanamkonda, Kazipet, and Warangal landmarks.
4. **GWMC Departmental Routing:**
   - Automatically routes complaints to official wings: GWMC Solid Waste & Sanitation Wing, GWMC Engineering & Town Planning, GWMC Mission Bhagiratha Water Works, GWMC Street Lighting, GWMC Stormwater & Nala Maintenance, and TSPCB Warangal.
5. **Real-Time Live OpenData Sync:**
   - Live stream pulling real-time civic issues via the Socrata SODA API (`/api/sync-live-nyc311`) with automated ticket deduplication.
6. **Dual-Adapter Database Layer:**
   - Zero-config local SQLite (`database/civicsense.db`) with seamless migration support for cloud **Supabase PostgreSQL**.
7. **Explainable AI (XAI) & Human-in-the-Loop:**
   - Transparent factor-by-factor breakdown for every automated triage decision with supervisor status overrides.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              React 19 Frontend Dashboard                │
│    (Vite, Tailwind CSS, Leaflet Maps, Recharts, Lucide) │
└────────────────────────────┬────────────────────────────┘
                             │ REST API (JSON / Multipart)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                FastAPI Backend (server.py)              │
├─────────────────────────────────────────────────────────┤
│  • NLP Classifier (TF-IDF + Logistic Regression)        │
│  • Entity Extractor (Regex for duration, location)      │
│  • Multimodal Vision Classifier (CLIP zero-shot)        │
│  • 6-Factor Deterministic Severity Scoring Engine       │
│  • DBSCAN Geospatial Hotspot Clustering Engine          │
│  • GWMC Warangal Departmental Routing Matrix            │
│  • SDG Impact Mapper & RAG Civic Assistant              │
└────────────────────────────┬────────────────────────────┘
                             │ CRUD Operations
                             ▼
┌─────────────────────────────────────────────────────────┐
│     Dual-Adapter Database (SQLite / Supabase Postgres)  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup

```bash
cd civicsense-ai
pip install -r requirements.txt

# Start the FastAPI backend server
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```
Backend API will run at: `http://127.0.0.1:8000` (Interactive API Docs: `http://127.0.0.1:8000/docs`)

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend UI will run at: `http://127.0.0.1:5173`

### 4. Seed GWMC Warangal Demo Data

```bash
python database/seed_data.py
```

---

## 📂 Repository Structure

```
civicsense-ai/
├── client/                     # React 19 Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, ExplainabilityModal, Badges
│   │   ├── pages/              # Overview, HotspotMap, AnalysisLab, ReportIssue, etc.
│   │   └── api.js              # REST client connector
│   └── public/                 # GWMC banners, Warangal map infographics
├── core/                       # AI Engine Core Modules
│   ├── nlp/                    # Classifier + Entity Extractor
│   ├── vision/                 # CLIP Zero-Shot Vision
│   ├── severity/               # 6-Factor Deterministic Scoring Engine
│   ├── geo/                    # DBSCAN Hotspot Detector
│   ├── recommendations/        # GWMC Departmental Routing
│   ├── deduplication/          # SBERT Cosine Similarity
│   └── sdg/                    # UN SDG Mapping Matrix
├── database/                   # Database CRUD layer & Seed Script
│   ├── db.py                   # SQLite / Supabase CRUD operations
│   ├── schema.sql              # Relational database schema
│   └── seed_data.py            # GWMC Warangal demo data seeder
├── data/                       # Benchmark NYC 311 datasets & pipelines
├── docs/                       # Project documentation & submission artifacts
│   ├── IBM_BOB_INTEGRATION.md  # Detailed IBM BOB co-development records
│   └── PRESENTATION_SLIDES_AND_SCRIPT.md # Video demo script & slides
├── server.py                   # FastAPI REST backend server
├── PROJECT_SUBMISSION_REPORT.md# Formal internship submission report
└── README.md                   # Project overview & quick start
```

---

## 🎯 UN Sustainable Development Goal (SDG) Alignment

| SDG Target | Civic Issue Category | Municipal Impact |
|---|---|---|
| **SDG 11.2** (Safe Transport) | Potholes / Road Damage | Reduces vehicular accidents and road congestion. |
| **SDG 11.6** (Urban Environment) | Garbage / Waste Accumulation | Decreases per-capita environmental impact and disease vectors. |
| **SDG 6.1 & 6.4** (Clean Water) | Water Pipe Bursts / Leaks | Protects potable water distribution network (Mission Bhagiratha). |
| **SDG 13.1** (Climate Resilience) | Drainage Blockage & Flooding | Mitigates monsoon flash floods through early nala de-silting. |
| **SDG 15.1** (Terrestrial Ecosystems)| Fallen Trees / Urban Flora | Preserves green canopy while safely securing overhead power lines. |

---

## 📄 Submission Deliverables Index

- **Formal Written Report:** [`PROJECT_SUBMISSION_REPORT.md`](PROJECT_SUBMISSION_REPORT.md)
- **IBM BOB Co-Development Record:** [`docs/IBM_BOB_INTEGRATION.md`](docs/IBM_BOB_INTEGRATION.md)
- **Presentation Deck & 5-Min Video Script:** [`docs/PRESENTATION_SLIDES_AND_SCRIPT.md`](docs/PRESENTATION_SLIDES_AND_SCRIPT.md)
- **Interactive Web Dashboard:** `http://127.0.0.1:5173`
- **FastAPI REST API:** `http://127.0.0.1:8000/docs`
