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
  const [timeRange, setTimeRange] = useState('medium_term');
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
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  const radarChartOptions = {
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.3)',
          backdropColor: 'transparent',
          font: {
            size: 10,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const StatCard = ({ title, children, className = "" }) => (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 ${className}`}>
      <h3 className="text-lg font-semibold text-white/90 mb-4">{title}</h3>
      {children}
    </div>
  );

  const MusicItem = ({ item, index, type = 'track' }) => (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
      <span className="text-indigo-300 font-medium w-6 text-sm">{index + 1}</span>
      <img
        src={type === 'track' ? item.album?.images[2]?.url : item.images?.[2]?.url}
        alt={item.name}
        className={`w-10 h-10 ${type === 'artist' ? 'rounded-full' : 'rounded'} object-cover`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white/90 truncate text-sm">{item.name}</p>
        {type === 'track' && (
          <p className="text-xs text-white/60 truncate">{item.artists?.[0]?.name}</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Loading your music insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* User Profile - Compact */}
            <div className="flex items-center space-x-4">
              {user.images?.[0]?.url && (
                <img
                  src={user.images[0].url}
                  alt={user.display_name}
                  className="w-16 h-16 rounded-full border-2 border-white/20"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{user.display_name}</h1>
                <p className="text-white/60 text-sm">{user.followers?.total} followers</p>
              </div>
            </div>

            {/* Time Range Selector - Improved */}
            <div className="flex bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
              {[
                { value: 'short_term', label: '4 Weeks' },
                { value: 'medium_term', label: '6 Months' },
                { value: 'long_term', label: 'All Time' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === option.value
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Music Lists */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Tracks */}
              <StatCard title="Top Tracks">
                <div className="space-y-2">
                  {stats?.tracks?.slice(0, 5).map((track, index) => (
                    <MusicItem key={track.id} item={track} index={index} type="track" />
                  ))}
                </div>
              </StatCard>

              {/* Top Artists */}
              <StatCard title="Top Artists">
                <div className="space-y-2">
                  {stats?.artists?.slice(0, 5).map((artist, index) => (
                    <MusicItem key={artist.id} item={artist} index={index} type="artist" />
                  ))}
                </div>
              </StatCard>
            </div>

            {/* Recently Played - Full Width */}
            <StatCard title="Recently Played">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentlyPlayed?.slice(0, 6).map((item, index) => (
                  <MusicItem key={`${item.track.id}-${index}`} item={item.track} index={index} type="track" />
                ))}
              </div>
            </StatCard>
          </div>

          {/* Right Column - Music Preferences Chart */}
          <div className="lg:col-span-1">
            <StatCard title="Music Preferences" className="h-full">
              <div className="h-80">
                <Radar data={radarChartData} options={radarChartOptions} />
              </div>
              <div className="mt-4 text-xs text-white/60">
                Visual representation of your music taste based on audio features
              </div>
            </StatCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 