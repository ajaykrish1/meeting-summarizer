from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional, List
from pathlib import Path
import os
from app.providers.base import BaseProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.hf_provider import HFProvider
from app.providers.mock_provider import MockProvider

class Settings(BaseSettings):
    # Resolve .env relative to the backend root regardless of current working directory
    _env_path = (Path(__file__).resolve().parent.parent / ".env")
    # pydantic v2 settings configuration
    model_config = SettingsConfigDict(env_file=str(_env_path), case_sensitive=False, extra="ignore")

    # Explicit aliases to uppercase env var names to avoid mapping issues
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    hf_token: Optional[str] = Field(default=None, alias="HF_TOKEN")
    provider: str = Field(default="openai", alias="PROVIDER")
    db_url: str = Field(default="sqlite:///./app.db", alias="DB_URL")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    debug: bool = Field(default=True, alias="DEBUG")
    allowed_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
        alias="ALLOWED_ORIGINS",
    )

settings = Settings()

def get_provider() -> BaseProvider:
    """Factory function to get the appropriate AI provider"""
    provider_name = settings.provider.lower().strip()

    if provider_name == "openai":
        # Prefer explicit env var, fallback to .env value
        api_key = (os.getenv("OPENAI_API_KEY") or settings.openai_api_key or "").strip()
        if not api_key:
            # Fail fast with clear message rather than silently using Mock
            raise RuntimeError("OPENAI_API_KEY is not configured but PROVIDER=openai is set.")
        return OpenAIProvider(api_key)

    if provider_name in ("hf", "huggingface", "hugging_face"):
        token = (os.getenv("HF_TOKEN") or settings.hf_token or "").strip()
        if not token:
            raise RuntimeError("HF_TOKEN is not configured but PROVIDER=hf is set.")
        return HFProvider(token)

    # Default to Mock only when provider is not explicitly OpenAI/HF
    return MockProvider()

def get_settings() -> Settings:
    return settings
