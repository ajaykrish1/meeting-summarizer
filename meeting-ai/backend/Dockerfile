# Python slim base
FROM python:3.10-slim

# System deps (if you use ffmpeg/whisper, add it here)
# RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Copy dependency files first for layer cache
COPY requirements.txt pyproject.toml* ./
RUN pip install --no-cache-dir -r requirements.txt || true

# Copy app code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start (adjust module if your entry is different)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
