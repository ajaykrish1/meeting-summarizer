from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from app.db import get_session
from app.models import Meeting, ActionItem
from app.schemas import ActionItemCreate, ActionItemUpdate, ActionItemResponse

router = APIRouter()

@router.get("/meetings/{meeting_id}/actions", response_model=List[ActionItemResponse])
async def list_actions(
    meeting_id: int,
    session: Session = Depends(get_session)
):
    """List all action items for a meeting"""
    # Verify meeting exists
    meeting = session.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    actions = session.exec(
        select(ActionItem).where(ActionItem.meeting_id == meeting_id)
    ).all()
    
    return actions

@router.post("/meetings/{meeting_id}/actions", response_model=ActionItemResponse)
async def create_action(
    meeting_id: int,
    action: ActionItemCreate,
    session: Session = Depends(get_session)
):
    """Create a new action item for a meeting"""
    # Verify meeting exists
    meeting = session.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db_action = ActionItem(
        meeting_id=meeting_id,
        text=action.text,
        assignee=action.assignee,
        due_date=action.due_date,
        status=action.status
    )
    
    session.add(db_action)
    session.commit()
    session.refresh(db_action)
    
    return db_action

@router.patch("/actions/{action_id}", response_model=ActionItemResponse)
async def update_action(
    action_id: int,
    action_update: ActionItemUpdate,
    session: Session = Depends(get_session)
):
    """Update an action item"""
    db_action = session.get(ActionItem, action_id)
    if not db_action:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    # Update fields if provided
    if action_update.text is not None:
        db_action.text = action_update.text
    if action_update.assignee is not None:
        db_action.assignee = action_update.assignee
    if action_update.due_date is not None:
        db_action.due_date = action_update.due_date
    if action_update.status is not None:
        db_action.status = action_update.status
    
    db_action.updated_at = datetime.utcnow()
    
    session.add(db_action)
    session.commit()
    session.refresh(db_action)
    
    return db_action

@router.delete("/actions/{action_id}")
async def delete_action(
    action_id: int,
    session: Session = Depends(get_session)
):
    """Delete an action item"""
    db_action = session.get(ActionItem, action_id)
    if not db_action:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    session.delete(db_action)
    session.commit()
    
    return {"message": "Action item deleted successfully"}

@router.get("/actions", response_model=List[ActionItemResponse])
async def list_all_actions(
    status: str = None,
    assignee: str = None,
    session: Session = Depends(get_session)
):
    """List all action items with optional filtering"""
    query = select(ActionItem)
    
    if status:
        query = query.where(ActionItem.status == status)
    if assignee:
        query = query.where(ActionItem.assignee == assignee)
    
    actions = session.exec(query).all()
    return actions
