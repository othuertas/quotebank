"""
routes/admin.py — Admin-only endpoints for managing users, quotes, and memes.
"""

import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Quote, Meme, Vote
from backend.schemas import AdminUserOut, AdminResetPasswordRequest, AdminUpdateUserRequest
from backend.auth import require_admin, hash_password

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


# ── Users ───────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[AdminUserOut])
def list_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for user in users:
        quote_count = db.query(Quote).filter(Quote.posted_by_user_id == user.id).count()
        meme_count = db.query(Meme).filter(Meme.posted_by_user_id == user.id).count()
        result.append(AdminUserOut(
            id=user.id,
            username=user.username,
            is_admin=user.is_admin,
            created_at=user.created_at,
            quote_count=quote_count,
            meme_count=meme_count,
        ))
    return result


@router.put("/users/{user_id}/password")
def admin_reset_password(
    user_id: int,
    body: AdminResetPasswordRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"detail": f"Password reset for user '{user.username}'"}


@router.put("/users/{user_id}/role")
def admin_update_role(
    user_id: int,
    body: AdminUpdateUserRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own admin status")

    if body.is_admin is not None:
        user.is_admin = body.is_admin
    db.commit()
    return {"detail": f"User '{user.username}' updated", "is_admin": user.is_admin}


@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")

    # Clean up meme image files
    memes = db.query(Meme).filter(Meme.posted_by_user_id == user.id).all()
    for meme in memes:
        file_path = os.path.join(UPLOAD_DIR, meme.image_filename)
        if os.path.exists(file_path):
            os.remove(file_path)

    # Clean up votes
    db.query(Vote).filter(Vote.voter_user_id == user.id).delete()
    for quote in user.quotes:
        db.query(Vote).filter(Vote.content_type == "quote", Vote.content_id == quote.id).delete()
    for meme in memes:
        db.query(Vote).filter(Vote.content_type == "meme", Vote.content_id == meme.id).delete()

    # cascade handles quotes and memes
    db.delete(user)
    db.commit()
    return {"detail": f"User '{user.username}' deleted"}


# ── Content Management ──────────────────────────────────────────────────────────

@router.delete("/quotes/{quote_id}")
def admin_delete_quote(
    quote_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")

    db.query(Vote).filter(Vote.content_type == "quote", Vote.content_id == quote_id).delete()
    db.delete(quote)
    db.commit()
    return {"detail": "Quote deleted"}


@router.delete("/memes/{meme_id}")
def admin_delete_meme(
    meme_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    meme = db.query(Meme).filter(Meme.id == meme_id).first()
    if not meme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meme not found")

    file_path = os.path.join(UPLOAD_DIR, meme.image_filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.query(Vote).filter(Vote.content_type == "meme", Vote.content_id == meme_id).delete()
    db.delete(meme)
    db.commit()
    return {"detail": "Meme deleted"}
