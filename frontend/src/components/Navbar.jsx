import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ChartBarIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/10 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span className="text-xl font-bold text-white">Spotify Analyzer</span>
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-indigo-200 ${
                    isActive('/dashboard') ? 'border-b-2 border-white' : ''
                  }`}
                >
                  <HomeIcon className="w-5 h-5 mr-1" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/recommendations"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-indigo-200 ${
                    isActive('/recommendations') ? 'border-b-2 border-white' : ''
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5 mr-1" />
                  <span>Recommendations</span>
                </Link>
                <Link
                  to="/upload"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-indigo-200 ${
                    isActive('/upload') ? 'border-b-2 border-white' : ''
                  }`}
                >
                  <ArrowUpTrayIcon className="w-5 h-5 mr-1" />
                  <span>Upload</span>
                </Link>
                <Link
                  to="/profile"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-indigo-200 ${
                    isActive('/profile') ? 'border-b-2 border-white' : ''
                  }`}
                >
                  <UserIcon className="w-5 h-5 mr-1" />
                  <span>Profile</span>
                </Link>
              </div>
            )}
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={user.images?.[0]?.url}
                    alt={user.display_name}
                    className="w-8 h-8 rounded-full ring-2 ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-white">
                    {user.display_name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-indigo-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && user && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-white/10 text-white'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <HomeIcon className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link
              to="/recommendations"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/recommendations')
                  ? 'bg-white/10 text-white'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Recommendations</span>
              </div>
            </Link>
            <Link
              to="/upload"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/upload')
                  ? 'bg-white/10 text-white'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span>Upload</span>
              </div>
            </Link>
            <Link
              to="/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/profile')
                  ? 'bg-white/10 text-white'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </div>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-white/10">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <img
                  src={user.images?.[0]?.url}
                  alt={user.display_name}
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  {user.display_name}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-white hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 