import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Profile() {
  const { user, accessToken } = useAuth();
  const [topTracks, setTopTracks] = useState([]);
  const [musicPreferences, setMusicPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/analysis/user/top-tracks`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        setTopTracks(response.data);
        
        // Calculate music preferences
        const preferences = calculateMusicPreferences(response.data);
        setMusicPreferences(preferences);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const calculateMusicPreferences = (tracks) => {
    const preferences = {
      danceability: 0,
      energy: 0,
      valence: 0,
      acousticness: 0,
      instrumentalness: 0,
      liveness: 0,
    };

    tracks.forEach(track => {
      Object.keys(preferences).forEach(feature => {
        preferences[feature] += track[feature];
      });
    });

    Object.keys(preferences).forEach(feature => {
      preferences[feature] = (preferences[feature] / tracks.length) * 100;
    });

    return preferences;
  };

  const prepareChartData = (preferences) => {
    return {
      labels: Object.keys(preferences).map(key => 
        key.charAt(0).toUpperCase() + key.slice(1)
      ),
      datasets: [
        {
          label: 'Music Preferences (%)',
          data: Object.values(preferences),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
      ],
    };
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
        Error loading profile: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          {user?.images?.[0]?.url ? (
            <img
              src={user.images[0].url}
              alt={user.display_name}
              className="h-20 w-20 rounded-full"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl text-gray-500">
                {user?.display_name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.display_name}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Music Preferences Chart */}
      {musicPreferences && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Your Music Preferences
          </h3>
          <div className="h-80">
            <Bar
              data={prepareChartData(musicPreferences)}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Percentage',
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Top Tracks Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Your Top Tracks
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topTracks.slice(0, 6).map((track) => (
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
                  <span className="font-medium">Popularity:</span>{' '}
                  {track.popularity}%
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
    </div>
  );
} 