import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Booking, Venue, PageResponse } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const OwnerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'VENUES'>('BOOKINGS');

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Venues state
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [venueError, setVenueError] = useState<string | null>(null);

  // Action dialog state (Approve / Reject)
  const [actionBooking, setActionBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<'CONFIRMED' | 'REJECTED' | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Venue Edit / Create Modal state
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState<number | null>(null);
  const [venueFormData, setVenueFormData] = useState({
    name: '',
    city: 'New York',
    address: '',
    description: '',
    category: 'Banquet Hall',
    capacity: 200,
    basePricePerDay: 1500,
    cleaningFee: 150,
    supportedEventTypes: 'WEDDING,CORPORATE,BIRTHDAY',
    facilities: 'WIFI,PARKING,CATERING_KITCHEN,AUDIO_VISUAL,AIR_CONDITIONING',
    imageUrls: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
  });
  const [venueFormError, setVenueFormError] = useState<string | null>(null);
  const [savingVenue, setSavingVenue] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      setBookingError(null);
      const res = await apiClient.get<PageResponse<Booking>>('/bookings/owner?page=0&size=50');
      setBookings(res.data.content);
    } catch (err: unknown) {
      setBookingError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load incoming booking requests.'
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchVenues = async () => {
    try {
      setLoadingVenues(true);
      setVenueError(null);
      const res = await apiClient.get<PageResponse<Venue>>('/venues/my-venues?page=0&size=50');
      setVenues(res.data.content);
    } catch (err: unknown) {
      setVenueError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load your venues.'
      );
    } finally {
      setLoadingVenues(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'BOOKINGS') {
      fetchBookings();
    } else {
      fetchVenues();
    }
  }, [activeTab]);

  const handleOpenAction = (booking: Booking, type: 'CONFIRMED' | 'REJECTED') => {
    setActionBooking(booking);
    setActionType(type);
    setActionRemarks(type === 'CONFIRMED' ? 'Approved by venue owner' : 'Slot or venue unavailable');
    setActionFeedback(null);
  };

  const handleConfirmAction = async () => {
    if (!actionBooking || !actionType) return;
    try {
      setSubmittingAction(true);
      setActionFeedback(null);
      await apiClient.put(`/bookings/${actionBooking.id}/status`, {
        status: actionType,
        remarks: actionRemarks,
      });
      setActionBooking(null);
      setActionType(null);
      fetchBookings();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update booking status. Conflicting reservation exists.';
      setActionFeedback(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenCreateVenue = () => {
    setEditingVenueId(null);
    setVenueFormData({
      name: '',
      city: 'New York',
      address: '',
      description: '',
      category: 'Banquet Hall',
      capacity: 200,
      basePricePerDay: 1500,
      cleaningFee: 150,
      supportedEventTypes: 'WEDDING,CORPORATE,BIRTHDAY',
      facilities: 'WIFI,PARKING,CATERING_KITCHEN,AUDIO_VISUAL,AIR_CONDITIONING',
      imageUrls: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    });
    setVenueFormError(null);
    setShowVenueModal(true);
  };

  const handleOpenEditVenue = (v: Venue) => {
    setEditingVenueId(v.id);
    setVenueFormData({
      name: v.name,
      city: v.city,
      address: v.address,
      description: v.description,
      category: v.category,
      capacity: v.capacity,
      basePricePerDay: v.basePricePerDay,
      cleaningFee: v.cleaningFee,
      supportedEventTypes: v.supportedEventTypes,
      facilities: v.facilities,
      imageUrls: v.imageUrls,
    });
    setVenueFormError(null);
    setShowVenueModal(true);
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingVenue(true);
      setVenueFormError(null);
      if (editingVenueId) {
        await apiClient.put(`/venues/${editingVenueId}`, venueFormData);
      } else {
        await apiClient.post('/venues', venueFormData);
      }
      setShowVenueModal(false);
      fetchVenues();
    } catch (err: unknown) {
      setVenueFormError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to save venue listing.'
      );
    } finally {
      setSavingVenue(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Venue Management Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Approve or reject reservation requests with concurrency checking and manage venue property listings.
          </p>
        </div>

        {activeTab === 'VENUES' && (
          <button
            type="button"
            onClick={handleOpenCreateVenue}
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
          >
            + Create New Venue
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 my-6">
        <button
          type="button"
          onClick={() => setActiveTab('BOOKINGS')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'BOOKINGS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Incoming Bookings ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('VENUES')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'VENUES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Listed Venues ({venues.length})
        </button>
      </div>

      {/* Tab: BOOKINGS */}
      {activeTab === 'BOOKINGS' && (
        <div>
          {loadingBookings ? (
            <LoadingSkeleton count={3} />
          ) : bookingError ? (
            <ErrorMessage message={bookingError} onRetry={fetchBookings} />
          ) : bookings.length === 0 ? (
            <EmptyState
              title="No incoming booking requests"
              message="When customers submit reservations for your venues, they will appear here for your review and approval."
            />
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-slate-900">{b.venueName}</span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : b.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Ref: <span className="font-mono font-medium">{b.bookingReference}</span> • Customer:{' '}
                        <span className="font-semibold text-slate-700">{b.customerName}</span> ({b.customerEmail})
                      </p>
                    </div>

                    <div className="text-left lg:text-right">
                      <div className="text-xl font-bold text-slate-900">${b.totalCost?.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Total payout (incl fees)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 text-xs">
                    <div>
                      <span className="block text-slate-400 uppercase font-semibold">Date</span>
                      <span className="font-medium text-slate-800">{b.eventDate}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase font-semibold">Slot</span>
                      <span className="font-medium text-slate-800">{b.timeSlot}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase font-semibold">Event Type</span>
                      <span className="font-medium text-slate-800">{b.eventType}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase font-semibold">Guests</span>
                      <span className="font-medium text-slate-800">{b.guestCount}</span>
                    </div>
                  </div>

                  {b.notes && (
                    <div className="text-xs bg-slate-50 p-2 rounded text-slate-600 mb-3">
                      <span className="font-semibold text-slate-700">Notes: </span>
                      {b.notes}
                    </div>
                  )}

                  {/* Actions for PENDING bookings */}
                  {b.status === 'PENDING' && (
                    <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenAction(b, 'REJECTED')}
                        className="px-3 py-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition"
                      >
                        ✕ Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(b, 'CONFIRMED')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                      >
                        ✓ Approve Booking
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: VENUES */}
      {activeTab === 'VENUES' && (
        <div>
          {loadingVenues ? (
            <LoadingSkeleton count={3} />
          ) : venueError ? (
            <ErrorMessage message={venueError} onRetry={fetchVenues} />
          ) : venues.length === 0 ? (
            <EmptyState
              title="No venues registered yet"
              message="Add your first venue listing to start receiving booking requests from customers."
              actionLabel="+ Create Venue"
              onAction={handleOpenCreateVenue}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((v) => (
                <div
                  key={v.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition"
                >
                  <img
                    src={v.imageUrls?.split(',')[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80'}
                    alt={v.name}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{v.name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {v.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{v.city} • Capacity {v.capacity}</p>
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="text-sm font-bold text-blue-600">${v.basePricePerDay}/day</div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditVenue(v)}
                        className="text-xs font-semibold text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approve / Reject Dialog */}
      {actionBooking && actionType && (
        <ConfirmDialog
          isOpen={!!actionBooking}
          title={actionType === 'CONFIRMED' ? 'Approve Booking Request' : 'Reject Booking Request'}
          message={`Are you sure you want to ${actionType.toLowerCase()} reservation ${actionBooking.bookingReference} for ${actionBooking.venueName} on ${actionBooking.eventDate} (${actionBooking.timeSlot})?`}
          confirmLabel={
            submittingAction
              ? 'Processing...'
              : actionType === 'CONFIRMED'
              ? 'Confirm & Lock Slot'
              : 'Reject Reservation'
          }
          isDestructive={actionType === 'REJECTED'}
          onConfirm={handleConfirmAction}
          onCancel={() => setActionBooking(null)}
        >
          <div className="mt-3 text-left">
            <label htmlFor="actionRemarks" className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks (Sent to customer)
            </label>
            <input
              id="actionRemarks"
              type="text"
              value={actionRemarks}
              onChange={(e) => setActionRemarks(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {actionFeedback && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-medium">
                {actionFeedback}
              </div>
            )}
          </div>
        </ConfirmDialog>
      )}

      {/* Create / Edit Venue Modal */}
      {showVenueModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingVenueId ? 'Edit Venue Listing' : 'Create New Venue Listing'}
              </h2>
              <button
                type="button"
                onClick={() => setShowVenueModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {venueFormError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {venueFormError}
              </div>
            )}

            <form onSubmit={handleSaveVenue} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  value={venueFormData.name}
                  onChange={(e) => setVenueFormData({ ...venueFormData, name: e.target.value })}
                  placeholder="e.g. Grand Horizon Ballroom"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <select
                    value={venueFormData.city}
                    onChange={(e) => setVenueFormData({ ...venueFormData, city: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Houston">Houston</option>
                    <option value="Austin">Austin</option>
                    <option value="Seattle">Seattle</option>
                    <option value="Miami">Miami</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={venueFormData.category}
                    onChange={(e) => setVenueFormData({ ...venueFormData, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Banquet Hall">Banquet Hall</option>
                    <option value="Conference Center">Conference Center</option>
                    <option value="Outdoor & Garden">Outdoor & Garden</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="Hotel Ballroom">Hotel Ballroom</option>
                    <option value="Auditorium">Auditorium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={venueFormData.address}
                  onChange={(e) => setVenueFormData({ ...venueFormData, address: e.target.value })}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={venueFormData.description}
                  onChange={(e) => setVenueFormData({ ...venueFormData, description: e.target.value })}
                  placeholder="Describe your venue space, ambiance, and amenities..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={venueFormData.capacity}
                    onChange={(e) => setVenueFormData({ ...venueFormData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Price / Day ($)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={venueFormData.basePricePerDay}
                    onChange={(e) => setVenueFormData({ ...venueFormData, basePricePerDay: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cleaning Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={venueFormData.cleaningFee}
                    onChange={(e) => setVenueFormData({ ...venueFormData, cleaningFee: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supported Events (Comma separated)
                </label>
                <input
                  type="text"
                  value={venueFormData.supportedEventTypes}
                  onChange={(e) => setVenueFormData({ ...venueFormData, supportedEventTypes: e.target.value })}
                  placeholder="WEDDING,CORPORATE,BIRTHDAY,ANNIVERSARY"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Facilities (Comma separated)
                </label>
                <input
                  type="text"
                  value={venueFormData.facilities}
                  onChange={(e) => setVenueFormData({ ...venueFormData, facilities: e.target.value })}
                  placeholder="WIFI,PARKING,CATERING_KITCHEN,AUDIO_VISUAL,AIR_CONDITIONING"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={venueFormData.imageUrls}
                  onChange={(e) => setVenueFormData({ ...venueFormData, imageUrls: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowVenueModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVenue}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {savingVenue ? 'Saving...' : editingVenueId ? 'Update Venue' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
