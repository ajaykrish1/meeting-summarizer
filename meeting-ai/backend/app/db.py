from sqlmodel import SQLModel, create_engine, Session
from app.deps import get_settings

settings = get_settings()

engine = create_engine(
    settings.db_url,
    echo=settings.debug,
    connect_args={"check_same_thread": False} if "sqlite" in settings.db_url else {}
)

def create_all():
    """Create all database tables"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session
