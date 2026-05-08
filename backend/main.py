"""
main.py — FastAPI application entry point.

Mounts all routers, serves static files (uploads + frontend), and creates DB tables on startup.
"""

import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import engine, Base
from backend.routes import users, quotes, memes, votes, admin

# ── Create tables ───────────────────────────────────────────────────────────────

Base.metadata.create_all(bind=engine)

# ── App ─────────────────────────────────────────────────────────────────────────

app = FastAPI(title="QuoteBank & MemeBank", version="1.0.0")

# ── API routers ─────────────────────────────────────────────────────────────────

app.include_router(users.router)
app.include_router(quotes.router)
app.include_router(memes.router)
app.include_router(votes.router)
app.include_router(admin.router)

# ── Static file serving ────────────────────────────────────────────────────────

# Meme image uploads
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Frontend static assets (CSS, JS)
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="frontend")


# ── SPA catch-all ───────────────────────────────────────────────────────────────

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    """Serve index.html for all non-API, non-static routes (SPA catch-all)."""
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
