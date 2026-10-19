import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Vendor, VendorBooking, VendorServiceItem } from '../types';
import {
  Briefcase,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const VendorsPage: React.FC = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'MY_REQUESTS' | 'VENDOR_ORDERS'>('EXPLORE');

  // Customer's requests
  const [myBookings, setMyBookings] = useState<VendorBooking[]>([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(false);

  // Vendor's incoming orders (if user is VENDOR)
  const [incomingOrders, setIncomingOrders] = useState<VendorBooking[]>([]);
  const [incomingOrdersLoading, setIncomingOrdersLoading] = useState(false);

  // Booking Modal State
  const [bookingModalVendor, setBookingModalVendor] = useState<Vendor | null>(null);
  const [bookingService, setBookingService] = useState<VendorServiceItem | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState<number>(50);
  const [requirements, setRequirements] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const categories = ['ALL', 'CATERING', 'PHOTOGRAPHY', 'DECORATION', 'MUSIC_DJ', 'FLORIST', 'TRANSPORT'];

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedCity) params.city = selectedCity;
      if (searchQuery) params.query = searchQuery;

      const response = await apiClient.get('/vendors', { params });
      setVendors(response.data.content || response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendors catalog.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedCity, searchQuery]);

  const fetchMyBookings = useCallback(async () => {
    if (!user) return;
    setMyBookingsLoading(true);
    try {
      const response = await apiClient.get('/vendors/bookings/my');
      setMyBookings(response.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setMyBookingsLoading(false);
    }
  }, [user]);

  const fetchIncomingOrders = useCallback(async () => {
    if (!user || user.role !== 'VENDOR') return;
    setIncomingOrdersLoading(true);
    try {
      const response = await apiClient.get('/vendors/orders/my');
      setIncomingOrders(response.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIncomingOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    if (activeTab === 'MY_REQUESTS') {
      fetchMyBookings();
    } else if (activeTab === 'VENDOR_ORDERS') {
      fetchIncomingOrders();
    }
  }, [activeTab, fetchMyBookings, fetchIncomingOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleOpenBookingModal = (vendor: Vendor) => {
    setBookingModalVendor(vendor);
    setBookingService(vendor.services && vendor.services.length > 0 ? vendor.services[0] : null);
    setBookingSuccessMsg(null);
  };

  const handleCreateVendorBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalVendor || !eventDate) return;

    setSubmittingBooking(true);
    try {
      await apiClient.post(`/vendors/${bookingModalVendor.id}/bookings`, {
        serviceId: bookingService ? bookingService.id : null,
        eventDate,
        guestCount,
        requirements,
      });
      setBookingSuccessMsg('Vendor booking request submitted successfully! The vendor will review it shortly.');
      setTimeout(() => {
        setBookingModalVendor(null);
        setBookingSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit vendor booking.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleUpdateOrderStatus = async (bookingId: number, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      await apiClient.put(`/vendors/bookings/${bookingId}/status`, { status });
      fetchIncomingOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            Vendor Directory & Service Marketplace
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover and book verified caterers, photographers, decorators, sound engineers, and event professionals.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => setActiveTab('EXPLORE')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'EXPLORE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Explore Vendors
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('MY_REQUESTS')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'MY_REQUESTS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              My Requests
            </button>
          )}
          {user && user.role === 'VENDOR' && (
            <button
              onClick={() => setActiveTab('VENDOR_ORDERS')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'VENDOR_ORDERS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Incoming Orders
            </button>
          )}
        </div>
      </div>

      {activeTab === 'EXPLORE' && (
        <>
          {/* Search & Filters Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vendor business name or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mr-2">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'ALL' ? '' : cat)}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                    (cat === 'ALL' && !selectedCategory) || selectedCategory === cat
                      ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Vendors Grid */}
          {loading ? (
            <LoadingSkeleton count={6} />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchVendors} />
          ) : vendors.length === 0 ? (
            <EmptyState
              title="No vendors found"
              description="Try adjusting your category or city filters to find active event partners."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{vendor.businessName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {vendor.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {vendor.rating ? vendor.rating.toFixed(1) : '5.0'} ({vendor.reviewCount || 12})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {vendor.city}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>

                    {/* Services preview */}
                    {vendor.services && vendor.services.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 space-y-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Featured Packages</span>
                        {vendor.services.slice(0, 2).map((srv) => (
                          <div key={srv.id} className="flex justify-between items-center text-xs">
                            <span className="text-gray-700 font-medium truncate max-w-[180px]">{srv.serviceName}</span>
                            <span className="font-bold text-indigo-600">
                              ${Number(srv.price ?? srv.basePrice ?? 0).toLocaleString()} {srv.priceUnit || srv.packageTier ? `/ ${(srv.priceUnit || srv.packageTier)?.toLowerCase()}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 space-y-1 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{vendor.contactEmail}</span>
                      </div>
                      {vendor.contactPhone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{vendor.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenBookingModal(vendor)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                    >
                      Request Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Customer's Requests Tab */}
      {activeTab === 'MY_REQUESTS' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Submitted Vendor Inquiries</h2>
          {myBookingsLoading ? (
            <LoadingSkeleton count={3} />
          ) : myBookings.length === 0 ? (
            <EmptyState
              title="No vendor bookings yet"
              description="Explore the directory above to send booking requests to top catering and decor partners."
            />
          ) : (
            <div className="space-y-4">
              {myBookings.map((b) => (
                <div key={b.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-gray-900">{b.vendorName}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        b.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        b.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Service: <span className="font-semibold">{b.serviceName || 'Custom Consultation'}</span></p>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {b.eventDate}</span>
                      {b.guestCount && <span>Guests: {b.guestCount}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 block">Total Quoted</span>
                    <span className="text-lg font-bold text-indigo-600">${Number(b.totalCost ?? b.totalPrice ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vendor Incoming Orders Tab */}
      {activeTab === 'VENDOR_ORDERS' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Incoming Client Orders</h2>
          {incomingOrdersLoading ? (
            <LoadingSkeleton count={3} />
          ) : incomingOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="When organizers and customers book your services, requests will appear here for your confirmation."
            />
          ) : (
            <div className="space-y-4">
              {incomingOrders.map((ord) => (
                <div key={ord.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-gray-900">{ord.customerName} ({ord.customerEmail})</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        ord.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        ord.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Service: <span className="font-semibold">{ord.serviceName || 'Standard Package'}</span></p>
                    <p className="text-xs text-gray-500">Date: {ord.eventDate} • Requirements: {ord.requirements || 'None specified'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-600 mr-2">${Number(ord.totalCost ?? ord.totalPrice ?? 0).toLocaleString()}</span>
                    {ord.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'CONFIRMED')}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalVendor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Book {bookingModalVendor.businessName}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Category: {bookingModalVendor.category.replace('_', ' ')} • {bookingModalVendor.city}
            </p>

            {bookingSuccessMsg ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">{bookingSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateVendorBooking} className="space-y-4">
                {bookingModalVendor.services && bookingModalVendor.services.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Choose Service Package</label>
                    <select
                      value={bookingService ? bookingService.id : ''}
                      onChange={(e) => {
                        const s = bookingModalVendor.services?.find((x) => x.id === Number(e.target.value));
                        if (s) setBookingService(s);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {bookingModalVendor.services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.serviceName} - ${Number(s.price ?? s.basePrice ?? 0).toLocaleString()} {s.priceUnit || s.packageTier ? `/ ${(s.priceUnit || s.packageTier)?.toLowerCase()}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Guest Count</label>
                  <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Special Requirements / Notes</label>
                  <textarea
                    rows={3}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="E.g., dietary specifications, theme colors, timing requirements..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalVendor(null)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow"
                  >
                    {submittingBooking ? 'Submitting...' : 'Send Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
