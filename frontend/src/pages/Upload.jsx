import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Upload = () => {
  const { accessToken } = useAuth();
  const [file, setFile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [addToLiked, setAddToLiked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, [accessToken]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      if (!accessToken) {
        setMessage('No access token available. Please log in.');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/upload/playlists`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Playlists response:', response.data);
      if (response.data && response.data.items) {
        setPlaylists(response.data.items);
      } else {
        console.error('Unexpected playlist response format:', response.data);
        setMessage('Error: Unexpected playlist data format');
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setMessage('Error fetching playlists: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'audio/mpeg') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setMessage('Please select a valid MP3 file');
      setFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    if (selectedPlaylist) {
      formData.append('playlist_id', selectedPlaylist);
    }
    formData.append('add_to_liked', addToLiked);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Build success message
      let successMessage = 'File uploaded successfully!';
      
      if (response.data.track_name) {
        successMessage += `\nTrack: ${response.data.track_name} by ${response.data.artist_name}`;
      }
      
      if (response.data.playlist_name) {
        successMessage += `\nAdded to playlist: ${response.data.playlist_name}`;
      }
      
      if (response.data.add_to_liked) {
        successMessage += '\nAdded to Liked Songs';
      }

      setMessage(successMessage);
      setFile(null);
      setSelectedPlaylist('');
      setAddToLiked(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      setMessage('Error uploading file: ' + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Upload MP3 to Spotify
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Select MP3 File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".mp3"
                  onChange={handleFileChange}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
                />
              </div>
              {file && (
                <p className="text-sm text-gray-300 mt-2">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* Playlist Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Add to Playlist (Optional)
              </label>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-400"></div>
                </div>
              ) : (
                <select
                  value={selectedPlaylist}
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200"
                >
                  <option value="" className="bg-gray-800">Select a playlist</option>
                  {playlists.map((playlist) => (
                    <option 
                      key={playlist.id} 
                      value={playlist.id}
                      className="bg-gray-800"
                    >
                      {playlist.name} ({playlist.tracks.total} tracks)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Liked Songs Option */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <input
                type="checkbox"
                id="liked"
                checked={addToLiked}
                onChange={(e) => setAddToLiked(e.target.checked)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-white/10 rounded"
              />
              <label htmlFor="liked" className="text-sm text-gray-200">
                Add to Liked Songs
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || uploading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                !file || uploading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02]'
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Upload'
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-500/20 border border-red-500/30' 
                  : 'bg-green-500/20 border border-green-500/30'
              }`}>
                <p className={`text-sm ${
                  message.includes('Error') ? 'text-red-200' : 'text-green-200'
                } whitespace-pre-line`}>
                  {message}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload; 