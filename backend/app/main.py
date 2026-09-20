"""
CX0401 Backend – FastAPI application entry point.

Responsibilities:
  • Create and configure the FastAPI app
  • Set up CORS for the frontend dev server
  • Create database tables on startup
  • Mount route modules
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_URL
from app.database import engine, Base
from app.routes import health, auth

# Import models so Base.metadata knows about all tables
import app.models  # noqa: F401


def create_app() -> FastAPI:
    application = FastAPI(
        title="CX0401 – Pothole Verification API",
        version="0.1.0",
        description="Backend API for the CX0401 Pothole Nobody Reported hackathon project.",
    )

    # ── CORS ─────────────────────────────────────────────────────────────────
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Database init ────────────────────────────────────────────────────────
    @application.on_event("startup")
    def on_startup() -> None:
        Base.metadata.create_all(bind=engine)

    # ── Routers ──────────────────────────────────────────────────────────────
    application.include_router(health.router)
    application.include_router(auth.router)

    return application


app = create_app()
