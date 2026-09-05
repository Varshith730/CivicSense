PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS complaints (
    id              TEXT PRIMARY KEY,
    ticket_id       TEXT UNIQUE NOT NULL,
    submitted_at    TEXT DEFAULT (datetime('now')),
    text            TEXT NOT NULL,
    image_path      TEXT,
    location_text   TEXT,
    latitude        REAL,
    longitude       REAL,
    status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_review','resolved','closed'))
);

CREATE TABLE IF NOT EXISTS analysis_results (
    complaint_id        TEXT PRIMARY KEY REFERENCES complaints(id) ON DELETE CASCADE,
    issue_category      TEXT,
    extracted_entities  TEXT,
    severity_score      REAL,
    severity_level      TEXT CHECK(severity_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    severity_factors    TEXT,
    severity_explanation TEXT,
    image_label         TEXT,
    image_confidence    REAL,
    ai_confidence       REAL,
    sdg_primary         TEXT,
    sdg_secondary       TEXT,
    sdg_rationale       TEXT,
    department          TEXT,
    action_recommendation TEXT,
    analyzed_at         TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS incidents (
    id              TEXT PRIMARY KEY,
    created_at      TEXT DEFAULT (datetime('now')),
    issue_category  TEXT,
    location_text   TEXT,
    latitude        REAL,
    longitude       REAL,
    report_count    INTEGER DEFAULT 1,
    severity_level  TEXT,
    status          TEXT DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS complaint_incidents (
    complaint_id    TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    incident_id     TEXT REFERENCES incidents(id) ON DELETE CASCADE,
    similarity_score REAL,
    PRIMARY KEY (complaint_id, incident_id)
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source      TEXT NOT NULL,
    content     TEXT NOT NULL,
    chunk_index INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_complaints_status    ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_submitted ON complaints(submitted_at);
CREATE INDEX IF NOT EXISTS idx_analysis_category    ON analysis_results(issue_category);
CREATE INDEX IF NOT EXISTS idx_analysis_severity    ON analysis_results(severity_level);
CREATE INDEX IF NOT EXISTS idx_incidents_category   ON incidents(issue_category);