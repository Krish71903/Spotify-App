from fastapi import APIRouter, Depends, HTTPException
from ..spotify_auth import get_current_user
from ..data_pipeline import analyze_user_data
from typing import List, Dict

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/top-tracks")
async def get_top_tracks(
    time_range: str = "medium_term",
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's top tracks"""
    try:
        return await analyze_user_data.get_top_tracks(current_user["id"], time_range, limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/top-artists")
async def get_top_artists(
    time_range: str = "medium_term",
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's top artists"""
    try:
        return await analyze_user_data.get_top_artists(current_user["id"], time_range, limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/audio-features")
async def get_audio_features(
    track_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Get audio features for tracks"""
    try:
        return await analyze_user_data.get_audio_features(track_ids)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 