.PHONY: run install dev test clean

run:
	uvicorn app.main:app --reload --port 8000

install:
	pip install -e .

dev:
	uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

test:
	pytest

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .pytest_cache
	rm -rf temp_audio
	rm -f app.db
