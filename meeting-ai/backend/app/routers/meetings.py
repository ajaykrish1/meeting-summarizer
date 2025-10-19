from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, delete
from typing import List, Optional
from app.db import get_session
from app.models import Meeting, Transcript, Summary, ActionItem
from app.schemas import (
    MeetingCreate,
    MeetingResponse,
    MeetingDetail,
    TranscriptResponse,
    SummaryResponse,
    ActionItemResponse,
    StatsResponse,
)

router = APIRouter()

@router.post("/meetings", response_model=MeetingResponse)
async def create_meeting(
    meeting: MeetingCreate,
    session: Session = Depends(get_session)
):
    """Create a new meeting"""
    db_meeting = Meeting(title=meeting.title)
    session.add(db_meeting)
    session.commit()
    session.refresh(db_meeting)
    return db_meeting

@router.get("/meetings", response_model=List[MeetingResponse])
async def list_meetings(session: Session = Depends(get_session)):
    """List all meetings"""
    meetings = session.exec(select(Meeting).order_by(Meeting.created_at.desc())).all()
    return meetings

@router.get("/meetings/{meeting_id}", response_model=MeetingDetail)
async def get_meeting(
    meeting_id: int,
    session: Session = Depends(get_session)
):
    """Get meeting details with transcript, summary, and actions"""
    meeting = session.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Get transcript
    db_transcript: Optional[Transcript] = session.exec(
        select(Transcript).where(Transcript.meeting_id == meeting_id)
    ).first()

    # Get summary
    db_summary: Optional[Summary] = session.exec(
        select(Summary).where(Summary.meeting_id == meeting_id)
    ).first()

    # Get action items
    db_actions: List[ActionItem] = session.exec(
        select(ActionItem).where(ActionItem.meeting_id == meeting_id)
    ).all()

    transcript: Optional[TranscriptResponse] = None
    if db_transcript:
        transcript = TranscriptResponse(
            id=db_transcript.id,
            text=db_transcript.text,
            duration_sec=db_transcript.duration_sec,
            created_at=db_transcript.created_at,
        )

    summary: Optional[SummaryResponse] = None
    if db_summary:
        summary = SummaryResponse(
            id=db_summary.id,
            bullets=db_summary.bullets or [],
            decisions=db_summary.decisions or [],
            risks=db_summary.risks or [],
            created_at=db_summary.created_at,
        )

    actions: List[ActionItemResponse] = [
        ActionItemResponse(
            id=a.id,
            text=a.text,
            assignee=a.assignee,
            due_date=a.due_date,
            status=a.status,
            created_at=a.created_at,
            updated_at=a.updated_at,
        )
        for a in db_actions
    ]

    return MeetingDetail(
        id=meeting.id,
        title=meeting.title,
        created_at=meeting.created_at,
        transcript=transcript,
        summary=summary,
        actions=actions,
    )

@router.get("/stats", response_model=StatsResponse)
async def get_stats(session: Session = Depends(get_session)):
    """Aggregate stats for dashboard counters."""
    total_meetings = session.exec(select(Meeting)).all()
    all_transcripts = session.exec(select(Transcript)).all()
    all_summaries = session.exec(select(Summary)).all()
    all_actions = session.exec(select(ActionItem)).all()

    # Compute counts
    transcribed_meeting_ids = {t.meeting_id for t in all_transcripts}
    summarized_meeting_ids = {s.meeting_id for s in all_summaries}

    return StatsResponse(
        total_meetings=len(total_meetings),
        transcribed_count=len(transcribed_meeting_ids),
        summarized_count=len(summarized_meeting_ids),
        action_items_count=len(all_actions),
    )

@router.delete("/meetings/{meeting_id}")
async def delete_meeting(
    meeting_id: int,
    session: Session = Depends(get_session)
):
    """Delete a meeting and all associated data"""
    meeting = session.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Delete associated records using bulk delete
    session.exec(delete(Transcript).where(Transcript.meeting_id == meeting_id))
    session.exec(delete(Summary).where(Summary.meeting_id == meeting_id))
    session.exec(delete(ActionItem).where(ActionItem.meeting_id == meeting_id))
    
    session.delete(meeting)
    session.commit()
    
    return {"message": "Meeting deleted successfully"}
