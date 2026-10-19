import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Venue, VenueAvailability, Booking, TimeSlot, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { ParkingSection } from '../components/parking/ParkingSection';
import { getVenueGalleryImages, getVenueHeroImage } from '../utils/venueImages';


export const VenueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Availability checking state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [checkDate, setCheckDate] = useState<string>(defaultDateStr);
  const [availability, setAvailability] = useState<VenueAvailability | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState<string>(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('FULL_DAY');
  const [eventType, setEventType] = useState<string>('WEDDING');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [notes, setNotes] = useState<string>('');
  const [bookingSubmitting, setBookingSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch venue details
  useEffect(() => {
    const fetchVenue = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<Venue>(`/venues/${id}`);
        setVenue(res.data);
        if (res.data.capacity) {
          setGuestCount(Math.min(100, res.data.capacity));
        }

        try {
          const revRes = await apiClient.get<Review[]>(`/reviews/venues/${id}`);
          setReviews(Array.isArray(revRes.data) ? revRes.data : []);
        } catch {
          setReviews([]);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVenue();
  }, [id]);

  // Check availability when checkDate changes
  useEffect(() => {
    const checkSlotAvailability = async () => {
      if (!id || !checkDate) return;
      setCheckingAvailability(true);
      try {
        const res = await apiClient.get<VenueAvailability>(`/venues/${id}/availability`, {
          params: { date: checkDate },
        });
        setAvailability(res.data);
      } catch (err) {
        console.error('Failed to check availability', err);
      } finally {
        setCheckingAvailability(false);
      }
    };
    checkSlotAvailability();
  }, [id, checkDate]);

  // Live Cost Calculation
  const calculateCosts = () => {
    if (!venue) return { base: 0, serviceFee: 0, cleaning: 0, total: 0 };
    let base = venue.basePricePerDay;
    if (timeSlot === 'MORNING' || timeSlot === 'EVENING') {
      base = Math.round(base * 0.6 * 100) / 100;
    }
    const serviceFee = Math.round(base * 0.1 * 100) / 100;
    const cleaning = venue.cleaningFee || 0;
    const total = base + serviceFee + cleaning;
    return { base, serviceFee, cleaning, total };
  };

  const costs = calculateCosts();
  const isCapacityValid = venue ? guestCount > 0 && guestCount <= venue.capacity : false;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/venues/${id}` } });
      return;
    }

    if (!isCapacityValid) {
      setBookingError(`Guest count must be between 1 and ${venue?.capacity}`);
      return;
    }

    setBookingSubmitting(true);
    setBookingError(null);

    try {
      const res = await apiClient.post<Booking>('/bookings', {
        venueId: venue?.id,
        eventDate: bookingDate,
        timeSlot,
        eventType,
        guestCount,
        notes,
      });
      setBookingSuccess(res.data);
    } catch (err: any) {
      setBookingError(
        err?.response?.data?.message ||
          'Failed to submit booking. This date/slot may already be confirmed or unavailable.'
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error || 'Venue not found.'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/venues" className="hover:text-green-600">Venues</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 font-medium truncate">{venue.name}</span>
      </nav>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {venue.category}
            </span>
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-200">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
              <span>{venue.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal">({venue.reviewCount} reviews)</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{venue.name}</h1>
          <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
            <MapPin className="w-4 h-4 text-green-600" />
            <span>{venue.address}, {venue.city}</span>
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400 font-semibold uppercase">Daily Rate</div>
          <div className="text-3xl font-black text-green-700">
            ${venue.basePricePerDay.toLocaleString()}
            <span className="text-sm font-normal text-gray-500"> / day</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media, Description, Facilities, Availability */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Gallery & Perspectives */}
          <div className="space-y-3">
            <div className="h-80 sm:h-96 rounded-3xl overflow-hidden relative shadow-lg group">
              <img
                src={getVenueGalleryImages(venue)[selectedImageIndex] || getVenueHeroImage(venue)}
                alt={venue.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-2">
                  {venue.category}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md">{venue.name}</h3>
                <p className="text-sm text-white/90 flex flex-wrap items-center gap-2 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-emerald-300" />
                    {venue.address}, {venue.city}
                  </span>
                  <span>•</span>
                  <span>Capacity: {venue.capacity} guests</span>
                </p>
              </div>
            </div>

            {/* Interactive Thumbnail Selector */}
            <div className="grid grid-cols-4 gap-3">
              {getVenueGalleryImages(venue).map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-500/50 shadow-md scale-[1.02]'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                  aria-label={`View photo ${idx + 1} of ${venue.name}`}
                >
                  <img
                    src={imgUrl}
                    alt={`${venue.name} perspective ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-gray-900">About this Venue</h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {venue.description}
            </p>
          </div>

          {/* Facilities and Amenities */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Amenities & Facilities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {venue.facilities.split(',').map((facility, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{facility.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Events */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Supported Event Types</h2>
            <div className="flex flex-wrap gap-2">
              {venue.supportedEventTypes.split(',').map((type, idx) => (
                <span
                  key={idx}
                  className="bg-green-50 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200/50"
                >
                  {type.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Availability Checker */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Check Date Availability</h2>
                <p className="text-xs text-gray-500">Query live booking status for a specific date</p>
              </div>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {checkingAvailability ? (
              <div className="py-4 text-center text-sm text-gray-500">Checking schedule...</div>
            ) : availability ? (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  availability.available
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {availability.available ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {availability.available ? 'Slots Available on this Date' : 'Fully Booked / Confirmed'}
                    </div>
                    <div className="text-xs opacity-80">
                      Booked slots: {availability.bookedSlots.length > 0 ? availability.bookedSlots.join(', ') : 'None (Fully Free)'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBookingDate(checkDate)}
                  className="text-xs bg-white px-3 py-1.5 rounded-lg font-semibold shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-800"
                >
                  Use for Booking
                </button>
              </div>
            ) : null}
          </div>

          {/* Smart Parking Assistance */}
          <ParkingSection
            venueId={venue.id}
            isOwnerOrAdmin={user?.id === venue.ownerId || user?.role === 'ADMIN'}
          />

          {/* Customer Reviews & Feedback Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  Verified Guest Reviews ({reviews.length})
                </h3>
                <p className="text-xs text-gray-500">Feedback from customers with confirmed bookings</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{venue.rating ? venue.rating.toFixed(1) : '5.0'} / 5.0</span>
              </div>
            </div>

            {!Array.isArray(reviews) || reviews.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2">
                No published reviews yet. Guests who complete bookings can leave verified ratings.
              </p>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(reviews) ? reviews : []).map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900">{r.userName || 'Verified Customer'}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mt-1">{r.comment}</p>
                    <div className="flex gap-3 text-[10px] text-gray-400 mt-2">
                      {r.cleanlinessRating && <span>Cleanliness: {r.cleanlinessRating}★</span>}
                      {r.staffRating && <span>Staff: {r.staffRating}★</span>}
                      {r.valueRating && <span>Value: {r.valueRating}★</span>}
                      <span className="ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Right Column: Live Booking Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg space-y-6 sticky top-20">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">Book this Venue</h3>
              <p className="text-xs text-gray-500 mt-1">Instant calculation with server capacity verification</p>
            </div>

            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Event Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="FULL_DAY">Full Day (100% Base Rate)</option>
                  <option value="MORNING">Morning: 8:00 AM - 3:00 PM (60% Rate)</option>
                  <option value="EVENING">Evening: 4:00 PM - 11:30 PM (60% Rate)</option>
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="WEDDING">Wedding</option>
                  <option value="CONFERENCE">Conference</option>
                  <option value="BIRTHDAY">Birthday Celebration</option>
                  <option value="CORPORATE">Corporate Event</option>
                  <option value="GALA">Gala Dinner</option>
                  <option value="ANNIVERSARY">Anniversary</option>
                </select>
              </div>

              {/* Guest Count with Live Validation */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Expected Guests
                  </label>
                  <span className="text-[11px] text-gray-400">Max: {venue.capacity}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={venue.capacity}
                  required
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value || '0', 10))}
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    isCapacityValid
                      ? 'border-gray-300 focus:ring-green-500'
                      : 'border-red-400 text-red-700 focus:ring-red-500'
                  }`}
                />
                {!isCapacityValid && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Guest count must be between 1 and {venue.capacity}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Special Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catering setup, AV requirements, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/70 space-y-2 text-sm">
                <div className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Cost Breakdown
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Venue Base Cost:</span>
                  <span>${costs.base.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service Fee (10%):</span>
                  <span>${costs.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cleaning & Prep Fee:</span>
                  <span>${costs.cleaning.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-base">
                  <span>Estimated Total:</span>
                  <span className="text-green-700">${costs.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={bookingSubmitting || !isCapacityValid}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                {bookingSubmitting ? (
                  <span>Submitting Request...</span>
                ) : user ? (
                  <span>Request Booking</span>
                ) : (
                  <span>Sign In to Request Booking</span>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Protected with double-booking prevention lock</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Booking Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/60 transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl transition-all sm:max-w-md w-full space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-gray-900">Booking Request Submitted!</h3>
              <p className="text-sm text-gray-500">
                Your request <span className="font-bold text-gray-900">{bookingSuccess.bookingReference}</span> has been sent to the venue owner for review.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 text-left text-xs space-y-1.5 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Venue:</span>
                  <span className="font-semibold">{venue.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-semibold">{bookingSuccess.eventDate} ({bookingSuccess.timeSlot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-bold text-green-700">${bookingSuccess.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">
                    {bookingSuccess.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/bookings"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  View in My Bookings
                </Link>
                <button
                  onClick={() => setBookingSuccess(null)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
