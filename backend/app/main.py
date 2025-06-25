from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import analysis, recommendations, upload
from .spotify_auth import router as spotify_router
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(spotify_router, prefix="/spotify", tags=["spotify"])
app.include_router(analysis.router)
app.include_router(recommendations.router)
app.include_router(upload.router, prefix="/upload", tags=["upload"])
@app.get("/")
async def root():
    return {"message": "Spotify Analyzer API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 