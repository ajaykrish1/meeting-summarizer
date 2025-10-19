import asyncio
from app.providers.base import BaseProvider
from app.schemas import SummaryData, ActionItemCreate

class MockProvider(BaseProvider):
    """Mock provider for development/testing when no API keys are available"""
    
    async def transcribe(self, audio_path: str) -> str:
        """Return a mock transcript"""
        await asyncio.sleep(1)  # Simulate processing time
        
        return """
        Welcome to our weekly team meeting. Today we discussed several important topics.
        
        First, John presented the Q3 sales results. We exceeded our targets by 15% and 
        the new marketing campaign was very successful. Sarah mentioned that customer 
        satisfaction scores are up to 4.8 out of 5.
        
        We also discussed the upcoming product launch. The engineering team needs to 
        complete the final testing by next Friday. Marketing will start the campaign 
        the following Monday.
        
        Several action items were identified: John needs to prepare the Q4 forecast, 
        Sarah should update the customer feedback process, and the engineering team 
        needs to complete the security audit.
        
        The meeting concluded with a reminder about the company holiday party next month.
        """
    
    async def summarize(self, transcript: str) -> SummaryData:
        """Return a mock summary with extracted information"""
        await asyncio.sleep(2)  # Simulate processing time
        
        return SummaryData(
            bullets=[
                "Q3 sales exceeded targets by 15%",
                "New marketing campaign was successful",
                "Customer satisfaction scores improved to 4.8/5",
                "Product launch scheduled for next month",
                "Company holiday party next month"
            ],
            decisions=[
                "Engineering team to complete testing by next Friday",
                "Marketing campaign to start the following Monday",
                "Q4 forecast preparation assigned to John"
            ],
            risks=[
                "Security audit completion timeline",
                "Customer feedback process updates needed"
            ],
            actions=[
                ActionItemCreate(
                    text="Prepare Q4 sales forecast",
                    assignee="John",
                    due_date=None,
                    status="open"
                ),
                ActionItemCreate(
                    text="Update customer feedback process",
                    assignee="Sarah",
                    due_date=None,
                    status="open"
                ),
                ActionItemCreate(
                    text="Complete security audit",
                    assignee="Engineering Team",
                    due_date=None,
                    status="open"
                ),
                ActionItemCreate(
                    text="Finalize product testing",
                    assignee="Engineering Team",
                    due_date=None,
                    status="open"
                )
            ]
        )
