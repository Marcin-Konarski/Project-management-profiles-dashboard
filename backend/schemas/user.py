from uuid import UUID
from typing import Annotated
from pydantic import BaseModel, SecretStr, Field

from ..custom_types import Name


class UserBase(BaseModel):
    username: Name

    model_config = {
        "from_attributes": True
    }


class UserRequest(UserBase):
    password: Annotated[SecretStr, Field(min_length=8, max_length=50)] # TODO: Deal with hasing passwords in some way


class UserResponse(UserBase):
    id: UUID