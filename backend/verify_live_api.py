import time
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def post(path, payload):
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

print("=== 1. Testing Health Endpoint ===")
try:
    status, data = get("/health")
    print(f"Health ({status}):", data)
except Exception as e:
    print("Health check failed:", e)

session_id = f"test-verify-{int(time.time())}"

questions = [
    "Hi, who are you?",
    "What projects has Om built?",
    "Tell me about MEDILOON and its architecture",
    "What was his role in that?",
    "Does Om know React and how has he used it?",
]

print(f"\n=== 2. Testing Chat Endpoint with Session: {session_id} ===")
for i, q in enumerate(questions, 1):
    print(f"\n[Turn {i}] User: {q}")
    t0 = time.time()
    try:
        status, data = post("/chat", {"message": q, "session_id": session_id})
        elapsed = time.time() - t0
        ans = data.get("response", "")
        # Safe printing for Windows console
        safe_ans = ans.encode("ascii", errors="replace").decode("ascii")
        print(f"Response ({elapsed:.2f}s):\n{safe_ans}")
    except Exception as e:
        print(f"Request failed: {e}")

print("\n=== Live API Verification Completed ===")
