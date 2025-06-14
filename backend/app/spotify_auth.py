from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
import requests
import os
from typing import Optional
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

router = APIRouter()

# Spotify API credentials
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

# Spotify API endpoints
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"

# Scopes for Spotify API access
SCOPES = [
    "user-read-private",
    "user-read-email",
    "user-read-recently-played",
    "user-top-read",
    "user-read-currently-playing",
    "user-read-playback-state",
    "playlist-read-private",
    "playlist-read-collaborative"
]

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_spotify_auth_url():
    """Generate Spotify authorization URL"""
    params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "show_dialog": "true"
    }
    auth_url = f"{SPOTIFY_AUTH_URL}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return auth_url

@router.get("/login")
async def login():
    """Redirect to Spotify login page"""
    auth_url = get_spotify_auth_url()
    return RedirectResponse(url=auth_url)

@router.get("/callback")
async def callback(code: str):
    """Handle Spotify OAuth callback"""
    try:
        # Exchange authorization code for access token
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
            "client_id": SPOTIFY_CLIENT_ID,
            "client_secret": SPOTIFY_CLIENT_SECRET
        }
        
        response = requests.post(SPOTIFY_TOKEN_URL, data=token_data)
        response.raise_for_status()
        
        tokens = response.json()
        
        # Get user profile
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        user_response = requests.get(f"{SPOTIFY_API_BASE_URL}/me", headers=headers)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "expires_in": tokens["expires_in"],
            "user": user_data
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh Spotify access token"""
    try:
        token_data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": SPOTIFY_CLIENT_ID,
            "client_secret": SPOTIFY_CLIENT_SECRET
        }
        
        response = requests.post(SPOTIFY_TOKEN_URL, data=token_data)
        response.raise_for_status()
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=str(e))

def get_spotify_headers(access_token: str):
    """Get headers for Spotify API requests"""
    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

def get_spotify_client():
    """Create and return a Spotify client instance"""
    return SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=SPOTIFY_REDIRECT_URI,
        scope="user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private"
    )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user's Spotify profile using the access token"""
    try:
        sp = Spotify(auth=token)
        user = sp.current_user()
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_spotify_api_client(token: str):
    """Create a Spotify API client with the given token"""
    return Spotify(auth=token) 