"""
routes/quotes.py — CRUD endpoints for quotes.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import Quote, Vote, User
from backend.schemas import QuoteCreate, QuoteOut
from backend.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/api/quotes", tags=["quotes"])

PAGE_SIZE = 20


def _build_quote_out(quote: Quote, db: Session, voter_ip: str) -> dict:
    """Build a QuoteOut-compatible dict from a Quote ORM object."""
    # Fetch the voter's current vote for this quote
    existing_vote = (
        db.query(Vote)
        .filter(Vote.content_type == "quote", Vote.content_id == quote.id, Vote.voter_ip == voter_ip)
        .first()
    )
    return {
        "id": quote.id,
        "text": quote.text,
        "attributed_author": quote.attributed_author,
        "said_at": quote.said_at,
        "posted_by_username": quote.posted_by_user.username,
        "posted_by_user_id": quote.posted_by_user_id,
        "publish_date": quote.publish_date,
        "score": quote.score,
        "user_vote": existing_vote.vote_value if existing_vote else None,
    }


@router.get("", response_model=list[QuoteOut])
def list_quotes(
    request: Request,
    sort: str = Query("new", pattern="^(top|new|old|random)$"),
    page: int = Query(1, ge=1),
    search: str = Query(None),
    db: Session = Depends(get_db),
):
    voter_ip = request.client.host if request.client else "unknown"

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
    return [_build_quote_out(q, db, voter_ip) for q in quotes]


@router.post("", response_model=QuoteOut, status_code=status.HTTP_201_CREATED)
def create_quote(
    body: QuoteCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quote = Quote(
        text=body.text,
        attributed_author=body.attributed_author,
        said_at=body.said_at,
        posted_by_user_id=current_user.id,
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)

    voter_ip = request.client.host if request.client else "unknown"
    return _build_quote_out(quote, db, voter_ip)


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
