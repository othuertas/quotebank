"""
models.py — SQLAlchemy ORM models for User, Quote, Meme, and Vote.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    quotes = relationship("Quote", back_populates="posted_by_user", cascade="all, delete-orphan")
    memes = relationship("Meme", back_populates="posted_by_user", cascade="all, delete-orphan")


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    attributed_author = Column(String(256), nullable=False)
    said_at = Column(String(256), nullable=True)
    posted_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    publish_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    score = Column(Integer, default=0)

    posted_by_user = relationship("User", back_populates="quotes")


class Meme(Base):
    __tablename__ = "memes"

    id = Column(Integer, primary_key=True, index=True)
    image_filename = Column(String(512), nullable=False)
    caption = Column(String(1024), nullable=True)
    credited_author = Column(String(256), nullable=True)
    posted_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    publish_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    score = Column(Integer, default=0)

    posted_by_user = relationship("User", back_populates="memes")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String(16), nullable=False)   # "quote" or "meme"
    content_id = Column(Integer, nullable=False)
    vote_value = Column(Integer, nullable=False)         # +1 or -1
    voter_ip = Column(String(64), nullable=False)
    voter_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("content_type", "content_id", "voter_ip", name="uq_vote_per_ip"),
    )
