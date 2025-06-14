from fastapi import APIRouter, HTTPException
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
import joblib
import os

router = APIRouter()

class MusicRecommender:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = None
        self.feature_columns = [
            'danceability', 'energy', 'key', 'loudness', 'mode',
            'speechiness', 'acousticness', 'instrumentalness',
            'liveness', 'valence', 'tempo'
        ]
    
    def preprocess_data(self, df: pd.DataFrame) -> np.ndarray:
        """Preprocess the data for clustering"""
        # Scale the features
        features = df[self.feature_columns].values
        scaled_features = self.scaler.fit_transform(features)
        return scaled_features
    
    def train_model(self, df: pd.DataFrame, n_clusters: int = 5):
        """Train the K-means clustering model"""
        scaled_features = self.preprocess_data(df)
        self.model = KMeans(n_clusters=n_clusters, random_state=42)
        self.model.fit(scaled_features)
        return self.model.labels_
    
    def get_recommendations(self, df: pd.DataFrame, track_id: str, n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Get music recommendations based on a track"""
        if self.model is None:
            raise ValueError("Model not trained. Call train_model first.")
        
        # Get the track's features
        track_features = df[df['id'] == track_id][self.feature_columns].values
        if len(track_features) == 0:
            raise ValueError(f"Track {track_id} not found in the dataset")
        
        # Scale the features
        scaled_features = self.scaler.transform(track_features)
        
        # Get the cluster of the input track
        track_cluster = self.model.predict(scaled_features)[0]
        
        # Get all tracks in the same cluster
        cluster_tracks = df[self.model.labels_ == track_cluster]
        
        # Calculate similarity scores
        similarity_scores = cosine_similarity(
            scaled_features,
            self.scaler.transform(cluster_tracks[self.feature_columns])
        )[0]
        
        # Get top N recommendations
        top_indices = np.argsort(similarity_scores)[-n_recommendations-1:-1][::-1]
        recommendations = cluster_tracks.iloc[top_indices].to_dict('records')
        
        return recommendations

recommender = MusicRecommender()

@router.post("/train")
async def train_recommender(tracks_data: List[Dict[str, Any]]):
    """Train the recommendation model with user's tracks"""
    try:
        df = pd.DataFrame(tracks_data)
        labels = recommender.train_model(df)
        return {"message": "Model trained successfully", "n_clusters": len(np.unique(labels))}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/recommendations/{track_id}")
async def get_recommendations(track_id: str, n_recommendations: int = 5):
    """Get music recommendations based on a track"""
    try:
        # Load the user's tracks data
        # In a real application, this would be stored in a database
        tracks_data = []  # This should be populated with the user's tracks
        df = pd.DataFrame(tracks_data)
        
        recommendations = recommender.get_recommendations(df, track_id, n_recommendations)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def save_model(model_path: str = "models/music_recommender.joblib"):
    """Save the trained model"""
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(recommender, model_path)

def load_model(model_path: str = "models/music_recommender.joblib"):
    """Load a trained model"""
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return None 