from typing import Literal

from pydantic import BaseModel


class DocumentInfo(BaseModel):
    id: str
    name: str
    title: str
    category: str
    source: Literal["backend", "user"]
    deletable: bool
    fileType: Literal["pdf", "json", "image", "web", "doc"]
    fileCount: int = 1
    summary: str
    tags: list[str]
    updatedAt: str