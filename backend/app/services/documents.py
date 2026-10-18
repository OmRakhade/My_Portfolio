import json
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from threading import RLock
from time import monotonic
from uuid import uuid4

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.models.document import DocumentInfo


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PORTFOLIO_PATH = DATA_DIR / "portfolio.json"
SYSTEM_DOCUMENTS_DIR = DATA_DIR / "system_documents"
SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md", ".json"}
MAX_DOCUMENT_BYTES = 12 * 1024 * 1024
MAX_DOCUMENT_TEXT_CHARS = 60_000
MAX_PDF_PAGES = 100
MAX_USER_PDF_PAGES = 10
USER_DOCUMENT_TTL_SECONDS = 30 * 60
MAX_USER_DOCUMENTS = 100


@dataclass(frozen=True)
class DocumentContent:
    id: str
    name: str
    text: str
    source: str


_uploaded_documents: dict[str, tuple[DocumentInfo, DocumentContent, float]] = {}
_documents_lock = RLock()


def _extract_text(
    file_name: str,
    content: bytes,
    *,
    max_pdf_pages: int = MAX_PDF_PAGES,
) -> str:
    if len(content) > MAX_DOCUMENT_BYTES:
        raise ValueError("The document exceeds the 12 MB upload limit.")

    extension = Path(file_name).suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError("Supported documents are PDF, TXT, Markdown, and JSON.")

    try:
        if extension == ".pdf":
            reader = PdfReader(BytesIO(content), strict=False)
            if reader.is_encrypted:
                raise ValueError("Encrypted PDFs are not supported.")
            page_count = len(reader.pages)
            if page_count > max_pdf_pages:
                raise ValueError(
                    f"This PDF is too large: it has {page_count} pages; "
                    f"the maximum allowed is {max_pdf_pages}."
                )
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        elif extension == ".json":
            text = json.dumps(
                json.loads(content.decode("utf-8-sig")),
                ensure_ascii=False,
                indent=2,
            )
        else:
            text = content.decode("utf-8-sig")
    except ValueError:
        raise
    except (PdfReadError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ValueError("The document could not be read or parsed.") from error

    text = text.strip()
    if not text:
        raise ValueError("No selectable text was found in the document.")
    return text[:MAX_DOCUMENT_TEXT_CHARS]


def _summary(text: str) -> str:
    normalized = " ".join(text.split())
    return normalized[:220] + ("..." if len(normalized) > 220 else "")


def _file_type(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        return "pdf"
    if path.suffix.lower() == ".json":
        return "json"
    return "doc"


def _system_paths() -> list[Path]:
    if not SYSTEM_DOCUMENTS_DIR.exists():
        return []
    return sorted(
        path
        for path in SYSTEM_DOCUMENTS_DIR.rglob("*")
        if path.is_file()
        and path.suffix.lower() in SUPPORTED_EXTENSIONS
        and not any(part.startswith(".") for part in path.relative_to(SYSTEM_DOCUMENTS_DIR).parts)
    )


def list_system_documents() -> list[DocumentInfo]:
    portfolio_text = PORTFOLIO_PATH.read_text(encoding="utf-8")
    documents = [
        DocumentInfo(
            id="system:portfolio.json",
            name=PORTFOLIO_PATH.name,
            title=PORTFOLIO_PATH.name,
            category="overview",
            source="backend",
            deletable=False,
            fileType="json",
            summary="Structured profile, skills, projects, and achievements used by the assistant.",
            tags=["Portfolio", "Profile"],
            updatedAt="Backend source",
        )
    ]
    if not portfolio_text.strip():
        return documents

    for path in _system_paths():
        text = _extract_text(path.name, path.read_bytes())
        relative_name = path.relative_to(SYSTEM_DOCUMENTS_DIR).as_posix()
        documents.append(
            DocumentInfo(
                id=f"system:{relative_name}",
                name=path.name,
                title=path.name,
                category="overview",
                source="backend",
                deletable=False,
                fileType=_file_type(path),
                summary=_summary(text),
                tags=["System source"],
                updatedAt="Backend source",
            )
        )
    return documents


def load_system_document_contents() -> list[DocumentContent]:
    documents: list[DocumentContent] = []
    for path in _system_paths():
        relative_name = path.relative_to(SYSTEM_DOCUMENTS_DIR).as_posix()
        documents.append(
            DocumentContent(
                id=f"system:{relative_name}",
                name=relative_name,
                text=_extract_text(path.name, path.read_bytes()),
                source="backend",
            )
        )
    return documents


def _remove_expired_documents(now: float) -> None:
    expired_ids = [
        document_id
        for document_id, (_, _, last_activity) in _uploaded_documents.items()
        if now - last_activity >= USER_DOCUMENT_TTL_SECONDS
    ]
    for document_id in expired_ids:
        _uploaded_documents.pop(document_id, None)


def store_uploaded_document(file_name: str, content: bytes) -> DocumentInfo:
    safe_name = Path(file_name).name
    text = _extract_text(
        safe_name,
        content,
        max_pdf_pages=MAX_USER_PDF_PAGES,
    )
    document_id = f"user:{uuid4().hex}"
    info = DocumentInfo(
        id=document_id,
        name=safe_name,
        title=safe_name,
        category="overview",
        source="user",
        deletable=True,
        fileType=_file_type(Path(safe_name)),
        summary=_summary(text),
        tags=["User document"],
        updatedAt="Uploaded",
    )
    document = DocumentContent(
        id=document_id,
        name=safe_name,
        text=text,
        source="user",
    )

    now = monotonic()
    with _documents_lock:
        _remove_expired_documents(now)
        if len(_uploaded_documents) >= MAX_USER_DOCUMENTS:
            oldest_id = min(
                _uploaded_documents,
                key=lambda item: _uploaded_documents[item][2],
            )
            _uploaded_documents.pop(oldest_id, None)
        _uploaded_documents[document_id] = (info, document, now)
    return info


def get_uploaded_documents(
    document_ids: list[str],
) -> tuple[list[DocumentContent], list[str]]:
    now = monotonic()
    contents: list[DocumentContent] = []
    missing: list[str] = []
    with _documents_lock:
        _remove_expired_documents(now)
        for document_id in dict.fromkeys(document_ids):
            stored = _uploaded_documents.get(document_id)
            if stored is None:
                missing.append(document_id)
                continue
            info, content, _ = stored
            _uploaded_documents[document_id] = (info, content, now)
            contents.append(content)
    return contents, missing