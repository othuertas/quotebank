"""
routes/quotes.py — CRUD endpoints for quotes.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import Quote, Vote, User
from backend.schemas import QuoteCreate, QuoteOut, QuoteUpdate
from backend.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/api/quotes", tags=["quotes"])

PAGE_SIZE = 20


def _build_quote_out(quote: Quote, db: Session, user_id: int | None) -> dict:
    """Build a QuoteOut-compatible dict from a Quote ORM object."""
    user_vote = None
    if user_id is not None:
        # Fetched with a query filtered strictly by the current user's ID
        existing_vote = (
            db.query(Vote)
            .filter(
                Vote.content_type == "quote",
                Vote.content_id == quote.id,
                Vote.voter_user_id == user_id
            )
            .first()
        )
        if existing_vote:
            user_vote = existing_vote.vote_value

    return {
        "id": quote.id,
        "text": quote.text,
        "attributed_author": quote.attributed_author,
        "said_at": quote.said_at,
        "posted_by_username": "Anonymous" if quote.is_anonymous else quote.posted_by_user.username,
        "posted_by_user_id": quote.posted_by_user_id,
        "publish_date": quote.publish_date,
        "edited_at": quote.edited_at,
        "is_anonymous": quote.is_anonymous,
        "score": quote.score,
        "user_vote": user_vote,
    }


@router.get("", response_model=list[QuoteOut])
def list_quotes(
    current_user: User | None = Depends(get_optional_user),
    sort: str = Query("random", pattern="^(top|new|old|random)$"),
    page: int = Query(1, ge=1),
    search: str = Query(None),
    db: Session = Depends(get_db),
):
    user_id = current_user.id if current_user else None

    query = db.query(Quote)
    if search:
        query = query.filter(Quote.text.ilike(f"%{search}%"))
    
    if sort == "top":
        query = query.order_by(Quote.score.desc(), Quote.publish_date.desc())
    elif sort == "new":
        query = query.order_by(Quote.publish_date.desc())
    elif sort == "old":
        query = query.order_by(Quote.publish_date.asc())
    elif sort == "random":
        query = query.order_by(func.random())

    quotes = query.offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()
    return [_build_quote_out(q, db, user_id) for q in quotes]


@router.post("", response_model=QuoteOut, status_code=status.HTTP_201_CREATED)
def create_quote(
    body: QuoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quote = Quote(
        text=body.text,
        attributed_author=body.attributed_author,
        said_at=body.said_at,
        is_anonymous=body.is_anonymous,
        posted_by_user_id=current_user.id,
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)

    return _build_quote_out(quote, db, current_user.id)


@router.patch("/{quote_id}", response_model=QuoteOut)
def update_quote(
    quote_id: int,
    body: QuoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")
    if quote.posted_by_user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your quote")

    if body.text is not None:
        quote.text = body.text
    if body.attributed_author is not None:
        quote.attributed_author = body.attributed_author
    if body.said_at is not None:
        quote.said_at = body.said_at

    quote.edited_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(quote)

    return _build_quote_out(quote, db, current_user.id)


@router.delete("/{quote_id}", status_code=status.HTTP_200_OK)
def delete_quote(
    quote_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")
    # Allow deletion by the author or by an admin
    if quote.posted_by_user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your quote")

    # Also remove associated votes
    db.query(Vote).filter(Vote.content_type == "quote", Vote.content_id == quote_id).delete()
    db.delete(quote)
    db.commit()
    return {"detail": "Quote deleted"}
    # Also remove associated votes
    db.query(Vote).filter(Vote.content_type == "quote", Vote.content_id == quote_id).delete()
    db.delete(quote)
    db.commit()
    return {"detail": "Quote deleted"}
