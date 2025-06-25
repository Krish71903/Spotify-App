from fastapi import APIRouter, Depends, HTTPException
from ..spotify_auth import get_current_user, get_spotify_api_client
from ..data_pipeline import analyze_user_data
from typing import List, Dict
import logging

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/top-tracks")
async def get_top_tracks(
    time_range: str = "medium_term",
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's top tracks"""
    try:
        # Initialize Spotify client with the access token
        sp = get_spotify_api_client(current_user["access_token"])
        tracks = sp.current_user_top_tracks(time_range=time_range, limit=limit)
        
        # Get audio features for the tracks in smaller batches
        track_ids = [track["id"] for track in tracks["items"]]
        features = []
        
        # Process in batches of 20 (Spotify's limit)
        batch_size = 20
        for i in range(0, len(track_ids), batch_size):
            batch = track_ids[i:i + batch_size]
            try:
                batch_features = sp.audio_features(batch)
                features.extend(batch_features if batch_features else [])
            except Exception as e:
                logging.error(f"Error fetching audio features for batch: {str(e)}")
                # Continue with other batches even if one fails
                continue
        
        # Combine track data with audio features
        for track, feature in zip(tracks["items"], features):
            if feature:
                track["audio_features"] = feature
        
        return tracks["items"]
    except Exception as e:
        logging.error(f"Error in get_top_tracks: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/top-artists")
async def get_top_artists(
    time_range: str = "medium_term",
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's top artists"""
    try:
        # Initialize Spotify client with the access token
        sp = get_spotify_api_client(current_user["access_token"])
        artists = sp.current_user_top_artists(time_range=time_range, limit=limit)
        return artists["items"]
    except Exception as e:
        logging.error(f"Error in get_top_artists: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/recently-played")
async def get_recently_played(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get user's recently played tracks"""
    try:
        # Initialize Spotify client with the access token
        sp = get_spotify_api_client(current_user["access_token"])
        recent = sp.current_user_recently_played(limit=limit)
        
        # Get audio features for the tracks in smaller batches
        track_ids = [item["track"]["id"] for item in recent["items"]]
        features = []
        
        # Process in batches of 20 (Spotify's limit)
        batch_size = 20
        for i in range(0, len(track_ids), batch_size):
            batch = track_ids[i:i + batch_size]
            try:
                batch_features = sp.audio_features(batch)
                features.extend(batch_features if batch_features else [])
            except Exception as e:
                logging.error(f"Error fetching audio features for batch: {str(e)}")
                # Continue with other batches even if one fails
                continue
        
        # Combine track data with audio features
        for item, feature in zip(recent["items"], features):
            if feature:
                item["track"]["audio_features"] = feature
        
        return recent["items"]
    except Exception as e:
        logging.error(f"Error in get_recently_played: {str(e)}")
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