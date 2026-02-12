from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Query, Body, Path, status
from sqlmodel import select

from ..dependencies import SessionDep
from ..db.utility import commit_or_409, get_or_404
from ..schemas.project import DocumentBase, ProjectBase, ProjectInfoResponse, ProjectWIthDocuments, ProjectWithDocumentsResponse
from ..models import Project, ProjectUser, Document, Role, User

router = APIRouter()

#! Ensure user permissions! So that only valid users can create projects!
owner_id = UUID("713fc1ee-4255-453f-a00a-89c26034f919")
# owner_id = UUID("ccff8821-cb98-4f06-9968-6333901b2256")

# TODO: fix return types

# Create new project
@router.post("/projects/", response_model=ProjectWithDocumentsResponse, status_code=status.HTTP_201_CREATED, tags=["projects"])
def create_project(project: Annotated[ProjectWIthDocuments, Body()], session: SessionDep) -> Project:
    project_db = Project(name=project.name, description=project.description, owner_id=owner_id)
    project_user_db = ProjectUser(user_id=owner_id, project_id=project_db.id, role=Role.OWNER)
    session.add(project_db)

    print(project_db.id)
    session.add(project_user_db)

    commit_or_409(session, "Project with that name already exists.")

    session.refresh(project_db)
    session.refresh(project_user_db)
    return project_db

# List all projects that a user has access to
@router.get("/projects/", status_code=status.HTTP_200_OK, tags=["projects"]) # TODO: right now there is an error when user id is not valid. Fix that
def list_all_projects(session: SessionDep) -> list[Project]:
    statement = select(Project).join(ProjectUser).where(ProjectUser.user_id == owner_id) # Select all projects that user's id corresponds to user's id from projectuser table 
    return session.exec(statement)

# Return project’s details
@router.get("/project/{project_id}/info", response_model=ProjectInfoResponse, status_code=status.HTTP_200_OK, tags=["projects"])
def get_project_details(project_id: Annotated[UUID, Path()], session: SessionDep) -> ProjectInfoResponse:
    project = get_or_404(session, Project, project_id, "No project with that UUID.") # TODO: actually verify the permissions!
    return project

# Update projects details
@router.put("/project/{project_id}/info", response_model=ProjectInfoResponse, status_code=status.HTTP_201_CREATED, tags=["projects"])
def update_project_details(project_id: Annotated[UUID, Path()], project: Annotated[ProjectBase, Body()], session: SessionDep):
    statement = select(Project).where(Project.id == project_id)
    project_db = session.exec(statement).one()
    project_db.name = project.name
    project_db.description = project.description
    session.add(project_db)
    session.commit()
    session.refresh(project_db)
    return project_db

# Return all of the project's documents
@router.get("/project/{project_id}/documents", status_code=status.HTTP_200_OK, tags=["projects"])
def get_project_documents(project_id: Annotated[UUID, Path()]):
    raise NotImplementedError
    # return

# Upload document/documents for a specific project
@router.post("/project/{project_id}/documents", status_code=status.HTTP_201_CREATED, tags=["projects"])
def upload_documents(project_id: Annotated[UUID, Path()], document: Annotated[DocumentBase, Body()]):
    raise NotImplementedError
    # return

# Download document, if the user has access to the corresponding project
@router.get("/document/{document_id}", status_code=status.HTTP_200_OK, tags=["projects"])
def get_project(document_id: Annotated[UUID, Path()]):
    raise NotImplementedError
    # return

# Update document
@router.put("/document/{document_id}", status_code=status.HTTP_201_CREATED, tags=["projects"])
def update_document(document_id: Annotated[UUID, Path()], document: Annotated[DocumentBase, Body()]):
    raise NotImplementedError
    # return

# Delete document and remove it from the corresponding project
@router.delete("/document/{document_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["projects"])
def delete_document(document_id: Annotated[UUID, Path()]):
    raise NotImplementedError
    # return #! HERE NO RESPONSE BODY!

# Grant access to the project for a specific user
@router.post("/project/{project_id}/invite", status_code=status.HTTP_204_NO_CONTENT, tags=["projects"])
def add_user_to_project(project_id: Annotated[UUID, Path()], user: Annotated[str, Query()], session: SessionDep):
    print(user)
    statement = select(User).where(User.username == user)
    query_user = session.exec(statement).one_or_none()
    print(f"HERE!!! {query_user=}")
    project_user_db = ProjectUser(user_id=query_user.id, project_id=project_id, role=Role.USER)
    session.add(project_user_db)
    commit_or_409(session, "User with this username has already access to this project.")
    session.refresh(project_user_db)
    return # HERE NO RESPONSE BODY!




#! TODO: Add return types so that FastAPI can validate returned data
#! TODO: in the return body for some responses also add the list of users that have access to the project
# https://fastapi.tiangolo.com/tutorial/response-model/