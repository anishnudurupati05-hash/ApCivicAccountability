from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

app = FastAPI()
api_router = APIRouter(prefix="/api")


class ChatHistoryItem(BaseModel):
    role: str
    content: str


class AIChatRequest(BaseModel):
    message: str
    system_context: Optional[str] = None
    history: List[ChatHistoryItem] = Field(default_factory=list)
    session_id: Optional[str] = None


class AIChatResponse(BaseModel):
    reply: str
    session_id: str


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

    session_id = req.session_id or str(uuid.uuid4())
    system_message = req.system_context or (
        "You are an AI assistant for AP Civic Tracker, a civic accountability platform "
        "covering all 175 constituencies in Andhra Pradesh, India. Help citizens understand "
        "MLA performance, government schemes, public spending, projects, and promises. "
        "Be conversational, empathetic, and fact-based. Use rupees (INR) for currency. "
        "Keep answers under 150 words."
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    # Replay history so the model has context (library tracks per-session, but we use fresh
    # session for each request to ensure stateless behavior).
    for item in req.history[-6:]:
        if item.role == "user":
            await chat.send_message(UserMessage(text=item.content))
        # assistant messages can't be sent through the lib in this minimal flow; the
        # library auto-appends its own replies. So we only replay user prompts so the
        # context window contains them. For better fidelity we let the latest message
        # carry the actual question.

    try:
        reply = await chat.send_message(UserMessage(text=req.message))
    except Exception as e:
        logger.exception("AI chat error")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    return AIChatResponse(reply=str(reply), session_id=session_id)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)
