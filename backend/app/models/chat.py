from pydantic import BaseModel, Field

class Message (BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    document_ids: list[str] = Field(default_factory=list, max_length=10)

class ChatResponse(BaseModel):
    response: str