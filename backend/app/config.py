"""
CX0401 Backend – Application configuration.

Reads settings from environment variables / .env file.
"""

import os
from dotenv import load_dotenv

load_dotenv()  # loads backend/.env when running from backend/

FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cx0401.db")
