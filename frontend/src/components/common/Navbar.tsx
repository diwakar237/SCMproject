import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User as UserIcon, LogOut, Menu, X, Building2, BookmarkCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-brand-700 hover:text-brand-800 transition-colors">
              <Building2 className="w-7 h-7 text-green-600" />
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Smart<span className="text-green-600">Venue</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link
                to="/venues"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/venues')
                    ? 'text-green-700 bg-green-50 font-semibold'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                Explore Venues
              </Link>

              <Link
                to="/recommendations"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/recommendations')
                    ? 'text-green-700 bg-green-50 font-semibold'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                AI Recommender
              </Link>

              <Link
                to="/budget-estimator"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/budget-estimator')
                    ? 'text-green-700 bg-green-50 font-semibold'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                Budget Estimator
              </Link>


              {user && (
                <Link
                  to="/bookings"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/bookings')
                      ? 'text-green-700 bg-green-50 font-semibold'
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4" />
                  My Bookings
                </Link>
              )}

              {(isOwner || isAdmin) && (
                <Link
                  to="/owner"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/owner')
                      ? 'text-green-700 bg-green-50 font-semibold'
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Owner Portal
                </Link>
              )}
            </div>
          </div>

          {/* Right Section / Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700">
                  <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>{user.fullName}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 p-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/venues"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Explore Venues
          </Link>
          <Link
            to="/recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            AI Recommender
          </Link>
          <Link
            to="/budget-estimator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Budget Estimator
          </Link>

          {user && (
            <Link
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              My Bookings
            </Link>
          )}
          {(isOwner || isAdmin) && (
            <Link
              to="/owner"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Owner Portal
            </Link>
          )}

          <div className="pt-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-800 px-3">
                  Signed in as <span className="font-bold">{user.fullName}</span> ({user.role})
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
