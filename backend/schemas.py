"""
schemas.py — Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Auth ────────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=2, max_length=64)
    password: str = Field(..., min_length=4, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    username: str
    user_id: int
    is_admin: bool = False


# ── User Profile ────────────────────────────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=4, max_length=128)


class UserProfileOut(BaseModel):
    id: int
    username: str
    is_admin: bool
    created_at: datetime
    quote_count: int = 0
    meme_count: int = 0

    class Config:
        from_attributes = True


# ── Admin ───────────────────────────────────────────────────────────────────────

class AdminUserOut(BaseModel):
    id: int
    username: str
    is_admin: bool
    created_at: datetime
    quote_count: int = 0
    meme_count: int = 0

    class Config:
        from_attributes = True


class AdminResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=4, max_length=128)


class AdminUpdateUserRequest(BaseModel):
    is_admin: Optional[bool] = None


# ── Quote ───────────────────────────────────────────────────────────────────────

class QuoteCreate(BaseModel):
    text: str = Field(..., min_length=1)
    attributed_author: str = Field(..., min_length=1)
    said_at: Optional[str] = None
    is_anonymous: bool = False


class QuoteUpdate(BaseModel):
    text: Optional[str] = Field(None, min_length=1)
    attributed_author: Optional[str] = Field(None, min_length=1)
    said_at: Optional[str] = None


class QuoteOut(BaseModel):
    id: int
    text: str
    attributed_author: str
    said_at: Optional[str]
    posted_by_username: str
    posted_by_user_id: int
    publish_date: datetime
    edited_at: Optional[datetime] = None
    is_anonymous: bool
    score: int
    user_vote: Optional[int] = None  # current viewer's vote (+1, -1, or None)

    class Config:
        from_attributes = True


# ── Meme ────────────────────────────────────────────────────────────────────────

class MemeOut(BaseModel):
    id: int
    image_filename: str
    caption: Optional[str]
    credited_author: Optional[str]
    posted_by_username: str
    posted_by_user_id: int
    publish_date: datetime
    edited_at: Optional[datetime] = None
    is_anonymous: bool
    score: int
    user_vote: Optional[int] = None

    class Config:
        from_attributes = True


class MemeUpdate(BaseModel):
    caption: Optional[str] = None


# ── Vote ────────────────────────────────────────────────────────────────────────

class VoteRequest(BaseModel):
    content_type: str = Field(..., pattern="^(quote|meme)$")
    content_id: int
    value: int = Field(..., ge=-1, le=1)


class VoteResponse(BaseModel):
    new_score: int
    user_vote: Optional[int]
