from typing import Annotated
from fastapi import APIRouter, Body, status, HTTPException

from ..db.session import SessionDep
from ..models import Document, DocumentStatus
from ..schemas.document import DocumentUploadConfirmRequest, DocumentResponse
from datetime import datetime, timezone


router = APIRouter(prefix="/internal", tags=["internal"])


@router.post(
    "/documents/upload-confirm",
    response_model=DocumentResponse,
    status_code=status.HTTP_200_OK,
)
def confirm_document_upload(
    payload: Annotated[DocumentUploadConfirmRequest, Body()],
    session: SessionDep,
):
    document = session.get(Document, payload.document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found."
        )

    document.size = payload.size
    document.content_type = payload.content_type
    document.status = DocumentStatus.UPLOADED
    document.uploaded_at = datetime.now(timezone.utc)

    session.add(document)
    session.commit()
    session.refresh(document)

    return document
