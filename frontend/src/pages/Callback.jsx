import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Callback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Get the authorization code from the URL query parameters
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        try {
          const apiUrl = `${import.meta.env.VITE_API_URL}/spotify/callback`;
          console.log('Making request to:', apiUrl);
          
          // Exchange the code for an access token using your backend
          const response = await axios.get(apiUrl, {
            params: { code },
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid response from server');
          }
          
          console.log('Token exchange response:', response.data);
          
          const { access_token, refresh_token, user } = response.data;
          
          if (!access_token || !user) {
            throw new Error('Missing required data from server response');
          }
          
          // Login with both tokens and user data
          console.log('Attempting login with tokens...');
          const success = await login(access_token, refresh_token, user);
          console.log('Login success:', success);
          
          if (success) {
            // Clear the URL parameters to prevent duplicate requests
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('Redirecting to dashboard...');
            navigate('/dashboard');
          } else {
            console.log('Login failed, redirecting to login...');
            navigate('/login');
          }
        } catch (error) {
          console.error('Error exchanging code for token:', error);
          console.error('Error details:', {
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params,
            status: error.response?.status,
            data: error.response?.data
          });
          navigate('/login');
        }
      } else {
        console.log('No code found in URL, redirecting to login...');
        navigate('/login');
      }
    };

    handleCallback();
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
};

export default Callback; 