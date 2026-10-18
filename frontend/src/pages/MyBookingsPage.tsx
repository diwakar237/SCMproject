import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Booking, PageResponse } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Cancellation state
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Active filter tab
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'>('ALL');

  const fetchBookings = async (targetPage: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<PageResponse<Booking>>(`/bookings/my?page=${targetPage}&size=10`);
      setBookings(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(res.data.number);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load bookings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(0);
  }, []);

  const handleOpenCancel = (booking: Booking) => {
    setCancelTarget(booking);
    setCancelReason('');
    setCancelError(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      setCancelError(null);
      await apiClient.post(`/bookings/${cancelTarget.id}/cancel`, {
        reason: cancelReason || 'Customer requested cancellation via portal',
      });
      setCancelTarget(null);
      fetchBookings(page);
    } catch (err: unknown) {
      setCancelError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Cancellation failed. Please check policy conditions.'
      );
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">✓ Confirmed</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">⏳ Pending Approval</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">✕ Cancelled</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">✕ Rejected</span>;
      default:
        return null;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track reservation approvals, status history, receipts, and cancellations.
          </p>
        </div>
        <Link
          to="/venues"
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
        >
          Explore More Venues
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 my-6 pb-2 text-sm">
        {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'REJECTED'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              statusFilter === st
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' ? 'All Bookings' : st}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchBookings(page)} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          message={
            statusFilter === 'ALL'
              ? "You haven't requested any venue bookings yet. Browse our selection and reserve your dream spot!"
              : `You have no ${statusFilter.toLowerCase()} reservations.`
          }
          actionLabel="Discover Venues"
          onAction={() => window.location.assign('/venues')}
        />
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">{b.venueName}</h2>
                      {getStatusBadge(b.status)}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Ref: <span className="font-mono font-medium text-slate-700">{b.bookingReference}</span> •{' '}
                      {b.venueCity}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <div className="text-2xl font-extrabold text-blue-600">
                      ${b.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-500">
                      Base: ${b.baseCost} + Svc: ${b.serviceFee}
                    </div>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-sm">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Event Date</span>
                    <span className="font-medium text-slate-800">{b.eventDate}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Time Slot</span>
                    <span className="font-medium text-slate-800">{b.timeSlot}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Event Type</span>
                    <span className="font-medium text-slate-800">{b.eventType}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Guests</span>
                    <span className="font-medium text-slate-800">{b.guestCount} Attendees</span>
                  </div>
                </div>

                {/* Notes & Cancellation reason */}
                {b.notes && (
                  <div className="mt-2 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-slate-600">
                    <span className="font-semibold text-slate-700">Special Notes: </span> {b.notes}
                  </div>
                )}
                {b.cancellationReason && (
                  <div className="mt-2 text-xs bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-700">
                    <span className="font-semibold text-rose-800">Cancellation Note: </span> {b.cancellationReason}
                  </div>
                )}

                {/* Status Timeline History */}
                {b.history && b.history.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Status History & Audit Trail
                    </h3>
                    <div className="space-y-2">
                      {b.history.map((h) => (
                        <div key={h.id} className="text-xs flex flex-wrap items-center gap-2 text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="font-semibold text-slate-800">{h.toStatus}</span>
                          <span className="text-slate-400">by</span>
                          <span className="font-medium text-slate-700">{h.changedByName}</span>
                          {h.remarks && <span className="italic text-slate-500">({h.remarks})</span>}
                          <span className="text-slate-400 ml-auto font-mono text-[11px]">
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {/* View printable receipt */}
                    <a
                      href={`http://localhost:8080/api/bookings/${b.id}/receipt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Receipt
                    </a>
                    <Link
                      to={`/venues/${b.venueId}`}
                      className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Venue Details
                    </Link>
                  </div>

                  {/* Cancel button if PENDING or CONFIRMED */}
                  {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                    <button
                      type="button"
                      onClick={() => handleOpenCancel(b)}
                      className="px-3.5 py-2 border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => fetchBookings(page - 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => fetchBookings(page + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelTarget && (
        <ConfirmDialog
          isOpen={!!cancelTarget}
          title={`Cancel Booking #${cancelTarget.bookingReference}?`}
          message={`Are you sure you want to cancel your reservation for ${cancelTarget.venueName} on ${cancelTarget.eventDate}?`}
          confirmLabel={cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          isDestructive={true}
          onConfirm={handleConfirmCancel}
          onCancel={() => setCancelTarget(null)}
        >
          <div className="mt-3 text-left">
            <label htmlFor="cancelReason" className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Cancellation
            </label>
            <textarea
              id="cancelReason"
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Change of event schedule, relocated..."
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              * Per policy: Cancellations &gt; 14 days prior receive 100% refund, 7-14 days receive 50%, and &lt; 7 days receive 0%.
            </p>
            {cancelError && (
              <p className="mt-2 text-xs text-rose-600 font-medium">{cancelError}</p>
            )}
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
};
