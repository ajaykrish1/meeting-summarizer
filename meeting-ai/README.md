# Meeting Summarizer & Action Tracker

A comprehensive solution for transcribing meetings, generating summaries, and tracking action items with AI-powered insights.

## Features

- 🎤 **Audio Upload & Recording**: Support for audio file uploads and browser-based recording
- 🧠 **AI Transcription**: Powered by OpenAI or Hugging Face models
- 📝 **Smart Summarization**: Extract key points, decisions, and action items
- ✅ **Action Tracking**: CRUD operations for action items with assignees and due dates
- 📊 **Export Options**: Markdown summaries and CSV action lists
- 🎨 **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui components

## Quick Start

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
make run
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
echo VITE_API_URL=http://localhost:8000 >> .env
pnpm install
pnpm dev
```

### Docker (Optional)

```bash
cd infra
docker-compose up -d
```

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + SQLModel + SQLite
- **AI Providers**: OpenAI GPT-4 or Hugging Face models
- **State Management**: Zustand for client-side state
- **Database**: SQLite with automatic schema creation

## API Endpoints

- `POST /meetings` - Create new meeting
- `POST /transcribe` - Upload and transcribe audio
- `POST /summarize` - Generate meeting summary
- `GET /meetings/{id}` - Get meeting details
- `GET /meetings/{id}/actions` - List action items
- `POST /meetings/{id}/actions` - Create action item
- `PATCH /actions/{id}` - Update action item

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key
- `HF_TOKEN` - Hugging Face token
- `PROVIDER` - AI provider (openai or hf)
- `DB_URL` - Database connection string

## Development

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- SQLite database auto-creates on first run
- Mock provider available when no API keys configured
