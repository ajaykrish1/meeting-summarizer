import asyncio
import aiofiles
import os
from openai import AsyncOpenAI
import logging
from app.providers.base import BaseProvider
from app.schemas import SummaryData, ActionItemCreate

class OpenAIProvider(BaseProvider):
    """OpenAI provider using GPT-4 for transcription and summarization"""
    
    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def transcribe(self, audio_path: str) -> str:
        """Transcribe audio using OpenAI Speech-to-Text.

        Tries whisper-1 first; if unavailable, falls back to gpt-4o-mini-transcribe.
        """
        async def _run(model_name: str) -> str:
            with open(audio_path, "rb") as audio_file:
                result = await self.client.audio.transcriptions.create(
                    model=model_name,
                    file=audio_file
                )
            # openai>=1.x returns object with .text; guard for dict
            return getattr(result, "text", None) or (result.get("text") if isinstance(result, dict) else "")

        last_err: Exception | None = None
        for model in ("gpt-4o-transcribe", "whisper-1"):
            try:
                text = await _run(model)
                if not text:
                    raise Exception("Empty transcription text")
                return text
            except Exception as e:
                # Surface which model failed for easier debugging
                last_err = Exception(f"model={model}: {e}")
                continue
        raise Exception(f"OpenAI transcription failed: {last_err}")
    
    async def summarize(self, transcript: str) -> SummaryData:
        """Summarize transcript using GPT-4"""
        try:
            prompt = f"""
            Please analyze the following meeting transcript and provide:
            1. Key bullet points (3-5 main topics discussed)
            2. Decisions made (2-4 specific decisions)
            3. Potential risks or concerns (1-3 items)
            4. Action items with assignees if mentioned
            
            Transcript:
            {transcript}
            
            Please format your response as JSON with the following structure:
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
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that analyzes meeting transcripts and returns ONLY valid JSON with no prose or code fences."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )

            import json
            content = response.choices[0].message.content or ""
            try:
                data = json.loads(content)
                logging.getLogger("uvicorn.error").info("OpenAI JSON parsed: %s", data)
                print("OpenAI JSON parsed:", data, flush=True)
                # Also persist to a file for easy inspection
                try:
                    log_dir = os.path.join(os.getcwd(), "logs")
                    os.makedirs(log_dir, exist_ok=True)
                    with open(os.path.join(log_dir, "openai.jsonl"), "a", encoding="utf-8") as f:
                        f.write(json.dumps({"event": "parsed", "data": data}, ensure_ascii=False) + "\n")
                except Exception:
                    pass
            except Exception:
                start = content.find("{")
                end = content.rfind("}")
                if start != -1 and end != -1 and end > start:
                    data = json.loads(content[start:end + 1])
                    logging.getLogger("uvicorn.error").info("OpenAI JSON recovered: %s", data)
                    print("OpenAI JSON recovered:", data, flush=True)
                    try:
                        log_dir = os.path.join(os.getcwd(), "logs")
                        os.makedirs(log_dir, exist_ok=True)
                        with open(os.path.join(log_dir, "openai.jsonl"), "a", encoding="utf-8") as f:
                            f.write(json.dumps({"event": "recovered", "data": data}, ensure_ascii=False) + "\n")
                    except Exception:
                        pass
                else:
                    raise Exception("Model did not return valid JSON")
            
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
            
        except Exception as e:
            raise Exception(f"OpenAI summarization failed: {str(e)}")
    
    def get_provider_name(self) -> str:
        return "OpenAI GPT-4"
