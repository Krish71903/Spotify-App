from fastapi import APIRouter, Depends, HTTPException, Query
from ..spotify_auth import get_current_user, get_spotify_api_client
from typing import List, Dict, Optional
import logging
import traceback
import spotipy
from pydantic import BaseModel

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
logger = logging.getLogger(__name__)

class RecommendationRequest(BaseModel):
    track_id: str
    limit: Optional[int] = 20

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
    track_id: str = Query(..., description="Spotify track ID"),
    limit: int = Query(20, ge=1, le=100, description="Number of recommendations to return"),
    sp: spotipy.Spotify = Depends(get_spotify_api_client)
):
    try:
        # First verify the track exists
        try:
            track = sp.track(track_id)
            if not track:
                return {
                    "error": {
                        "status": 404,
                        "message": f"Track not found: {track_id}"
                    }
                }
        except Exception as e:
            logger.error(f"Error verifying track: {str(e)}")
            return {
                "error": {
                    "status": 404,
                    "message": f"Track not found: {track_id}"
                }
            }

        # Get recommendations
        try:
            recommendations = sp.recommendations(
                seed_tracks=[track_id],
                limit=limit,
            )
            return recommendations
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return {
                "error": {
                    "status": 400,
                    "message": str(e)
                }
            }

    except Exception as e:
        logger.error(f"Unexpected error in recommendations: {str(e)}")
        return {
            "error": {
                "status": 500,
                "message": str(e)
            }
        } 