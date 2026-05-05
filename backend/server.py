from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
SUPABASE_BASE = "https://meptylhwvcjtaegmjzpr.supabase.co/functions/v1/make-server-83920fb2"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcHR5bGh3"
    "dmNqdGFlZ21qenByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjA2OTgsImV4cCI6MjA5MjAzNjY5O"
    "H0.Q6g4nqvAdhBX6aA5b7Kd9gnSnQQIw1I8XqzYi5ao0x4"
)
DEFAULT_MODEL = ("openai", "gpt-4o-mini")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")


class ChatHistoryItem(BaseModel):
    role: str
    content: str


class AIChatRequest(BaseModel):
    message: str
    constituency: Optional[str] = None
    history: List[ChatHistoryItem] = Field(default_factory=list)
    session_id: Optional[str] = None


class AIChatResponse(BaseModel):
    reply: str
    constituency: Optional[str] = None
    session_id: str


class TaxInsightRequest(BaseModel):
    constituency: str


class TaxInsightResponse(BaseModel):
    insight: str
    constituency: str


# ── Supabase helpers ─────────────────────────────────────────────────────────
async def supabase_get(path: str) -> Optional[Dict[str, Any]]:
    url = f"{SUPABASE_BASE}{path}"
    headers = {"Authorization": f"Bearer {SUPABASE_ANON_KEY}"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url, headers=headers)
            if r.status_code == 200:
                return r.json()
            logger.warning("Supabase GET %s -> %s", path, r.status_code)
            return None
    except Exception as e:
        logger.warning("Supabase GET %s failed: %s", path, e)
        return None


async def build_constituency_context(constituency: str) -> str:
    mla = await supabase_get(f"/mla?constituency={constituency}")
    if not mla:
        return (
            "You are an AI assistant for AP Civic Tracker covering all 175 constituencies "
            "in Andhra Pradesh, India. The user did not select a valid constituency. Help "
            "them generally with civic accountability, MLA performance, and government schemes. "
            "Use rupees (INR). Keep answers under 150 words."
        )

    projects = mla.get("projects") or []
    promises = mla.get("promises") or []
    news = mla.get("news") or []

    total_budget = sum(p.get("allocated_amount", 0) for p in projects)
    total_spent = sum(p.get("spent_amount", 0) for p in projects)
    completed = sum(1 for p in projects if p.get("status") == "Completed")
    delayed = sum(1 for p in projects if p.get("status") == "Delayed")
    efficiency = round((total_spent / total_budget) * 100) if total_budget > 0 else 0

    headlines = "; ".join(f'"{n.get("title")}" ({n.get("sentiment")})' for n in news[:5])
    promise_lines = "; ".join(
        f"{p.get('description')} [{p.get('status') or 'Pending'}]" for p in promises[:5]
    )
    project_examples = "; ".join(
        f"{p.get('name')} — {p.get('status')} ({round(p.get('spent_amount', 0) / max(p.get('allocated_amount', 1), 1) * 100)}% spent)"
        for p in projects[:5]
    )

    return f"""You are an AI assistant for AP Civic Tracker, a civic accountability platform for Andhra Pradesh, India.

CONSTITUENCY CONTEXT — {mla.get('constituency')}:
- MLA: {mla.get('name')} ({mla.get('party')}), {mla.get('district')} District
- Total Projects: {len(projects)} ({completed} completed, {delayed} delayed)
- Budget Allocated: ₹{total_budget / 10000000:.1f} Cr | Spent: ₹{total_spent / 10000000:.1f} Cr | Efficiency: {efficiency}%
- Score: {mla.get('score')} | Rank: {mla.get('rank') or 'N/A'}

Recent News Headlines: {headlines}

Party Promises ({mla.get('party')}): {promise_lines}

Project Examples: {project_examples}

Answer questions about this constituency clearly and helpfully. Connect questions about roads, water, health and education to the actual data above. Be conversational, empathetic, and fact-based. Use ₹ for currency. Keep answers under 150 words."""


# ── Routes ────────────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "Civic Accountability backend is running"}


@api_router.get("/health")
async def health():
    return {"status": "ok", "llm_key_configured": bool(EMERGENT_LLM_KEY)}


@api_router.post("/ai/chat", response_model=AIChatResponse)
async def ai_chat(req: AIChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

    session_id = req.session_id or f"civic-{uuid.uuid4()}"
    constituency = (req.constituency or "").strip()

    if constituency:
        system_message = await build_constituency_context(constituency)
    else:
        system_message = (
            "You are an AI assistant for AP Civic Tracker covering all 175 constituencies "
            "in Andhra Pradesh, India. Help citizens understand civic accountability, "
            "government schemes, MLA performance, and public spending. Be helpful and "
            "concise. Use ₹ for currency. Keep answers under 150 words."
        )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message,
    ).with_model(*DEFAULT_MODEL)

    # Note: For low per-request cost, we rely on the system message + the latest
    # user message and skip replaying full history. The library tracks each
    # session independently, so we simply send the new message.

    try:
        reply = await chat.send_message(UserMessage(text=req.message))
    except Exception as e:
        logger.exception("AI chat error")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    return AIChatResponse(
        reply=str(reply),
        constituency=constituency or None,
        session_id=session_id,
    )


@api_router.post("/ai/tax-insight", response_model=TaxInsightResponse)
async def tax_insight(req: TaxInsightRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

    constituency = req.constituency.strip()
    if not constituency:
        raise HTTPException(status_code=400, detail="constituency is required")

    tax = await supabase_get(f"/tax-area?constituency={constituency}")
    if not tax:
        raise HTTPException(status_code=404, detail=f"Constituency not found: {constituency}")

    mla = tax.get("mla", {})
    s = tax.get("summary", {})
    total_alloc_cr = (s.get("totalAllocated", 0)) / 10000000
    total_spent_cr = (s.get("totalSpent", 0)) / 10000000
    unused_cr = (s.get("unusedFunds", 0)) / 10000000

    prompt = f"""You are summarising constituency budget data for {mla.get('constituency')}, AP, India.
MLA: {mla.get('name')} ({mla.get('party')})
Total Projects: {s.get('totalProjects')} | Completed: {s.get('completed')} | Delayed: {s.get('delayed')} | Not Started: {s.get('notStarted')}
Budget: ₹{total_alloc_cr:.1f} Cr allocated, ₹{total_spent_cr:.1f} Cr spent ({s.get('efficiency')}% efficiency)
Unused Funds: ₹{unused_cr:.1f} Cr

Write a 2-sentence citizen-friendly insight about how their tax money is being used in this constituency. Mention key positives and concerns. Be factual and neutral. Use ₹."""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"tax-{uuid.uuid4()}",
        system_message="You are a civic data analyst writing brief summaries for citizens.",
    ).with_model(*DEFAULT_MODEL)

    try:
        reply = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        logger.exception("Tax insight error")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    return TaxInsightResponse(insight=str(reply), constituency=mla.get("constituency", constituency))


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
