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
import logging
import traceback

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
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-library-modify",
    "user-library-read"
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
    print(f"Received callback with code: {code}")  # Debug log
    
    # Check if environment variables are set
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET or not SPOTIFY_REDIRECT_URI:
        error_msg = "Missing required environment variables"
        print(error_msg)
        print(f"CLIENT_ID: {'Set' if SPOTIFY_CLIENT_ID else 'Missing'}")
        print(f"CLIENT_SECRET: {'Set' if SPOTIFY_CLIENT_SECRET else 'Missing'}")
        print(f"REDIRECT_URI: {'Set' if SPOTIFY_REDIRECT_URI else 'Missing'}")
        raise HTTPException(status_code=400, detail=error_msg)
    
    try:
        # Exchange authorization code for access token
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
            "client_id": SPOTIFY_CLIENT_ID,
            "client_secret": SPOTIFY_CLIENT_SECRET
        }
        
        print(f"Making token request with data: {token_data}")  # Debug log
        response = requests.post(SPOTIFY_TOKEN_URL, data=token_data)
        
        if response.status_code != 200:
            print(f"Token request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            raise HTTPException(status_code=400, detail=f"Token request failed: {response.text}")
        
        tokens = response.json()
        print(f"Received tokens: {tokens}")  # Debug log
        
        # Get user profile
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        user_response = requests.get(f"{SPOTIFY_API_BASE_URL}/me", headers=headers)
        
        if user_response.status_code != 200:
            print(f"User profile request failed with status {user_response.status_code}")
            print(f"Response: {user_response.text}")
            raise HTTPException(status_code=400, detail=f"User profile request failed: {user_response.text}")
        
        user_data = user_response.json()
        print(f"Received user data: {user_data}")  # Debug log
        
        # Return both access token and refresh token
        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens.get("refresh_token"),  # Use get() in case refresh_token is not present
            "expires_in": tokens["expires_in"],
            "user": user_data
        }
        
    except requests.exceptions.RequestException as e:
        print(f"Error in callback: {str(e)}")  # Debug log
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Unexpected error in callback: {str(e)}")  # Debug log
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
        # Log token for debugging (first 10 chars only)
        logging.info(f"Received token: {token[:10]}...")
        
        # Create Spotify client
        sp = Spotify(auth=token)
        
        # Get user profile
        user = sp.current_user()
        
        # Add the access token to the user data
        user["access_token"] = token
        
        return user
    except Exception as e:
        logging.error(f"Error in get_current_user: {str(e)}")
        logging.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_spotify_api_client(token: str):
    """Create a Spotify API client with the given token"""
    try:
        return Spotify(auth=token)
    except Exception as e:
        logging.error(f"Error creating Spotify client: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Error initializing Spotify client: {str(e)}"
        ) 