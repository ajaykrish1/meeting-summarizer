from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.db import get_session
from app.deps import get_provider
from app.models import Meeting, Transcript, Summary, ActionItem
from app.schemas import SummaryResponse, SummaryCreate
from app.providers.base import BaseProvider

router = APIRouter()

@router.post("/summarize", response_model=SummaryResponse)
async def summarize_meeting(
    meeting_id: int = Query(..., description="Meeting ID to summarize"),
    session: Session = Depends(get_session),
    provider: BaseProvider = Depends(get_provider)
):
    """Generate meeting summary and seed action items"""
    # Verify meeting exists
    meeting = session.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check if transcript exists
    transcript = session.exec(
        select(Transcript).where(Transcript.meeting_id == meeting_id)
    ).first()
    
    if not transcript:
        raise HTTPException(status_code=400, detail="No transcript found for this meeting")
    
    # Check if summary already exists
    existing_summary = session.exec(
        select(Summary).where(Summary.meeting_id == meeting_id)
    ).first()
    
    if existing_summary:
        raise HTTPException(status_code=400, detail="Summary already exists for this meeting")
    
    try:
        # Generate summary using provider
        summary_data = await provider.summarize(transcript.text)
        
        # Save summary to database
        summary = Summary(
            meeting_id=meeting_id,
            bullets=summary_data.bullets,
            decisions=summary_data.decisions,
            risks=summary_data.risks
        )
        session.add(summary)
        session.commit()
        session.refresh(summary)
        
        # Seed action items
        for action_data in summary_data.actions:
            action_item = ActionItem(
                meeting_id=meeting_id,
                text=action_data.text,
                assignee=action_data.assignee,
                due_date=action_data.due_date,
                status=action_data.status
            )
            session.add(action_item)
        
        session.commit()
        
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

@router.get("/meetings/{meeting_id}/summary", response_model=SummaryResponse)
async def get_meeting_summary(
    meeting_id: int,
    session: Session = Depends(get_session)
):
    """Get meeting summary"""
    summary = session.exec(
        select(Summary).where(Summary.meeting_id == meeting_id)
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    return summary
