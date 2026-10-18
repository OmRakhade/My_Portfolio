import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = (os.getenv("GROQ_API_KEY") or "").strip().strip('"\'')

if not api_key:
    raise RuntimeError(
        "GROQ_API_KEY environment variable is not set. "
        "Add it to backend/.env or your shell before starting the app."
    )

client = Groq(api_key=api_key) 


def generate_response(prompt_or_messages: str | list[dict[str, str]]) -> str:
    if client is None:
        raise RuntimeError(
            "GROQ_API_KEY environment variable is not set. "
            "Add it to backend/.env or your shell before starting the app."
        )

    if isinstance(prompt_or_messages, str):
        messages = [{"role": "user", "content": prompt_or_messages}]
    else:
        messages = prompt_or_messages

    model_name = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    response = client.chat.completions.create(
        model=model_name,
        messages=messages,
    )

    message = response.choices[0].message
    return message.content or ""

