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

  useEffect(() => {
    const initializeDashboard = async () => {
      // Check for token in URL (from Spotify callback)
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (token) {
        // Remove token from URL
        window.history.replaceState({}, document.title, '/dashboard');
        
        // Login with token
        const success = await login(token);
        if (!success) {
          navigate('/login');
          return;
        }
      }
      
      // If no user is logged in, redirect to login
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        // Fetch user stats
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/analysis/top-tracks`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user, accessToken, login, navigate, location]);

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Tracks */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Top Tracks</h2>
            {stats?.tracks?.map((track, index) => (
              <div key={track.id} className="flex items-center space-x-3 mb-3">
                <span className="text-indigo-300">{index + 1}</span>
                <img
                  src={track.album.images[2]?.url}
                  alt={track.name}
                  className="w-12 h-12 rounded"
                />
                <div>
                  <p className="font-medium">{track.name}</p>
                  <p className="text-sm text-indigo-200">{track.artists[0].name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Top Artists */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Top Artists</h2>
            {stats?.artists?.map((artist, index) => (
              <div key={artist.id} className="flex items-center space-x-3 mb-3">
                <span className="text-indigo-300">{index + 1}</span>
                <img
                  src={artist.images[2]?.url}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full"
                />
                <p className="font-medium">{artist.name}</p>
              </div>
            ))}
          </div>

          {/* Audio Features */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Features</h2>
            {stats?.features && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Danceability</span>
                  <span>{Math.round(stats.features.danceability * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-400 h-2 rounded-full"
                    style={{ width: `${stats.features.danceability * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between">
                  <span>Energy</span>
                  <span>{Math.round(stats.features.energy * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-400 h-2 rounded-full"
                    style={{ width: `${stats.features.energy * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between">
                  <span>Valence</span>
                  <span>{Math.round(stats.features.valence * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-400 h-2 rounded-full"
                    style={{ width: `${stats.features.valence * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 