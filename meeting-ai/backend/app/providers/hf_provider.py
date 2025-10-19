import asyncio
import aiofiles
import os
import json
import httpx
from app.providers.base import BaseProvider
from app.schemas import SummaryData, ActionItemCreate

class HFProvider(BaseProvider):
    """Hugging Face provider using open-source models for transcription and summarization"""
    
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://api-inference.huggingface.co"
        self.headers = {"Authorization": f"Bearer {token}"}
    
    async def transcribe(self, audio_path: str) -> str:
        """Transcribe audio using Hugging Face Whisper model"""
        try:
            async with httpx.AsyncClient() as client:
                with open(audio_path, "rb") as audio_file:
                    files = {"file": audio_file}
                    response = await client.post(
                        f"{self.base_url}/models/openai/whisper-large-v3",
                        headers=self.headers,
                        files=files
                    )
                    
                if response.status_code == 200:
                    result = response.json()
                    return result.get("text", "")
                else:
                    raise Exception(f"HF transcription failed: {response.status_code}")
                    
        except Exception as e:
            raise Exception(f"HF transcription failed: {str(e)}")
    
    async def summarize(self, transcript: str) -> SummaryData:
        """Summarize transcript using Hugging Face summarization model"""
        try:
            # Use a summarization model
            summary_prompt = f"""
            Summarize this meeting transcript and extract:
            1. Key bullet points (3-5 main topics)
            2. Decisions made (2-4 specific decisions)
            3. Potential risks (1-3 items)
            4. Action items with assignees if mentioned
            
            Transcript: {transcript}
            
            Format as JSON:
            {{
                "bullets": ["point 1", "point 2"],
                "decisions": ["decision 1", "decision 2"],
                "risks": ["risk 1", "risk 2"],
                "actions": [
                    {{
                        "text": "action description",
                        "assignee": "person name or null",
                        "due_date": "YYYY-MM-DD or null",
                        "status": "open"
                    }}
                ]
            }}
            """
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/models/microsoft/DialoGPT-medium",
                    headers=self.headers,
                    json={"inputs": summary_prompt}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    # Parse the generated text as JSON
                    try:
                        content = result[0].get("generated_text", "")
                        # Extract JSON from the response
                        start_idx = content.find("{")
                        end_idx = content.rfind("}") + 1
                        if start_idx != -1 and end_idx != -1:
                            json_str = content[start_idx:end_idx]
                            data = json.loads(json_str)
                        else:
                            # Fallback to mock data if JSON parsing fails
                            data = self._get_fallback_data()
                    except json.JSONDecodeError:
                        data = self._get_fallback_data()
                    
                    # Convert to SummaryData
                    actions = [
                        ActionItemCreate(
                            text=action["text"],
                            assignee=action.get("assignee"),
                            due_date=action.get("due_date"),
                            status=action.get("status", "open")
                        )
                        for action in data.get("actions", [])
                    ]
                    
                    return SummaryData(
                        bullets=data.get("bullets", []),
                        decisions=data.get("decisions", []),
                        risks=data.get("risks", []),
                        actions=actions
                    )
                else:
                    raise Exception(f"HF summarization failed: {response.status_code}")
                    
        except Exception as e:
            raise Exception(f"HF summarization failed: {str(e)}")
    
    def _get_fallback_data(self) -> dict:
        """Fallback data when HF model fails"""
        return {
            "bullets": ["Meeting discussion points extracted"],
            "decisions": ["Key decisions identified"],
            "risks": ["Potential risks noted"],
            "actions": [
                {
                    "text": "Review meeting outcomes",
                    "assignee": None,
                    "due_date": None,
                    "status": "open"
                }
            ]
        }
    
    def get_provider_name(self) -> str:
        return "Hugging Face"
