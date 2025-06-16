import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Dashboard = () => {
  const { user, accessToken, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term'); // short_term, medium_term, long_term
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [musicPreferences, setMusicPreferences] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user) {
        console.log('not user');
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        // Fetch top tracks and artists
        const [tracksResponse, artistsResponse, recentResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/analysis/top-tracks?time_range=${timeRange}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/analysis/top-artists?time_range=${timeRange}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/analysis/recently-played`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })
        ]);

        setStats({
          tracks: tracksResponse.data,
          artists: artistsResponse.data
        });
        setRecentlyPlayed(recentResponse.data);

        // Calculate music preferences from top tracks
        const preferences = calculateMusicPreferences(tracksResponse.data);
        setMusicPreferences(preferences);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user, accessToken, navigate, timeRange]);

  const calculateMusicPreferences = (tracks) => {
    const features = tracks.reduce((acc, track) => {
      Object.keys(track.audio_features).forEach(key => {
        if (!acc[key]) acc[key] = 0;
        acc[key] += track.audio_features[key];
      });
      return acc;
    }, {});

    // Calculate averages
    Object.keys(features).forEach(key => {
      features[key] = features[key] / tracks.length;
    });

    return features;
  };

  const radarChartData = {
    labels: ['Danceability', 'Energy', 'Valence', 'Acousticness', 'Instrumentalness', 'Liveness'],
    datasets: [
      {
        label: 'Your Music Preferences',
        data: musicPreferences ? [
          musicPreferences.danceability,
          musicPreferences.energy,
          musicPreferences.valence,
          musicPreferences.acousticness,
          musicPreferences.instrumentalness,
          musicPreferences.liveness
        ] : [],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  const radarChartOptions = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          backdropColor: 'transparent',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* User Profile Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            {user.images?.[0]?.url && (
              <img
                src={user.images[0].url}
                alt={user.display_name}
                className="w-20 h-20 rounded-full border-2 border-indigo-400"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{user.display_name}</h1>
              <p className="text-indigo-200">{user.followers?.total} followers</p>
              <p className="text-indigo-200">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeRange('short_term')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'short_term'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/10 text-indigo-200 hover:bg-white/20'
              }`}
            >
              Last 4 Weeks
            </button>
            <button
              onClick={() => setTimeRange('medium_term')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'medium_term'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/10 text-indigo-200 hover:bg-white/20'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeRange('long_term')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'long_term'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/10 text-indigo-200 hover:bg-white/20'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Tracks */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Top Tracks</h2>
            <div className="space-y-4">
              {stats?.tracks?.slice(0, 5).map((track, index) => (
                <div key={track.id} className="flex items-center space-x-3">
                  <span className="text-indigo-300 w-6">{index + 1}</span>
                  <img
                    src={track.album.images[2]?.url}
                    alt={track.name}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-indigo-200 truncate">{track.artists[0].name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Artists */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Top Artists</h2>
            <div className="space-y-4">
              {stats?.artists?.slice(0, 5).map((artist, index) => (
                <div key={artist.id} className="flex items-center space-x-3">
                  <span className="text-indigo-300 w-6">{index + 1}</span>
                  <img
                    src={artist.images[2]?.url}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <p className="font-medium truncate">{artist.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Played */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recently Played</h2>
            <div className="space-y-4">
              {recentlyPlayed?.slice(0, 5).map((item, index) => (
                <div key={item.track.id} className="flex items-center space-x-3">
                  <span className="text-indigo-300 w-6">{index + 1}</span>
                  <img
                    src={item.track.album.images[2]?.url}
                    alt={item.track.name}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.track.name}</p>
                    <p className="text-sm text-indigo-200 truncate">{item.track.artists[0].name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Music Preferences Radar Chart */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Music Preferences</h2>
          <div className="h-96">
            <Radar data={radarChartData} options={radarChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 