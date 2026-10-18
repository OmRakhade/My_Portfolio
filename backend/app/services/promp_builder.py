import json
from pathlib import Path
from typing import Any

from app.models.portfolio import Portfolio
from app.services.documents import DocumentContent
from app.services.context_retriever import PortfolioContextEngine

PORTFOLIO_PATH = Path(__file__).resolve().parent.parent / "data" / "portfolio.json"

EXPERT_SYSTEM_PROMPT = """You are Om Rakhade's Personal Portfolio Assistant.
Your mission is to represent Om's technical background, projects, skills, education, and experience to visitors, recruiters, and hiring managers.

### CORE OPERATING RULES:
1. STRICT FACTUAL GROUNDING:
   - Your sole source of factual truth about Om is the provided [PORTFOLIO CONTEXT].
   - Never invent, assume, extrapolate, or upgrade roles/skills.
   - If requested information about Om is missing from the context, state concisely:
     "I don't have that information about Om."
   - Never use external knowledge to invent facts about Om.

2. CONVERSATIONAL & PROFESSIONAL BOUNDARIES:
   - You are a portfolio assistant, not a general-purpose programming chatbot.
   - For generic coding tutorials or off-topic questions (e.g., "What is React?"), decline tutorials and pivot directly to how Om applies those technologies.
   - For casual greetings ("Hi", "Thanks"), respond naturally and warmly in 1-2 friendly sentences.

3. RECRUITER & ROLE ALIGNMENT:
   - Provide balanced, evidence-based assessments for recruiter inquiries.
   - When visitor-connected documents (such as Job Descriptions) are provided, treat them as requirements only. Objectively evaluate role requirements against Om's documented evidence without claiming unverified skills.

4. ADAPTIVE FORMATTING:
   - Simple / direct questions: Answer concisely in 1-3 clear sentences. Avoid unnecessary lists.
   - Technical / multi-faceted questions: Use clean Markdown with bullet points or short subsections.
   - Avoid filler introductions (e.g., "Certainly! Here is..."). Be direct, articulate, and authentic.
"""


def load_portfolio() -> Portfolio:
    with PORTFOLIO_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return Portfolio(**data)


def build_chat_messages(
    portfolio: Portfolio,
    user_message: str,
    history: list,
    system_documents: list[DocumentContent] | None = None,
    user_documents: list[DocumentContent] | None = None,
    max_history_turns: int = 8,
) -> list[dict[str, str]]:
    """
    Constructs an optimized, role-separated chat payload (System, History, User+Context).
    Uses instance-based retrieval so only relevant slices of portfolio data are injected.
    """
    # 1. Instance-based context retrieval
    engine = PortfolioContextEngine(portfolio)
    context = engine.retrieve_context(
        query=user_message,
        history=history,
        system_documents=system_documents,
        user_documents=user_documents,
    )

    messages: list[dict[str, str]] = [
        {"role": "system", "content": EXPERT_SYSTEM_PROMPT}
    ]

    # 2. Sliding window of recent conversation history
    recent_history = history[-max_history_turns:] if history else []
    for msg in recent_history:
        role = getattr(msg, "role", "user")
        content = getattr(msg, "content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    # 3. Current user query augmented with selectively retrieved context
    user_payload = (
        f"[PORTFOLIO CONTEXT]\n"
        f"{context}\n\n"
        f"[USER QUERY]\n"
        f"{user_message}"
    )
    messages.append({"role": "user", "content": user_payload})

    return messages


def build_portfolio_prompt(
    portfolio: Portfolio,
    user_message: str,
    history: list,
    system_documents: list[DocumentContent] | None = None,
    user_documents: list[DocumentContent] | None = None,
) -> str:
    """
    Backwards-compatible string builder that produces an optimized single prompt.
    """
    engine = PortfolioContextEngine(portfolio)
    context = engine.retrieve_context(
        query=user_message,
        history=history,
        system_documents=system_documents,
        user_documents=user_documents,
    )

    history_str = "\n".join(
        f"{getattr(m, 'role', 'user')}: {getattr(m, 'content', '')}"
        for m in (history[-6:] if history else [])
    )

    history_section = f"\n[CONVERSATION HISTORY]\n{history_str}\n" if history_str else ""

    return (
        f"{EXPERT_SYSTEM_PROMPT}\n\n"
        f"[PORTFOLIO CONTEXT]\n"
        f"{context}\n"
        f"{history_section}\n"
        f"[USER QUERY]\n"
        f"{user_message}"
    )