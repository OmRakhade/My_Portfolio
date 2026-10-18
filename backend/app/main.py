import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.models.portfolio import Portfolio
from app.models.chat import ChatRequest, ChatResponse, Message
from app.models.document import DocumentInfo
from app.services.documents import (
    MAX_DOCUMENT_BYTES,
    get_uploaded_documents,
    list_system_documents,
    load_system_document_contents,
    store_uploaded_document,
)
from app.services.llm import generate_response
from app.services.promp_builder import load_portfolio, build_chat_messages
from app.services.session import add_message, get_history


app = FastAPI()
allowed_origins = [
    origin.strip()
    for origin in (
        os.getenv("FRONTEND_ORIGIN", "http://localhost:3000"),
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    )
    if origin and origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/portfolio", response_model=Portfolio)
def get_portfolio():
    return load_portfolio()


@app.get("/documents", response_model=list[DocumentInfo])
def get_documents():
    return list_system_documents()


@app.post("/documents/upload", response_model=DocumentInfo)
async def upload_document(file: UploadFile = File(...)):
    try:
        content = await file.read(MAX_DOCUMENT_BYTES + 1)
        if len(content) > MAX_DOCUMENT_BYTES:
            raise HTTPException(status_code=413, detail="The document exceeds the 12 MB upload limit.")
        return store_uploaded_document(file.filename or "", content)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    finally:
        await file.close()


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    portfolio = load_portfolio()
    history = get_history(request.session_id)
    user_documents, missing_document_ids = get_uploaded_documents(request.document_ids)
    if missing_document_ids:
        raise HTTPException(
            status_code=410,
            detail="A connected upload expired or is unavailable. Upload it again before sending.",
        )

    messages = build_chat_messages(
        portfolio=portfolio,
        user_message=request.message,
        history=history,
        system_documents=load_system_document_contents(),
        user_documents=user_documents,
    )

    try:
        response = generate_response(messages)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=503,
            detail=f"The AI service error: {exc}",
        ) from exc


    add_message(
        request.session_id,
        Message(
            role="user",
            content=request.message
        )
    )

    add_message(
        request.session_id,
        Message(
            role="assistant",
            content=response
        )
    )

    return ChatResponse(response=response)