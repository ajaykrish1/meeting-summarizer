@echo off
cd /d "%~dp0"
REM Ensure provider is set (API key should come from .env file)
set "PROVIDER=openai"
if exist venv\Scripts\python.exe (
  venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
) else (
  python -m uvicorn app.main:app --reload --port 8000
)

