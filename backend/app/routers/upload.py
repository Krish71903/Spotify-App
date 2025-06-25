from fastapi import APIRouter, Depends, UploadFile, File, Form, Header, HTTPException
from typing import Optional
import httpx
import logging
import os
from pathlib import Path
import json

router = APIRouter()
logger = logging.getLogger(__name__)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

SPOTIFY_API_BASE = "https://api.spotify.com/v1"

@router.get("/playlists")
async def get_user_playlists(
    authorization: Optional[str] = Header(None),
):
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="No authorization header provided")
            
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")

        # Extract the token from the Bearer header
        token = authorization.split(" ")[1]
            
        logger.info("Fetching user playlists")
        
        async with httpx.AsyncClient() as client:
            # Get current user's playlists
            response = await client.get(
                f"{SPOTIFY_API_BASE}/me/playlists",
                params={"limit": 50},
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                logger.error(f"Spotify API error: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Spotify API error: {response.text}"
                )

            playlists = response.json()
            logger.info(f"Found {len(playlists.get('items', []))} playlists")
            return playlists

    except Exception as e:
        logger.error(f"Error fetching playlists: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        return {
            "error": {
                "status": 500,
                "message": str(e)
            }
        }

@router.post("/upload")
async def upload_track(
    file: UploadFile = File(...),
    playlist_id: Optional[str] = Form(None),
    add_to_liked: bool = Form(False),
    authorization: Optional[str] = Header(None),
):
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="No authorization header provided")
            
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")

        # Extract the token from the Bearer header
        token = authorization.split(" ")[1]

        if not file.filename.endswith('.mp3'):
            raise HTTPException(status_code=400, detail="Only MP3 files are allowed")

        # Save the uploaded file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        response = {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "playlist_id": playlist_id,
            "add_to_liked": add_to_liked
        }

        async with httpx.AsyncClient() as client:
            # First, search for the track on Spotify
            search_response = await client.get(
                f"{SPOTIFY_API_BASE}/search",
                params={
                    "q": file.filename.replace('.mp3', ''),
                    "type": "track",
                    "limit": 1
                },
                headers={"Authorization": f"Bearer {token}"}
            )

            if search_response.status_code != 200:
                logger.error(f"Error searching for track: {search_response.text}")
                response["error"] = f"Error searching for track: {search_response.text}"
                return response

            search_results = search_response.json()
            tracks = search_results.get('tracks', {}).get('items', [])

            if not tracks:
                response["error"] = "Could not find matching track on Spotify"
                return response

            track_uri = tracks[0]['uri']
            response["track_uri"] = track_uri
            response["track_name"] = tracks[0]['name']
            response["artist_name"] = tracks[0]['artists'][0]['name']

            # Add to playlist if specified
            if playlist_id:
                try:
                    playlist_response = await client.post(
                        f"{SPOTIFY_API_BASE}/playlists/{playlist_id}/tracks",
                        json={"uris": [track_uri]},
                        headers={
                            "Authorization": f"Bearer {token}",
                            "Content-Type": "application/json"
                        }
                    )
                    
                    if playlist_response.status_code == 201:
                        playlist = await client.get(
                            f"{SPOTIFY_API_BASE}/playlists/{playlist_id}",
                            headers={"Authorization": f"Bearer {token}"}
                        )
                        if playlist.status_code == 200:
                            playlist_data = playlist.json()
                            response["playlist_name"] = playlist_data["name"]
                            logger.info(f"Added to playlist: {playlist_data['name']}")
                    else:
                        logger.error(f"Error adding to playlist: {playlist_response.text}")
                        response["error"] = f"Error adding to playlist: {playlist_response.text}"
                except Exception as e:
                    logger.error(f"Error adding to playlist: {str(e)}")
                    response["error"] = f"Error adding to playlist: {str(e)}"

            # Add to liked songs if specified
            if add_to_liked:
                try:
                    liked_response = await client.put(
                        f"{SPOTIFY_API_BASE}/me/tracks",
                        json={"ids": [track_uri.split(':')[-1]]},
                        headers={
                            "Authorization": f"Bearer {token}",
                            "Content-Type": "application/json"
                        }
                    )
                    
                    if liked_response.status_code == 200:
                        logger.info("Added to liked songs")
                    else:
                        logger.error(f"Error adding to liked songs: {liked_response.text}")
                        response["error"] = f"Error adding to liked songs: {liked_response.text}"
                except Exception as e:
                    logger.error(f"Error adding to liked songs: {str(e)}")
                    response["error"] = f"Error adding to liked songs: {str(e)}"

        # Clean up the file
        os.remove(file_path)

        return response

    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        return {
            "error": {
                "status": 500,
                "message": str(e)
            }
        } 