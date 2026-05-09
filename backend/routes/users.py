"""
routes/users.py — Registration, login, and user profile endpoints.
"""

import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Quote, Meme, Vote
from backend.schemas import (
    UserCreate, UserLogin, AuthResponse,
    ChangePasswordRequest, UserProfileOut,
)
from backend.auth import (
    hash_password, verify_password, create_access_token, get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == body.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    user = User(
        username=body.username,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.username, user.is_admin)
    return AuthResponse(access_token=token, username=user.username, user_id=user.id, is_admin=user.is_admin)


@router.post("/login", response_model=AuthResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(user.id, user.username, user.is_admin)
    return AuthResponse(access_token=token, username=user.username, user_id=user.id, is_admin=user.is_admin)


# ── User Profile ────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quote_count = db.query(Quote).filter(Quote.posted_by_user_id == current_user.id).count()
    meme_count = db.query(Meme).filter(Meme.posted_by_user_id == current_user.id).count()
    return UserProfileOut(
        id=current_user.id,
        username=current_user.username,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at,
        quote_count=quote_count,
        meme_count=meme_count,
    )


@router.put("/me/password", status_code=status.HTTP_200_OK)
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"detail": "Password changed successfully"}


@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Clean up meme image files
    memes = db.query(Meme).filter(Meme.posted_by_user_id == current_user.id).all()
    for meme in memes:
        file_path = os.path.join(UPLOAD_DIR, meme.image_filename)
        if os.path.exists(file_path):
            os.remove(file_path)

    # Clean up votes cast by this user (by user_id)
    db.query(Vote).filter(Vote.voter_user_id == current_user.id).delete()

    # Clean up votes on this user's content
    for quote in current_user.quotes:
        db.query(Vote).filter(Vote.content_type == "quote", Vote.content_id == quote.id).delete()
    for meme in memes:
        db.query(Vote).filter(Vote.content_type == "meme", Vote.content_id == meme.id).delete()

    # cascade delete-orphan handles quotes and memes
    db.delete(current_user)
    db.commit()
    return {"detail": "Account deleted"}
