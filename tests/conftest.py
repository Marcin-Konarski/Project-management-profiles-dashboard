import os
import sys
from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient
from pytest_mock import MockerFixture
from sqlmodel import Session

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.core.security import get_user_and_session
from backend.db.session import get_session
from backend.models.user import User


@pytest.fixture
def mock_session(mocker: MockerFixture) -> MagicMock:
    return mocker.MagicMock(spec=Session)


@pytest.fixture
def fake_user() -> MagicMock:
    user = MagicMock(spec=User)
    user.id = uuid4()
    user.username = "testuser"
    return user


@pytest.fixture
def make_client(mock_session: MagicMock):
    def _make(router: APIRouter) -> TestClient:
        app = FastAPI()
        app.include_router(router)

        def override_session():
            yield mock_session

        app.dependency_overrides[get_session] = override_session
        return TestClient(app)

    return _make


@pytest.fixture
def make_authenticated_client(mock_session: MagicMock, fake_user: MagicMock):
    def _make(router: APIRouter) -> TestClient:
        app = FastAPI()
        app.include_router(router)

        def override_session():
            yield mock_session

        def override_get_user_and_session():
            return (fake_user, mock_session)

        app.dependency_overrides[get_session] = override_session
        app.dependency_overrides[get_user_and_session] = override_get_user_and_session
        return TestClient(app)

    return _make
