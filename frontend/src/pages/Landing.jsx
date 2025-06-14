import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MusicalNoteIcon, 
  ChartBarIcon, 
  SparklesIcon, 
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="card hover:scale-105 transition-all duration-300">
    <div className="flex flex-col items-center text-center">
      <div className="p-3 bg-indigo-100 rounded-full mb-4">
        <Icon className="w-8 h-8 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const Landing = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8">
              Discover Your
              <span className="text-indigo-600"> Music </span>
              Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Unlock insights about your music taste, get personalized recommendations,
              and share your musical journey with friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={login}
                className="spotify-btn group"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span>Connect with Spotify</span>
              </button>
              <Link
                to="/about"
                className="btn-secondary group"
              >
                Learn More
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Music Lovers
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to understand and enhance your music experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={MusicalNoteIcon}
              title="Music Analysis"
              description="Get detailed insights about your listening habits and music preferences"
            />
            <FeatureCard
              icon={ChartBarIcon}
              title="Visual Analytics"
              description="Beautiful charts and graphs to visualize your music taste"
            />
            <FeatureCard
              icon={SparklesIcon}
              title="Smart Recommendations"
              description="AI-powered music recommendations based on your taste"
            />
            <FeatureCard
              icon={UserGroupIcon}
              title="Share & Connect"
              description="Share your music profile and connect with friends"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to start your musical journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Your Spotify
              </h3>
              <p className="text-gray-600">
                Securely connect your Spotify account with just one click
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyze Your Music
              </h3>
              <p className="text-gray-600">
                Get detailed insights about your listening habits and preferences
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Discover & Share
              </h3>
              <p className="text-gray-600">
                Get personalized recommendations and share your music profile
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-16">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Discover Your Music Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of music lovers who are already exploring their musical taste
            </p>
            <button
              onClick={login}
              className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-200"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Spotify Analyzer</h3>
              <p className="text-gray-400">
                Discover insights about your music taste and get personalized recommendations
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Music Analysis</li>
                <li>Visual Analytics</li>
                <li>Recommendations</li>
                <li>Social Sharing</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Support</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Spotify Analyzer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 