from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

from ..custom_types import Name


class DocumentBase(BaseModel):
    name: Name

    model_config = {"from_attributes": True}


class DocumentResponse(DocumentBase):
    id: UUID
    size: int | None = None
    content_type: str | None = None
    status: str
    created_at: datetime
    uploaded_at: datetime | None = None

    model_config = {"from_attributes": True}


class DocumentResponseWithURLs(DocumentResponse):
    presigned_url: dict


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    count: int


class DocumentUploadConfirmRequest(BaseModel):
    document_id: UUID
    size: int = Field(gt=0)
    content_type: str = Field(min_length=1, max_length=255)


class PresignedUrlResponse(BaseModel):
    url: str
