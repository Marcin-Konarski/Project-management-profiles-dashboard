from uuid import UUID
from typing import Annotated
from pydantic import BaseModel, Field

from ..custom_types import Name
from .document import DocumentBase
from .user import UserResponse


class ProjectBase(BaseModel):
    name: Name
    description: Annotated[str, Field(max_length=200)] | None = None


class ProjectInfoResponse(BaseModel):
    id: UUID
    name: Name
    description: Annotated[str, Field(max_length=200)] | None
    owner_id: UUID

    model_config = {
        "from_attributes": True
    }


class ProjectInfoWithDocumentsResponse(ProjectInfoResponse):
    documents: list[DocumentBase]


class ProjectInfoWithUsersResponse(ProjectInfoResponse):
    users: list[UserResponse]


class ProjectsListResponse(BaseModel):
    projects: list[ProjectInfoWithDocumentsResponse]


class ProjectWIthDocuments(ProjectBase):
    documents: list[DocumentBase] | None = Field(default_factory=list)


class ProjectWithDocumentsResponse(ProjectWIthDocuments):
    id: UUID

