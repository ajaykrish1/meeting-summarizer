import os
import logging
import traceback
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlmodel import Session, select
from app.db import get_session
from app.deps import get_provider, get_settings
from app.models import Meeting, Transcript
from app.schemas import TranscriptionResponse
from app.providers.base import BaseProvider

router = APIRouter()

@router.get("/debug/provider")
async def debug_provider(provider: BaseProvider = Depends(get_provider)):
    return {"provider": provider.get_provider_name()}

@router.get("/debug/config")
async def debug_config():
    settings = get_settings()
    return {
        "env_PROVIDER": os.getenv("PROVIDER"),
        "env_OPENAI_present": bool(os.getenv("OPENAI_API_KEY")),
        "settings_provider": settings.provider,
        "settings_openai_present": bool(settings.openai_api_key),
    }

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    meeting_id: int = Query(..., description="Meeting ID to associate transcript with"),
    audio: UploadFile = File(..., description="Audio file to transcribe"),
    session: Session = Depends(get_session),
    provider: BaseProvider = Depends(get_provider)
):
    """Upload and transcribe audio file"""
    # Verify meeting exists
    meeting = session.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check if transcript already exists
    existing_transcript = session.exec(
        select(Transcript).where(Transcript.meeting_id == meeting_id)
    ).first()
    
    if existing_transcript:
        raise HTTPException(status_code=400, detail="Transcript already exists for this meeting")
    
    # Validate file type (accept common fallbacks like application/octet-stream from some browsers/tools)
    content_type = (audio.content_type or "").lower()
    if not (content_type.startswith("audio/") or content_type == "application/octet-stream"):
        raise HTTPException(status_code=400, detail=f"Unsupported content-type: {audio.content_type}")
    
    # Save audio file temporarily
    temp_dir = "temp_audio"
    os.makedirs(temp_dir, exist_ok=True)
    
    temp_path = os.path.join(temp_dir, f"meeting_{meeting_id}_{audio.filename}")
    
    try:
        # Save uploaded file
        async with aiofiles.open(temp_path, "wb") as f:
            content = await audio.read()
            await f.write(content)
        
        # Transcribe using provider
        text = await provider.transcribe(temp_path)
        
        # Calculate duration (very rough: bytes / 32000 approximates seconds for ~32kbps)
        file_size = len(content)
        duration_sec = max(1, int(file_size / 32000))
        
        # Save transcript to database
        transcript = Transcript(
            meeting_id=meeting_id,
            text=text,
            duration_sec=duration_sec
        )
        session.add(transcript)
        session.commit()
        session.refresh(transcript)
        
        return TranscriptionResponse(
            text=text,
            duration_sec=duration_sec
        )
        
    except Exception as e:
        logging.error("Transcription error with provider %s: %s\n%s", getattr(provider, "get_provider_name", lambda: "unknown")(), str(e), traceback.format_exc())
        prov = getattr(provider, "get_provider_name", lambda: "unknown")()
        raise HTTPException(status_code=500, detail=f"Transcription failed ({prov}): {str(e)}")
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
