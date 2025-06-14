from fastapi import APIRouter, HTTPException, Depends
import requests
import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta
from .spotify_auth import get_spotify_headers, SPOTIFY_API_BASE_URL, get_spotify_api_client
from spotipy import Spotify

router = APIRouter()

class AnalyzeUserData:
    def __init__(self):
        self.sp = None

    async def get_top_tracks(self, user_id: str, time_range: str = "medium_term", limit: int = 20) -> List[Dict[str, Any]]:
        """Get user's top tracks"""
        try:
            tracks = self.sp.current_user_top_tracks(time_range=time_range, limit=limit)
            return tracks["items"]
        except Exception as e:
            raise Exception(f"Error getting top tracks: {str(e)}")

    async def get_top_artists(self, user_id: str, time_range: str = "medium_term", limit: int = 20) -> List[Dict[str, Any]]:
        """Get user's top artists"""
        try:
            artists = self.sp.current_user_top_artists(time_range=time_range, limit=limit)
            return artists["items"]
        except Exception as e:
            raise Exception(f"Error getting top artists: {str(e)}")

    async def get_audio_features(self, track_ids: List[str]) -> List[Dict[str, Any]]:
        """Get audio features for tracks"""
        try:
            features = self.sp.audio_features(track_ids)
            return features
        except Exception as e:
            raise Exception(f"Error getting audio features: {str(e)}")

    async def get_recently_played(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's recently played tracks"""
        try:
            recent = self.sp.current_user_recently_played(limit=limit)
            return recent["items"]
        except Exception as e:
            raise Exception(f"Error getting recently played: {str(e)}")

    async def get_playlists(self) -> List[Dict[str, Any]]:
        """Get user's playlists"""
        try:
            playlists = self.sp.current_user_playlists()
            return playlists["items"]
        except Exception as e:
            raise Exception(f"Error getting playlists: {str(e)}")

    def set_token(self, token: str):
        """Set the Spotify token for the client"""
        self.sp = get_spotify_api_client(token)

# Create a singleton instance
analyze_user_data = AnalyzeUserData()

async def get_user_top_tracks(access_token: str, time_range: str = "medium_term", limit: int = 50) -> List[Dict[str, Any]]:
    """Fetch user's top tracks from Spotify"""
    headers = get_spotify_headers(access_token)
    response = requests.get(
        f"{SPOTIFY_API_BASE_URL}/me/top/tracks",
        headers=headers,
        params={"time_range": time_range, "limit": limit}
    )
    response.raise_for_status()
    return response.json()["items"]

async def get_track_features(access_token: str, track_ids: List[str]) -> List[Dict[str, Any]]:
    """Fetch audio features for multiple tracks"""
    headers = get_spotify_headers(access_token)
    response = requests.get(
        f"{SPOTIFY_API_BASE_URL}/audio-features",
        headers=headers,
        params={"ids": ",".join(track_ids)}
    )
    response.raise_for_status()
    return response.json()["audio_features"]

async def get_recently_played(access_token: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Fetch user's recently played tracks"""
    headers = get_spotify_headers(access_token)
    response = requests.get(
        f"{SPOTIFY_API_BASE_URL}/me/player/recently-played",
        headers=headers,
        params={"limit": limit}
    )
    response.raise_for_status()
    return response.json()["items"]

def process_track_data(tracks: List[Dict[str, Any]], features: List[Dict[str, Any]]) -> pd.DataFrame:
    """Process track data and audio features into a DataFrame"""
    # Create a dictionary to map track IDs to their features
    features_dict = {f["id"]: f for f in features if f is not None}
    
    # Process tracks and combine with features
    processed_data = []
    for track in tracks:
        track_id = track["id"]
        if track_id in features_dict:
            track_data = {
                "id": track_id,
                "name": track["name"],
                "artist": track["artists"][0]["name"],
                "popularity": track["popularity"],
                "duration_ms": track["duration_ms"],
                "danceability": features_dict[track_id]["danceability"],
                "energy": features_dict[track_id]["energy"],
                "key": features_dict[track_id]["key"],
                "loudness": features_dict[track_id]["loudness"],
                "mode": features_dict[track_id]["mode"],
                "speechiness": features_dict[track_id]["speechiness"],
                "acousticness": features_dict[track_id]["acousticness"],
                "instrumentalness": features_dict[track_id]["instrumentalness"],
                "liveness": features_dict[track_id]["liveness"],
                "valence": features_dict[track_id]["valence"],
                "tempo": features_dict[track_id]["tempo"]
            }
            processed_data.append(track_data)
    
    return pd.DataFrame(processed_data)

@router.get("/user/top-tracks")
async def get_user_top_tracks_endpoint(access_token: str, time_range: str = "medium_term"):
    """Endpoint to get user's top tracks with audio features"""
    try:
        # Get top tracks
        tracks = await get_user_top_tracks(access_token, time_range)
        track_ids = [track["id"] for track in tracks]
        
        # Get audio features
        features = await get_track_features(access_token, track_ids)
        
        # Process and return data
        df = process_track_data(tracks, features)
        return df.to_dict(orient="records")
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/recently-played")
async def get_recently_played_endpoint(access_token: str):
    """Endpoint to get user's recently played tracks with audio features"""
    try:
        # Get recently played tracks
        recent_tracks = await get_recently_played(access_token)
        track_ids = [item["track"]["id"] for item in recent_tracks]
        
        # Get audio features
        features = await get_track_features(access_token, track_ids)
        
        # Process and return data
        df = process_track_data([item["track"] for item in recent_tracks], features)
        return df.to_dict(orient="records")
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=str(e)) 