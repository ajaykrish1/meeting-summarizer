from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db import create_all
from app.routers import meetings, transcribe, summarize, actions
from app.deps import get_provider, get_settings
from app.providers.base import BaseProvider
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_all()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Meeting Summarizer API",
    description="AI-powered meeting transcription, summarization, and action tracking",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(meetings.router, prefix="/api", tags=["meetings"])
app.include_router(transcribe.router, prefix="/api", tags=["transcribe"])
app.include_router(summarize.router, prefix="/api", tags=["summarize"])
app.include_router(actions.router, prefix="/api", tags=["actions"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "meeting-summarizer-api"}

@app.get("/api/debug/provider")
async def debug_provider_root(provider: BaseProvider = Depends(get_provider)):
    return {"provider": provider.get_provider_name()}

@app.get("/api/debug/settings")
async def debug_settings():
    settings = get_settings()
    return {
        "provider_env": os.getenv("PROVIDER"),
        "openai_env_present": bool(os.getenv("OPENAI_API_KEY")),
        "settings_provider": settings.provider,
        "settings_openai_present": bool(settings.openai_api_key),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
