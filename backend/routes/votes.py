"""
routes/votes.py — Voting endpoint with toggle logic.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Quote, Meme, Vote, User
from backend.schemas import VoteRequest, VoteResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api", tags=["votes"])


@router.post("/vote", response_model=VoteResponse)
def cast_vote(
    body: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Require authentication (already handled by get_current_user returning 401 if not logged in)
    if body.value not in (1, -1):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vote value must be 1 or -1")

    # Resolve content
    if body.content_type == "quote":
        item = db.query(Quote).filter(Quote.id == body.content_id).first()
    elif body.content_type == "meme":
        item = db.query(Meme).filter(Meme.id == body.content_id).first()
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid content_type")

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    # Fetch existing vote for the current user exactly
    existing_vote = (
        db.query(Vote)
        .filter(
            Vote.content_type == body.content_type,
            Vote.content_id == body.content_id,
            Vote.voter_user_id == current_user.id,
        )
        .first()
    )

    if existing_vote:
        if existing_vote.vote_value == body.value:
            # Same vote already exists -> DELETE it, reverse the score change (toggle off)
            item.score -= existing_vote.vote_value
            db.delete(existing_vote)
            db.commit()
            db.refresh(item)
            return VoteResponse(new_score=item.score, user_vote=None)
        else:
            # Opposite vote exists -> UPDATE it, adjust score by 2
            item.score -= existing_vote.vote_value  # remove old vote value
            existing_vote.vote_value = body.value
            item.score += body.value                # add new vote value
            db.commit()
            db.refresh(item)
            return VoteResponse(new_score=item.score, user_vote=body.value)
    else:
        # No existing vote -> INSERT vote, add +1 or -1 to item.score
        vote = Vote(
            content_type=body.content_type,
            content_id=body.content_id,
            vote_value=body.value,
            voter_ip="N/A",  # Never use voter_ip for anything except optional logging
            voter_user_id=current_user.id,
        )
        item.score += body.value
        db.add(vote)
        db.commit()
        db.refresh(item)
        return VoteResponse(new_score=item.score, user_vote=body.value)
