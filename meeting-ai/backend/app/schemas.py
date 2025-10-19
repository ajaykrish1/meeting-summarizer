from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List, Dict, Any

# Meeting schemas
class MeetingCreate(BaseModel):
    title: str

class MeetingResponse(BaseModel):
    id: int
    title: str
    created_at: datetime

class MeetingDetail(BaseModel):
    id: int
    title: str
    created_at: datetime
    transcript: Optional["TranscriptResponse"] = None
    summary: Optional["SummaryResponse"] = None
    actions: List["ActionItemResponse"] = []

# Transcript schemas
class TranscriptResponse(BaseModel):
    id: int
    text: str
    duration_sec: Optional[int]
    created_at: datetime

# Summary schemas
class SummaryResponse(BaseModel):
    id: int
    bullets: List[str]
    decisions: List[str]
    risks: List[str]
    created_at: datetime

class SummaryCreate(BaseModel):
    bullets: List[str]
    decisions: List[str]
    risks: List[str]
    actions: List["ActionItemCreate"]

# Action Item schemas
class ActionItemCreate(BaseModel):
    text: str
    assignee: Optional[str] = None
    due_date: Optional[date] = None
    status: str = "open"

class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None

class ActionItemResponse(BaseModel):
    id: int
    text: str
    assignee: Optional[str]
    due_date: Optional[date]
    status: str
    created_at: datetime
    updated_at: datetime

# Transcription schemas
class TranscriptionResponse(BaseModel):
    text: str
    duration_sec: Optional[int]

# Provider schemas
class SummaryData(BaseModel):
    bullets: List[str]
    decisions: List[str]
    risks: List[str]
    actions: List[ActionItemCreate]

# Stats schemas
class StatsResponse(BaseModel):
    total_meetings: int
    transcribed_count: int
    summarized_count: int
    action_items_count: int