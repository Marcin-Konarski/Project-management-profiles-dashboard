from typing import Any
from fastapi import HTTPException, status
from sqlmodel import select
from sqlalchemy.exc import IntegrityError
from psycopg2.errors import UniqueViolation

from ..dependencies import SessionDep
from ..models import User


def commit_or_409(session: SessionDep, error_message: str):
    try:
        session.commit()
    except IntegrityError as e:
        session.rollback()

        if isinstance(e.orig, UniqueViolation):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=error_message)
        raise

def get_or_404(session: SessionDep, model: Any, pk: Any, error_message: str):
    obj = session.get(model, pk)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_message)

    return obj

def get_user_by_username(session: SessionDep, username: str) -> User:
    statement = select(User).where(User.username == username)
    user = session.exec(statement).one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials.")
    return user


