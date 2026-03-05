from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import IntegrityError

from ..dependencies import SessionDep
from ..models.user import User
from ..auth import get_password_hash, verify_password, create_access_token
from ..db.utility import get_user_by_username
from ..schemas.users import SignupRequest, LoginRequest, AuthResponse, TokenData


router = APIRouter()


@router.post("/signup", status_code=status.HTTP_201_CREATED, tags=["users"])
def signup(body: SignupRequest, session: SessionDep) -> AuthResponse:
    # create user entry
    user = User(username=body.username, password=get_password_hash(body.password))

    # insert user entry
    session.add(user)
    try:
        # try committing (can fail because username must be unique)
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists.",
        )
    # refresh user object with actual db data
    session.refresh(user)

    access_token = create_access_token(TokenData(user_id=str(user.id)))

    return AuthResponse(access_token=access_token, username=user.username)


@router.post("/login", status_code=status.HTTP_200_OK, tags=["users"])
def login(body: LoginRequest, session: SessionDep) -> AuthResponse:
    # find user by username (raises 404 if not found)
    user = get_user_by_username(session, body.username)

    # verify password
    if not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    # generate jwt token
    access_token = create_access_token(TokenData(user_id=str(user.id)))

    return AuthResponse(access_token=access_token, username=user.username)
