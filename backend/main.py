from contextlib import asynccontextmanager
from fastapi import FastAPI

from .db.database import init_db
from .core.config import config
from .routers import users, projects


# Init database before the app runs 
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield 

app = FastAPI(title=config.app_name, lifespan=lifespan)


app.include_router(users.router)
app.include_router(projects.router)


@app.get("/")
async def root():
    return {"message": "This is a Project Management Dashboard Application"}