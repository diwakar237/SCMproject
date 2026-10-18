import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Notification } from '../../types';
import {
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Building2,
  BookmarkCheck,
  Briefcase,
  ListTodo,
  Users,
  ShieldAlert,
  Bell,
  Check,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/notifications');
        setNotifications(response.data || []);
      } catch {
        // Non-critical, ignore if unauthenticated
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

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
            <div className="hidden lg:ml-6 lg:flex lg:space-x-1">
              <Link
                to="/venues"
                className={`inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isActive('/venues')
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                Venues
              </Link>

              <Link
                to="/recommendations"
                className={`inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isActive('/recommendations')
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                AI Match
              </Link>

              <Link
                to="/budget-estimator"
                className={`inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isActive('/budget-estimator')
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                Budgets
              </Link>

              <Link
                to="/vendors"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isActive('/vendors')
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Vendors
              </Link>

              <Link
                to="/planner"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isActive('/planner')
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                Planner
              </Link>

              <Link
                to="/events"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isActive('/events')
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Guests & RSVP
              </Link>

              {user && (
                <Link
                  to="/bookings"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isActive('/bookings')
                      ? 'text-green-700 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  My Bookings
                </Link>
              )}

              {(isOwner || isAdmin) && (
                <Link
                  to="/owner"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isActive('/owner')
                      ? 'text-green-700 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Owner Portal
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isActive('/admin')
                      ? 'text-rose-700 bg-rose-50 font-bold'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right Section / Auth & Notifications */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-1.5 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 relative transition"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-900">Notifications ({unreadCount} unread)</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-green-600 hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500">No notifications yet</div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 text-xs transition flex justify-between items-start gap-2 ${
                                !n.isRead ? 'bg-green-50/50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div>
                                <h5 className="font-bold text-gray-900">{n.title}</h5>
                                <p className="text-gray-600 mt-0.5">{n.message}</p>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              {!n.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(n.id)}
                                  className="p-1 text-gray-400 hover:text-green-600"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700">
                  <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>{user.fullName}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 p-2 rounded-md hover:bg-gray-100 transition-colors text-xs font-medium"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 text-xs font-semibold rounded-md hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs font-semibold rounded-md shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
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
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/venues"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Venues
          </Link>
          <Link
            to="/recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            AI Match
          </Link>
          <Link
            to="/budget-estimator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Budget Estimator
          </Link>
          <Link
            to="/vendors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Vendors
          </Link>
          <Link
            to="/planner"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Planner
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Guests & RSVP
          </Link>

          {user && (
            <Link
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              My Bookings
            </Link>
          )}
          {(isOwner || isAdmin) && (
            <Link
              to="/owner"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Owner Portal
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-bold text-rose-600 hover:bg-rose-50"
            >
              Admin Console
            </Link>
          )}

          <div className="pt-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-800 px-3">
                  Signed in as <span className="font-bold">{user.fullName}</span> ({user.role})
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
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
