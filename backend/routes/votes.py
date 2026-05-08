"""
routes/votes.py — Voting endpoint with toggle logic.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Quote, Meme, Vote, User
from backend.schemas import VoteRequest, VoteResponse
from backend.auth import get_optional_user

router = APIRouter(prefix="/api", tags=["votes"])


@router.post("/vote", response_model=VoteResponse)
def cast_vote(
    body: VoteRequest,
    request: Request,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    # Validate value
    if body.value not in (1, -1):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vote value must be 1 or -1")

    # Resolve the content item
    if body.content_type == "quote":
        item = db.query(Quote).filter(Quote.id == body.content_id).first()
    elif body.content_type == "meme":
        item = db.query(Meme).filter(Meme.id == body.content_id).first()
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid content_type")

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    voter_ip = request.client.host if request.client else "unknown"

    existing_vote = (
        db.query(Vote)
        .filter(
            Vote.content_type == body.content_type,
            Vote.content_id == body.content_id,
            Vote.voter_ip == voter_ip,
        )
        .first()
    )

    if existing_vote:
        if existing_vote.vote_value == body.value:
            # Same vote → toggle off (remove)
            item.score -= existing_vote.vote_value
            db.delete(existing_vote)
            db.commit()
            db.refresh(item)
            return VoteResponse(new_score=item.score, user_vote=None)
        else:
            # Different vote → flip
            item.score -= existing_vote.vote_value  # remove old
            existing_vote.vote_value = body.value
            item.score += body.value                # apply new
            if current_user:
                existing_vote.voter_user_id = current_user.id
            db.commit()
            db.refresh(item)
            return VoteResponse(new_score=item.score, user_vote=body.value)
    else:
        # New vote
        vote = Vote(
            content_type=body.content_type,
            content_id=body.content_id,
            vote_value=body.value,
            voter_ip=voter_ip,
            voter_user_id=current_user.id if current_user else None,
        )
        item.score += body.value
        db.add(vote)
        db.commit()
        db.refresh(item)
        return VoteResponse(new_score=item.score, user_vote=body.value)
