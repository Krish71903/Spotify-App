from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from ..spotify_auth import get_spotify_client, get_current_user
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/login")
async def login():
    """Redirect to Spotify login page"""
    client = get_spotify_client()
    auth_url = client.get_authorize_url()
    return RedirectResponse(auth_url)

@router.get("/callback")
async def callback(code: str):
    """Handle Spotify OAuth callback"""
    try:
        client = get_spotify_client()
        token = client.get_access_token(code)
        # Redirect to frontend with the token
        return RedirectResponse(
            url=f"http://127.0.0.1:5173/dashboard?token={token['access_token']}"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def get_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user's Spotify profile"""
    return current_user 