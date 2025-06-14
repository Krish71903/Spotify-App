import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Recommendations() {
  const { accessToken } = useAuth();
  const [topTracks, setTopTracks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/analysis/user/top-tracks`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        setTopTracks(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchTopTracks();
    }
  }, [accessToken]);

  const handleTrackSelect = async (track) => {
    try {
      setLoading(true);
      setSelectedTrack(track);
      
      // Train the model with user's top tracks
      await axios.post(
        `${import.meta.env.VITE_API_URL}/recommendations/train`,
        topTracks,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      // Get recommendations based on selected track
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/recommendations/${track.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      setRecommendations(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading recommendations: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Select a track to get recommendations
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topTracks.map((track) => (
            <button
              key={track.id}
              onClick={() => handleTrackSelect(track)}
              className={`p-4 rounded-lg border ${
                selectedTrack?.id === track.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-600'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{track.name}</div>
              <div className="text-sm text-gray-500">{track.artist}</div>
            </button>
          ))}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recommended Tracks
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((track) => (
              <div
                key={track.id}
                className="p-4 rounded-lg border border-gray-200"
              >
                <div className="text-sm font-medium text-gray-900">
                  {track.name}
                </div>
                <div className="text-sm text-gray-500">{track.artist}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Danceability:</span>{' '}
                    {Math.round(track.danceability * 100)}%
                  </div>
                  <div>
                    <span className="font-medium">Energy:</span>{' '}
                    {Math.round(track.energy * 100)}%
                  </div>
                  <div>
                    <span className="font-medium">Valence:</span>{' '}
                    {Math.round(track.valence * 100)}%
                  </div>
                  <div>
                    <span className="font-medium">Tempo:</span>{' '}
                    {Math.round(track.tempo)} BPM
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 