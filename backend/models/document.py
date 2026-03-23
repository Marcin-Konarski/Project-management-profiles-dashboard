from typing import TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlmodel import SQLModel, Field, Relationship


if TYPE_CHECKING:
    from .project import Project


class DocumentStatus(str, PyEnum):
    PENDING = "pending"  # After object is created in DB but not yet uploaded to AWS S3
    UPLOADED = "uploaded"  # After object is uploaded to AWS S3
    FAILED = "failed"  # If upload failed


class Document(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    size: int | None = None
    content_type: str | None = None
    status: DocumentStatus = Field(default=DocumentStatus.PENDING)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    uploaded_at: datetime | None = None

    project_id: UUID = Field(
        foreign_key="project.id"
    )  # If a project is deleted than documents are deleted as well so there is no point in setting `ondelete` here
    project: "Project" = Relationship(back_populates="documents")
