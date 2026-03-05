from datetime import datetime, timedelta, timezone
from typing import Annotated, Tuple
from uuid import UUID

import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash

from .config import config
from .dependencies import SessionDep
from .schemas.users import TokenData
from .models import User


password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# password encoding, decoding
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


# jwt token encoding, decoding
def create_access_token(token_data: TokenData) -> str:
    payload = token_data.model_dump()

    # add expire timestamp
    payload["exp"] = int(
        (
            datetime.now(timezone.utc)
            + timedelta(minutes=config.access_token_expire_minutes)
        ).timestamp()
    )

    return jwt.encode(payload, config.secret_key, algorithm=config.jwt_algorithm)


CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials.",
    headers={"WWW-Authenticate": "Bearer"},
)


def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(
            token, config.secret_key, algorithms=[config.jwt_algorithm]
        )
    except (InvalidTokenError, ExpiredSignatureError):
        raise CREDENTIALS_EXCEPTION

    # user id should be present
    user_id = payload.get("user_id")
    if user_id is None:
        raise CREDENTIALS_EXCEPTION

    return TokenData(user_id=user_id)


def get_user_and_session(
    token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep
) -> Tuple[User, SessionDep]:
    token_data = decode_token(token)

    try:
        user_id = UUID(token_data.user_id)
    except ValueError:
        raise CREDENTIALS_EXCEPTION

    user = session.get(User, user_id)
    if user is None:
        raise CREDENTIALS_EXCEPTION

    return user, session
