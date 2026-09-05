# CivicSense AI: Presentation Deck & 5-Minute Video Demonstration Script
## 1M1B x IBM SkillsBuild x AICTE AI for Sustainability Internship

---

## Part 1: Presentation Slide Deck Outline (10 Slides)

### Slide 1: Title & Credential
- **Title:** CivicSense AI — AI-Powered Civic Issue Intelligence & Sustainable Response System
- **Subtitle:** Built for Greater Warangal Municipal Corporation (GWMC)
- **Internship:** 1M1B AI for Sustainability Virtual Internship in collaboration with IBM SkillsBuild & AICTE
- **Presenter:** Student Name / Team Details
- **Primary SDG:** SDG 11: Sustainable Cities & Communities

### Slide 2: The Problem: Urban Grievance Paralysis
- Unstructured citizen complaints (vernacular text, blurry photos, approximate landmarks).
- Traditional municipal portals act as passive ticketing systems.
- High-severity hazards buried under routine tickets; lack of geographic hotspot visibility.

### Slide 3: The Solution: CivicSense AI
- Multimodal civic triage pipeline: Text NLP + CLIP Vision + Deterministic Severity Engine.
- Real-time geospatial clustering using DBSCAN.
- Transparent Explainable AI (XAI) dossier for municipal engineers.

### Slide 4: Co-Development with IBM BOB
- **Ideation:** Scope deconstruction, 6-factor severity rubric, GWMC ontology design.
- **Development:** FastAPI architecture, SODA API integration, Haversine spatial clustering.
- **Execution:** Automated testing, code refactoring, and documentation artifacts.

### Slide 5: System Architecture & Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Leaflet Maps, Recharts.
- **Backend:** FastAPI (Python 3.11+), REST APIs.
- **AI/ML:** Scikit-Learn (TF-IDF + Logistic Regression), CLIP Zero-Shot Vision, SBERT.
- **Data & Storage:** Real NYC 311 Benchmark Dataset + SQLite / Supabase PostgreSQL.

### Slide 6: Localization for GWMC Warangal
- Configured specifically for Greater Warangal Municipal Corporation (GWMC).
- Real landmarks: Hanamkonda Rythu Bazar, NIT Warangal Gate, Kakatiya University, MGM Hospital Road, Kazipet Junction.
- Mapped to official GWMC wings (Solid Waste, Engineering, Mission Bhagiratha, Electrical, etc.).

### Slide 7: Live Real-World Data Pipeline
- Real-time Socrata SODA API consumer pulling live complaints from open data streams.
- Instant ticket deduplication and automated AI triage.

### Slide 8: Live Demonstration & UI Walkthrough
- Overview Dashboard (KPIs, category distribution, severity charts).
- Citizen Report & AI Sandbox (text + image input with instant dossier).
- Geospatial Hotspot Map (DBSCAN clusters over Warangal).
- SDG 11 Sustainability Tracking Matrix.

### Slide 9: Sustainability & Impact Metrics
- **SDG 11:** Safe roads (11.2), reduced municipal environmental impact (11.6).
- **SDG 6:** Rapid pipe burst mitigation (Mission Bhagiratha).
- **SDG 13:** Proactive nala maintenance preventing monsoon urban flooding.

### Slide 10: Conclusion & Future Roadmap
- WhatsApp Telugu/Hindi bot integration.
- SMS dispatch to ward sanitation supervisors.
- Full cloud deployment to Supabase & municipal smart city control rooms.

---

## Part 2: 5-Minute Video Demonstration Script

### [0:00 - 0:45] Introduction & Motivation
*"Hello everyone and respected evaluators. I am excited to present **CivicSense AI**, an AI-Powered Civic Issue Intelligence and Sustainable Response System built for the 1M1B AI for Sustainability Virtual Internship, in collaboration with IBM SkillsBuild and AICTE.*

*In growing cities like Warangal, municipal corporations like GWMC receive hundreds of civic grievances daily. Citizens report overflowing garbage, dangerous potholes, burst water mains, and flooded roads. However, existing portals treat these as simple flat tickets, leading to triage delays where emergency hazards get lost in the queue.*

*CivicSense AI solves this by transforming unstructured complaints into real-time, explainable, and geo-clustered civic intelligence."*

### [0:45 - 1:30] Role of IBM BOB
*"A central element of this project is our incorporation of **IBM BOB**, IBM's agentic AI development partner available through IBM SkillsBuild.*

*During the **Ideation stage**, IBM BOB helped us design our transparent 6-factor severity scoring rubric and map civic issues to UN Sustainable Development Goals, specifically SDG 11.*

*During the **Development stage**, IBM BOB co-architected our decoupled FastAPI and React 19 architecture, guided the implementation of the DBSCAN geospatial clustering algorithm, and structured our real-time SODA API data sync.*

*During **Execution**, IBM BOB assisted in generating verification test suites and building our Explainable AI dossier."*

### [1:30 - 3:00] Live Technical Walkthrough
*[Screen switches to http://127.0.0.1:5173]*

*"Let's examine the live platform. Here on the **Overview Dashboard**, we have real-time KPIs showing active complaints, critical issues, and resolution metrics tailored for the Greater Warangal Municipal Corporation.*

*Next, let's explore the **Warangal Hotspot Map**. Using DBSCAN clustering on GPS coordinates, CivicSense AI automatically groups related complaints into geographic clusters. For instance, here in Hanamkonda near the Rythu Bazar and Nakkalagutta, the system has flagged a severe solid waste hotspot. Near NIT Warangal and Kazipet bypass, it has clustered multiple road damage reports.*

*Now, let's visit the **Analysis Lab**. When a citizen submits a complaint—for example: 'Mission Bhagiratha drinking water pipeline burst near MGM Hospital road junction'—the AI engine executes a complete triage in milliseconds:*
1. *It classifies the issue under Water Leakage / Sanitation with high confidence.*
2. *It extracts entities like duration and locality.*
3. *It evaluates the 6-factor severity rubric, assigning a transparent score.*
4. *It maps the issue to **SDG 6** and **SDG 11**.*
5. *It automatically routes the ticket to the **GWMC Mission Bhagiratha Water Works Division** with a clear action recommendation."*

### [3:00 - 4:00] Real-Time Data Pipeline & Explainability
*"CivicSense AI is not trained on trivial toy data. It is trained on thousands of real-world 311 complaints and features a **Live NYC 311 Sync** button right in the navigation bar. Clicking this fetches live, real-time civic complaints directly from the Socrata SODA OpenData API, deduplicates them, and triages them into the system.*

*Furthermore, for every complaint, municipal officers can open the **Explainability Modal**. This provides full algorithmic transparency, showing why the AI assigned each severity score, which factors drove the decision, and allowing human-in-the-loop overrides."*

### [4:00 - 5:00] Sustainability Impact & Conclusion
*"By aligning every civic action with UN Sustainable Development Goal 11—Sustainable Cities and Communities—CivicSense AI empowers municipal leaders to track environmental progress, optimize maintenance routes, and build resilient urban infrastructure.*

*Thank you to 1M1B, IBM SkillsBuild, and AICTE for this opportunity to apply artificial intelligence toward tangible, sustainable civic transformation."*
