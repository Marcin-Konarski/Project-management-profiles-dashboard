from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from backend.models import Document, Project, ProjectUser, Role
from backend.routers.projects import router


@pytest.fixture
def client(make_client) -> TestClient:
    return make_client(router)


@pytest.fixture
def authenticated_client(make_authenticated_client) -> TestClient:
    return make_authenticated_client(router)


@pytest.fixture
def fake_project(fake_user) -> Project:
    return Project(
        id=uuid4(),
        name=f"test-project-{uuid4()}",
        description="Test Description",
        owner_id=fake_user.id,
    )


@pytest.fixture
def fake_project_user(fake_project, fake_user) -> ProjectUser:
    return ProjectUser(
        user_id=fake_user.id,
        project_id=fake_project.id,
        role=Role.OWNER,
    )


@pytest.fixture
def fake_document(fake_project) -> Document:
    return Document(
        id=uuid4(),
        name=f"test-doc-{uuid4()}",
        size=5,
        project_id=fake_project.id,
    )


@pytest.fixture
def fake_project_payload():
    return {
        "name": "Test Project",
        "description": "Test Description",
    }


@pytest.fixture
def fake_document_payload():
    return {"name": "doc1"}
