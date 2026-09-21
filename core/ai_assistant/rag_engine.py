"""
CivicSense AI - RAG & LLM Assistant Engine
Handles municipal circular/policy ingestion (PDF/TXT), chunking, semantic retrieval, 
and LLM synthesis using Gemini / OpenAI / Groq.
"""

import os
import re
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional

from database import db

# Supported LLM libraries
try:
    from google import genai
    from google.genai import types as genai_types
    GENAI_NEW_AVAILABLE = True
except ImportError:
    GENAI_NEW_AVAILABLE = False

try:
    import google.generativeai as legacy_genai
    LEGACY_GENAI_AVAILABLE = True
except ImportError:
    LEGACY_GENAI_AVAILABLE = False

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False


def extract_text_from_file(file_path: Path) -> str:
    """Extracts raw text from PDF or TXT files."""
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        if not PYPDF_AVAILABLE:
            raise RuntimeError("pypdf library not available. Please install pypdf.")
        reader = pypdf.PdfReader(str(file_path))
        text = []
        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                text.append(f"[Page {page_idx + 1}]\n{page_text.strip()}")
        return "\n\n".join(text)
    else:
        # Assume text file
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()


def chunk_text(text: str, chunk_size: int = 600, chunk_overlap: int = 100) -> List[str]:
    """Splits long text into overlapping chunks for semantic retrieval."""
    paragraphs = re.split(r'\n\s*\n', text)
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current_chunk) + len(para) <= chunk_size:
            current_chunk += ("\n\n" if current_chunk else "") + para
        else:
            if current_chunk:
                chunks.append(current_chunk)
            # If paragraph itself is longer than chunk_size, split by sentences
            if len(para) > chunk_size:
                sentences = re.split(r'(?<=[.?!])\s+', para)
                sub_chunk = ""
                for sent in sentences:
                    if len(sub_chunk) + len(sent) <= chunk_size:
                        sub_chunk += (" " if sub_chunk else "") + sent
                    else:
                        if sub_chunk:
                            chunks.append(sub_chunk)
                        sub_chunk = sent
                if sub_chunk:
                    chunks.append(sub_chunk)
                current_chunk = ""
            else:
                current_chunk = para

    if current_chunk:
        chunks.append(current_chunk)

    return chunks if chunks else [text[:chunk_size]]


def ingest_document(file_path: Path, title: Optional[str] = None) -> Dict[str, Any]:
    """
    Ingests a municipal guideline or circular file into the RAG knowledge base.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    filename = file_path.name
    doc_title = title or file_path.stem.replace("_", " ").title()
    file_type = file_path.suffix.lower().replace(".", "")

    raw_text = extract_text_from_file(file_path)
    if not raw_text.strip():
        raise ValueError("Could not extract any text from the uploaded document.")

    chunks = chunk_text(raw_text)
    preview = raw_text[:250].replace("\n", " ").strip() + "..."

    doc_id = f"DOC-{str(uuid.uuid4())[:8].upper()}"
    db.insert_rag_document(
        doc_id=doc_id,
        title=doc_title,
        filename=filename,
        file_type=file_type,
        chunk_count=len(chunks),
        preview=preview
    )

    for idx, chunk in enumerate(chunks):
        db.insert_rag_chunk(
            doc_id=doc_id,
            chunk_index=idx,
            content=chunk,
            metadata=json_meta({"filename": filename, "title": doc_title, "chunk": idx})
        )

    return {
        "document_id": doc_id,
        "title": doc_title,
        "filename": filename,
        "chunks_indexed": len(chunks),
        "preview": preview
    }


def json_meta(d: dict) -> str:
    import json
    return json.dumps(d)


def retrieve_relevant_chunks(query: str, top_k: int = 4) -> List[Dict[str, Any]]:
    """
    Retrieves the most relevant knowledge chunks for a query using TF-IDF / term overlap.
    """
    chunks = db.get_all_rag_chunks()
    if not chunks:
        return []

    # Simple and fast BM25 / token overlap scoring
    query_tokens = set(re.findall(r'\w+', query.lower()))
    scored_chunks = []

    for c in chunks:
        content = c["content"]
        content_tokens = re.findall(r'\w+', content.lower())
        if not content_tokens:
            continue

        match_count = sum(1 for t in query_tokens if t in content_tokens)
        if match_count > 0:
            score = match_count / (len(content_tokens) ** 0.3)
            scored_chunks.append((score, c))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored_chunks[:top_k]]


def check_complaint_status_in_query(query: str) -> Optional[Dict[str, Any]]:
    """Checks if the user query contains a ticket ID and retrieves real-time status."""
    match = re.search(r'(GWMC-\d+-[A-Z0-9]+|CS-\d+-[A-Z0-9]+)', query.upper())
    if match:
        ticket_id = match.group(1)
        return db.get_complaint_by_ticket(ticket_id)
    return None


def generate_llm_response(prompt: str, context_chunks: List[Dict[str, Any]], 
                          ticket_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Queries the configured LLM (Gemini or fallback) grounded in municipal knowledge.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    
    # Format grounding context
    context_str = ""
    sources = []
    if context_chunks:
        context_str = "\n\n---\n\n".join([f"[Source: Document Chunk {c.get('chunk_index', 0)}]\n{c['content']}" for c in context_chunks])
        sources = list(set([c.get("document_id", "Municipal Policy") for c in context_chunks]))

    ticket_str = ""
    if ticket_info:
        ticket_str = f"""
Official Grievance Record:
- Ticket ID: {ticket_info.get('ticket_id')}
- Current Status: {ticket_info.get('status', 'Pending').upper()}
- Issue Category: {ticket_info.get('issue_category', 'Under Assessment')}
- Assigned Department: {ticket_info.get('department', 'Pending Assignment')}
- Assigned Officer: {ticket_info.get('assigned_officer_name') or 'Not yet assigned'}
- Submitted Date: {ticket_info.get('submitted_at', 'Recently')}
- Officer Notes: {ticket_info.get('officer_notes') or 'None'}
"""

    system_instruction = (
        "You are CivicSense AI, the official intelligent municipal assistant for Greater Warangal Municipal Corporation (GWMC).\n"
        "Your mission is to help citizens and administrators with civic grievances, municipal guidelines, water supply timings, "
        "waste segregation policies, and Sustainable Development Goal (SDG 11) indicators.\n"
        "Always be polite, concise, factual, and strictly cite the provided official municipal context when available.\n"
        "If a ticket record is provided, summarize its status transparently."
    )

    full_prompt = f"""
{system_instruction}

Official Municipal Context:
{context_str if context_str else 'No specific municipal circulars uploaded yet.'}

{ticket_str}

Citizen / Officer Inquiry:
{prompt}

Provide a helpful, structured response:
"""

    # 1. Attempt Gemini via modern google-genai
    if api_key and GENAI_NEW_AVAILABLE:
        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=full_prompt,
            )
            return {
                "answer": response.text,
                "model": "gemini-2.5-flash",
                "sources": sources,
                "ticket_found": ticket_info is not None
            }
        except Exception as e:
            print(f"[LLM] Error with google.genai: {e}")

    # 2. Attempt legacy google.generativeai
    if api_key and LEGACY_GENAI_AVAILABLE:
        try:
            legacy_genai.configure(api_key=api_key)
            model = legacy_genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(full_prompt)
            return {
                "answer": response.text,
                "model": "gemini-1.5-flash",
                "sources": sources,
                "ticket_found": ticket_info is not None
            }
        except Exception as e:
            print(f"[LLM] Error with legacy_genai: {e}")

    # 3. Intelligent fallback if LLM API key not set
    if ticket_info:
        answer = (
            f"Here is the verified status for Ticket **{ticket_info.get('ticket_id')}**:\n\n"
            f"• **Status:** {ticket_info.get('status', 'Pending').upper()}\n"
            f"• **Category:** {ticket_info.get('issue_category', 'Civic Grievance')}\n"
            f"• **Assigned Department:** {ticket_info.get('department', 'GWMC General Services')}\n"
            f"• **Assigned Officer:** {ticket_info.get('assigned_officer_name') or 'Under Zonal Triage'}\n"
            f"• **Location:** {ticket_info.get('location_text', 'Warangal Zone')}\n\n"
            f"To enable conversational generative synthesis, configure your `GEMINI_API_KEY` in `.env`."
        )
    elif context_chunks:
        best_chunk = context_chunks[0]["content"]
        answer = (
            f"Based on the official municipal records:\n\n"
            f"> {best_chunk}\n\n"
            f"*(Connect a `GEMINI_API_KEY` in `.env` or the Admin panel for full generative responses.)*"
        )
    else:
        answer = (
            "Welcome to **CivicSense AI**! I am your municipal assistant for Greater Warangal Municipal Corporation (GWMC).\n\n"
            "You can ask me to:\n"
            "1. **Check grievance status:** Type your ticket ID (e.g. `GWMC-20260918-XXXX`).\n"
            "2. **Ask about civic services:** Garbage segregation, Mission Bhagiratha drinking water supply, road repairs, and nala cleaning.\n"
            "3. **Learn about SDG 11:** Sustainable Cities & Communities metrics.\n\n"
            "*(Admin can upload official policy PDFs in the Admin Console to augment my knowledge base!)*"
        )

    return {
        "answer": answer,
        "model": "grounded-retriever-rule-engine",
        "sources": sources,
        "ticket_found": ticket_info is not None
    }
