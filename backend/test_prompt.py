import os
from dotenv import load_dotenv
from app.services.promp_builder import load_portfolio, build_chat_messages, build_portfolio_prompt
from app.models.chat import Message

load_dotenv()

portfolio = load_portfolio()

test_queries = [
    ("Greeting", "Hi"),
    ("Overview", "Tell me about Om"),
    ("Specific Project", "Tell me about MEDILOON and its architecture"),
    ("Skills / Tech", "What technologies does Om know for backend and AI?"),
    ("Education", "What is Om's educational background and CGPA?"),
    ("Recruiter Fit", "Why should we hire Om for an AI engineer role?"),
    ("Pronoun Followup", "What was his role in it?"),
]

history_mock = [
    Message(role="user", content="What projects has Om worked on?"),
    Message(role="assistant", content="Om has worked on MEDILOON, EverGallery, and Tadev Lagnam."),
]

print("=" * 60)
print("PORTFOLIO AI - CONTEXT-BASED / INSTANCE-BASED ENGINE TEST")
print("=" * 60)

for label, query in test_queries:
    hist = history_mock if label == "Pronoun Followup" else []
    messages = build_chat_messages(portfolio, query, hist)
    total_chars = sum(len(m["content"]) for m in messages)
    est_tokens = total_chars // 4  # standard ~4 chars per token rule of thumb

    print(f"\n[{label}] Query: '{query}'")
    print(f"  - Message turns: {len(messages)}")
    print(f"  - Total payload chars: {total_chars} (~{est_tokens} tokens)")
    print(f"  - User message preview:\n    {messages[-1]['content'][:140]}...")

# Backwards compatible prompt test
single_prompt = build_portfolio_prompt(portfolio, "Hi", [])
print(f"\n[Backwards Compat] Single prompt char length: {len(single_prompt)} (~{len(single_prompt)//4} tokens)")

# Optional live Groq test if GROQ_API_KEY is available
api_key = (os.getenv("GROQ_API_KEY") or "").strip().strip('"\'')
if api_key:
    from groq import Groq
    client = Groq(api_key=api_key)
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    print(f"\n--- Testing live call with model: {model} ---")
    try:
        messages = build_chat_messages(portfolio, "Hi! Tell me briefly about your background.", [])
        res = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=200,
        )
        print("Success! Response:")
        safe_response = res.choices[0].message.content.encode("ascii", errors="replace").decode("ascii")
        print(safe_response)
    except Exception as e:
        print(f"Live call skipped/error: {type(e).__name__}: {e}")
