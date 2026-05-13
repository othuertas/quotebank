"""
routes/memes.py — CRUD endpoints for memes (with image upload).
"""

import os
import uuid

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import Meme, Vote, User
from backend.schemas import MemeOut, MemeUpdate
from backend.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/api/memes", tags=["memes"])

PAGE_SIZE = 20
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}


def _build_meme_out(meme: Meme, db: Session, user_id: int | None) -> dict:
    user_vote = None
    if user_id is not None:
        # Fetched with a query filtered strictly by the current user's ID
        existing_vote = (
            db.query(Vote)
            .filter(
                Vote.content_type == "meme",
                Vote.content_id == meme.id,
                Vote.voter_user_id == user_id
            )
            .first()
        )
        if existing_vote:
            user_vote = existing_vote.vote_value

    return {
        "id": meme.id,
        "image_filename": meme.image_filename,
        "caption": meme.caption,
        "credited_author": meme.credited_author,
        "posted_by_username": "Anonymous" if meme.is_anonymous else meme.posted_by_user.username,
        "posted_by_user_id": meme.posted_by_user_id,
        "publish_date": meme.publish_date,
        "edited_at": meme.edited_at,
        "is_anonymous": meme.is_anonymous,
        "score": meme.score,
        "user_vote": user_vote,
    }


@router.get("", response_model=list[MemeOut])
def list_memes(
    current_user: User | None = Depends(get_optional_user),
    sort: str = Query("new", pattern="^(top|new|old|random)$"),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    user_id = current_user.id if current_user else None

    query = db.query(Meme)
    if sort == "top":
        query = query.order_by(Meme.score.desc(), Meme.publish_date.desc())
    elif sort == "new":
        query = query.order_by(Meme.publish_date.desc())
    elif sort == "old":
        query = query.order_by(Meme.publish_date.asc())
    elif sort == "random":
        query = query.order_by(func.random())

    memes = query.offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()
    return [_build_meme_out(m, db, user_id) for m in memes]


@router.post("", response_model=MemeOut, status_code=status.HTTP_201_CREATED)
async def create_meme(
    image: UploadFile = File(...),
    caption: str = Form(default=""),
    credited_author: str = Form(default=""),
    is_anonymous: bool = Form(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate file extension
    _, ext = os.path.splitext(image.filename or "")
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Save file with a unique name
    unique_name = f"{uuid.uuid4().hex}{ext.lower()}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    contents = await image.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    meme = Meme(
        image_filename=unique_name,
        caption=caption or None,
        credited_author=credited_author or None,
        is_anonymous=is_anonymous,
        posted_by_user_id=current_user.id,
    )
    db.add(meme)
    db.commit()
    db.refresh(meme)

    return _build_meme_out(meme, db, current_user.id)


@router.patch("/{meme_id}", response_model=MemeOut)
def update_meme(
    meme_id: int,
    body: MemeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meme = db.query(Meme).filter(Meme.id == meme_id).first()
    if not meme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meme not found")
    if meme.posted_by_user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your meme")

    if body.caption is not None:
        meme.caption = body.caption or None

    meme.edited_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(meme)

    return _build_meme_out(meme, db, current_user.id)


@router.delete("/{meme_id}", status_code=status.HTTP_200_OK)
def delete_meme(
    meme_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meme = db.query(Meme).filter(Meme.id == meme_id).first()
    if not meme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meme not found")
    # Allow deletion by the author or by an admin
    if meme.posted_by_user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your meme")

    # Remove the image file
    file_path = os.path.join(UPLOAD_DIR, meme.image_filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    # Remove associated votes
    db.query(Vote).filter(Vote.content_type == "meme", Vote.content_id == meme_id).delete()
    db.delete(meme)
    db.commit()
    return {"detail": "Meme deleted"}
