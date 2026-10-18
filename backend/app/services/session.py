from threading import RLock
import time

from app.models.chat import Message


SESSION_TTL_SECONDS = 30 * 60
MAX_HISTORY_MESSAGES = 40

sessions: dict[str, list[Message]] = {}
_last_activity: dict[str, float] = {}
_sessions_lock = RLock()


def _remove_expired_sessions(now: float) -> None:
    expired_sessions = [
        session_id
        for session_id, last_activity in _last_activity.items()
        if now - last_activity >= SESSION_TTL_SECONDS
    ]
    for session_id in expired_sessions:
        sessions.pop(session_id, None)
        _last_activity.pop(session_id, None)


def get_history(session_id: str) -> list[Message]:
    now = time.monotonic()
    with _sessions_lock:
        _remove_expired_sessions(now)
        history = sessions.get(session_id)
        if history is None:
            return []
        _last_activity[session_id] = now
        return list(history)


def add_message(session_id: str, message: Message) -> None:
    now = time.monotonic()
    with _sessions_lock:
        _remove_expired_sessions(now)
        history = sessions.setdefault(session_id, [])
        history.append(message)
        if len(history) > MAX_HISTORY_MESSAGES:
            del history[:-MAX_HISTORY_MESSAGES]
        _last_activity[session_id] = now