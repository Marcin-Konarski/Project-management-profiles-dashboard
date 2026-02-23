from uuid import UUID
from pydantic import BaseModel, Field
from typing import Annotated

from ..custom_types import Name



class DocumentBase(BaseModel):
    name: Name
    storage_key: Annotated[str, Field(min_length=1)] # TODO: Adjust this value to actual AWS key
    size: Annotated[int, Field(gt=0)]

class DocumentRequest(BaseModel):
    documents: list[DocumentBase]

class DocumentResponse(DocumentBase):
    id: UUID
    project_id: UUID

    model_config = {
        "from_attributes": True
    }

class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    count: int