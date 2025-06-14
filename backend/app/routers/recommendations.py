from fastapi import APIRouter, Depends, HTTPException
from ..spotify_auth import get_current_user
from ..ml_model import get_recommendations
from typing import List, Dict

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/")
async def get_music_recommendations(
    seed_tracks: List[str] = None,
    seed_artists: List[str] = None,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get personalized music recommendations"""
    try:
        return await get_recommendations(
            user_id=current_user["id"],
            seed_tracks=seed_tracks,
            seed_artists=seed_artists,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/similar-tracks")
async def get_similar_tracks(
    track_id: str,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get tracks similar to a given track"""
    try:
        return await get_recommendations(
            user_id=current_user["id"],
            seed_tracks=[track_id],
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 