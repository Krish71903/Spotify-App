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
          `${import.meta.env.VITE_API_URL}/analysis/top-tracks`,
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
      
      // Get recommendations based on selected track
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/recommendations/similar-tracks?track_id=${track.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      setRecommendations(response.data);
      console.log(response.data);
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
              <div className="flex items-center space-x-3">
                <img
                  src={track.album.images[2]?.url}
                  alt={track.name}
                  className="w-12 h-12 rounded"
                />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{track.name}</div>
                  <div className="text-sm text-gray-500">{track.artists[0].name}</div>
                </div>
              </div>
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
                <div className="flex items-center space-x-3">
                  <img
                    src={track.album.images[2]?.url}
                    alt={track.name}
                    className="w-12 h-12 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {track.name}
                    </div>
                    <div className="text-sm text-gray-500">{track.artists[0].name}</div>
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