import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Users, Calendar, ArrowRight, ShieldCheck, Clock, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { apiClient } from '../api/client';
import { Venue, PageResponse } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [eventType, setEventType] = useState('');
  const [guests, setGuests] = useState('');
  const [featuredVenues, setFeaturedVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await apiClient.get<PageResponse<Venue>>('/venues?size=3&sortBy=rating&sortDir=desc');
        setFeaturedVenues(res.data.content);
      } catch (err) {
        console.error('Failed to load featured venues', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.append('city', city.trim());
    if (eventType) params.append('eventType', eventType);
    if (guests) params.append('minCapacity', guests);
    navigate(`/venues?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>Intelligent Venue Booking & Parking Assistance</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Discover & Book Perfect Venues <br className="hidden sm:inline" />
            <span className="text-green-400">Without Booking Conflicts</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-normal">
            Real-time availability, instant cost breakdown, DB-locked double-booking prevention, and predictive parking assistance for seamless events.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl text-gray-800 grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-4xl mx-auto border border-gray-100"
          >
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 focus-within:bg-white transition-all">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="City (e.g. New York)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 focus-within:bg-white transition-all">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-gray-700"
              >
                <option value="">Any Event Type</option>
                <option value="WEDDING">Wedding</option>
                <option value="CONFERENCE">Conference</option>
                <option value="BIRTHDAY">Birthday</option>
                <option value="CORPORATE">Corporate</option>
                <option value="GALA">Gala Dinner</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 focus-within:bg-white transition-all">
              <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="number"
                placeholder="Min Guests"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Top-Rated Venues</h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Handpicked venues with certified amenities and verified availability.</p>
          </div>
          <Link
            to="/venues"
            className="inline-flex items-center gap-1.5 text-green-700 hover:text-green-800 font-semibold text-sm group"
          >
            <span>View all 12 venues</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVenues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-48 bg-gradient-to-br from-green-700 to-gray-800 relative flex items-center justify-center text-white">
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {venue.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{venue.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm font-medium opacity-75">{venue.city}</span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{venue.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{venue.address}</span>
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-2">{venue.description}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-semibold">From</span>
                      <div className="text-lg font-bold text-green-700">
                        ${venue.basePricePerDay.toLocaleString()}
                        <span className="text-xs text-gray-500 font-normal"> / day</span>
                      </div>
                    </div>

                    <Link
                      to={`/venues/${venue.id}`}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-xs rounded-lg transition-colors"
                    >
                      <span>Check Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Architecture Highlights */}
      <section className="bg-gray-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Zero Overlapping Bookings</h3>
            <p className="text-sm text-gray-600">
              Transactions protected with database-level pessimistic write locking guarantee no conflicting confirmations occur under concurrency.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Instant Availability Engine</h3>
            <p className="text-sm text-gray-600">
              Live checks against confirmed slots (Full Day, Morning, Evening) with immediate status feedback and capacity validation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Transparent Lifecycle</h3>
            <p className="text-sm text-gray-600">
              Status tracking across Pending, Confirmed, Rejected, and Cancelled with immutable audit logs and printable official receipts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
