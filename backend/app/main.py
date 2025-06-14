from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import os
from dotenv import load_dotenv
from .routers import auth, analysis, recommendations

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Spotify Analyzer API",
    description="API for analyzing Spotify listening habits and generating recommendations",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Spotify Analyzer API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/callback")
async def callback(code: str):
    """Handle Spotify OAuth callback"""
    return {"code": code}

# Import and include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 