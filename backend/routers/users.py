from typing import Annotated, Any
from fastapi import APIRouter, Body, status

from ..dependencies import SessionDep
from ..db.utility import commit_or_409
from ..schemas.user import UserRequest, UserResponse
from ..models.user import User


router = APIRouter()


# Create user
@router.post("/auth/", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["users"])
def auth_user(user: Annotated[UserRequest, Body()], session: SessionDep) -> Any:
    user_db = User(username=user.username, password=user.password.get_secret_value())
    session.add(user_db)

    commit_or_409(session=session, error_message="Username already exists.")

    session.refresh(user_db)
    return user_db

# Login into service
@router.post("/login/", response_model=UserResponse, status_code=status.HTTP_200_OK, tags=["users"])
def login_user(user: Annotated[User, Body()]) -> Any:
    raise NotImplementedError
    # return user

# # Logout from service
# @router.post("/logout/", status_code=status.HTTP_200_OK, tags=["users"])
# def logout_user():
#     raise NotImplementedError
#     # return

# # Get informations about currently logged in user
# @router.get("/me/", response_model= UserResponse, status_code=status.HTTP_200_OK, tags=["users"])
# def get_user_info() -> Any:
#     raise NotImplementedError
#     # return














#! TODO: Add return types so that FastAPI can validate returned data