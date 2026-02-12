from uuid import UUID, uuid4
from typing import Annotated
from pydantic import BaseModel, Field

from ..custom_types import Name

class DocumentBase(BaseModel):
    file_name: Name


class ProjectBase(BaseModel):
    name: Name
    description: Annotated[str, Field(max_length=200)] | None = None


class ProjectInfoResponse(ProjectBase):
    id: UUID


class ProjectWIthDocuments(ProjectBase):
    documents: list[DocumentBase] | None = Field(default_factory=lambda: list)


class ProjectWithDocumentsResponse(ProjectWIthDocuments):
    id: UUID