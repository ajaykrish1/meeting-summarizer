from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from datetime import datetime, date
from typing import Optional, List

class Meeting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Transcript(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meeting_id: int = Field(foreign_key="meeting.id")
    text: str
    duration_sec: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Summary(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meeting_id: int = Field(foreign_key="meeting.id")
    bullets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    decisions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    risks: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ActionItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meeting_id: int = Field(foreign_key="meeting.id")
    text: str = Field(max_length=500)
    assignee: Optional[str] = Field(default=None, max_length=100)
    due_date: Optional[date] = None
    status: str = Field(default="open", max_length=20)  # open, in_progress, completed, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
