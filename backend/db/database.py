from sqlmodel import SQLModel, create_engine

from ..core.config import config
from .. import models # One needs to import models to the memory in order for SQLModel to create those tables

engine = create_engine(config.db_url, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)
