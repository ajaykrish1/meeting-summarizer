from abc import ABC, abstractmethod
from typing import Dict, Any
from app.schemas import SummaryData

class BaseProvider(ABC):
    """Base interface for AI providers"""
    
    @abstractmethod
    async def transcribe(self, audio_path: str) -> str:
        """Transcribe audio file to text"""
        pass
    
    @abstractmethod
    async def summarize(self, transcript: str) -> SummaryData:
        """Summarize transcript and extract key information"""
        pass
    
    def get_provider_name(self) -> str:
        """Get the name of the provider"""
        return self.__class__.__name__
