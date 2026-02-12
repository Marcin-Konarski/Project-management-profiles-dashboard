from typing import Any
from fastapi import HTTPException, status
from fastapi.exceptions import ResponseValidationError
from sqlalchemy.exc import IntegrityError
from psycopg2.errors import UniqueViolation

from ..dependencies import SessionDep


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
