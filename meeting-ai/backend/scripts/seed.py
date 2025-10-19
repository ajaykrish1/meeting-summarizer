#!/usr/bin/env python3
"""
Seed script to populate the database with sample data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import engine, create_all
from app.models import Meeting, Transcript, Summary, ActionItem
from sqlmodel import Session
from datetime import datetime, date

def seed_database():
    """Seed the database with sample data"""
    # Create tables
    create_all()
    
    with Session(engine) as session:
        # Check if data already exists
        existing_meetings = session.exec("SELECT COUNT(*) FROM meeting").first()
        if existing_meetings and existing_meetings[0] > 0:
            print("Database already seeded. Skipping...")
            return
        
        print("Seeding database with sample data...")
        
        # Create sample meeting
        meeting = Meeting(
            title="Weekly Team Standup - Q3 Review",
            created_at=datetime.utcnow()
        )
        session.add(meeting)
        session.commit()
        session.refresh(meeting)
        
        # Create sample transcript
        transcript = Transcript(
            meeting_id=meeting.id,
            text="""
            Welcome to our weekly team standup. Today we're reviewing Q3 performance and planning Q4.
            
            John: Q3 sales exceeded targets by 15%. The new marketing campaign was very successful.
            Sarah: Customer satisfaction scores are up to 4.8 out of 5. Great feedback on the new features.
            Mike: Engineering team completed 3 major features on schedule. Security audit is 80% complete.
            
            We discussed the upcoming product launch. Engineering needs to finish testing by next Friday.
            Marketing will start the campaign the following Monday.
            
            Action items: John to prepare Q4 forecast, Sarah to update customer feedback process,
            Engineering team to complete security audit and final testing.
            
            Meeting concluded with reminder about company holiday party next month.
            """,
            duration_sec=1800  # 30 minutes
        )
        session.add(transcript)
        
        # Create sample summary
        summary = Summary(
            meeting_id=meeting.id,
            bullets=[
                "Q3 sales exceeded targets by 15%",
                "New marketing campaign was successful",
                "Customer satisfaction improved to 4.8/5",
                "3 major features completed on schedule",
                "Security audit 80% complete",
                "Product launch scheduled for next month"
            ],
            decisions=[
                "Engineering team to complete testing by next Friday",
                "Marketing campaign to start the following Monday",
                "Q4 forecast preparation assigned to John"
            ],
            risks=[
                "Security audit completion timeline",
                "Customer feedback process updates needed"
            ]
        )
        session.add(summary)
        
        # Create sample action items
        actions = [
            ActionItem(
                meeting_id=meeting.id,
                text="Prepare Q4 sales forecast",
                assignee="John",
                due_date=date.today().replace(day=date.today().day + 7),
                status="open"
            ),
            ActionItem(
                meeting_id=meeting.id,
                text="Update customer feedback process",
                assignee="Sarah",
                due_date=date.today().replace(day=date.today().day + 5),
                status="open"
            ),
            ActionItem(
                meeting_id=meeting.id,
                text="Complete security audit",
                assignee="Engineering Team",
                due_date=date.today().replace(day=date.today().day + 3),
                status="in_progress"
            ),
            ActionItem(
                meeting_id=meeting.id,
                text="Finalize product testing",
                assignee="Engineering Team",
                due_date=date.today().replace(day=date.today().day + 7),
                status="open"
            )
        ]
        
        for action in actions:
            session.add(action)
        
        session.commit()
        print(f"Created sample meeting: {meeting.title}")
        print(f"Created transcript with {len(transcript.text)} characters")
        print(f"Created summary with {len(summary.bullets)} bullet points")
        print(f"Created {len(actions)} action items")
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
