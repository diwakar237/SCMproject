import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { AdminStats, Venue, Vendor } from '../types';
import {
  ShieldAlert,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingVenues, setPendingVenues] = useState<Venue[]>([]);
  const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'METRICS' | 'VENUES' | 'VENDORS' | 'USERS' | 'AUDIT'>('METRICS');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, venuesRes, vendorsRes, usersRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/venues/pending'),
        apiClient.get('/admin/vendors/pending'),
        apiClient.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setPendingVenues(venuesRes.data || []);
      setPendingVendors(vendorsRes.data || []);
      setUsersList(usersRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load admin telemetry and queues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveVenue = async (venueId: number) => {
    try {
      await apiClient.put(`/admin/venues/${venueId}/approve`);
      setPendingVenues(pendingVenues.filter((v) => v.id !== venueId));
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve venue.');
    }
  };

  const handleRejectVenue = async (venueId: number) => {
    try {
      await apiClient.put(`/admin/venues/${venueId}/reject`);
      setPendingVenues(pendingVenues.filter((v) => v.id !== venueId));
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject venue.');
    }
  };

  const handleApproveVendor = async (vendorId: number) => {
    try {
      await apiClient.put(`/admin/vendors/${vendorId}/approve`);
      setPendingVendors(pendingVendors.filter((v) => v.id !== vendorId));
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve vendor.');
    }
  };

  const handleRejectVendor = async (vendorId: number) => {
    try {
      await apiClient.put(`/admin/vendors/${vendorId}/reject`);
      setPendingVendors(pendingVendors.filter((v) => v.id !== vendorId));
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject vendor.');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
            Executive Administration & Governance Console
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time platform telemetry, moderation queues, role provisioning, and immutable security audit logs.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'METRICS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Overview & Telemetry
        </button>
        <button
          onClick={() => setActiveTab('VENUES')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition relative ${
            activeTab === 'VENUES'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Venue Approvals
          {pendingVenues.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">
              {pendingVenues.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('VENDORS')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition relative ${
            activeTab === 'VENDORS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Vendor Approvals
          {pendingVendors.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">
              {pendingVendors.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'USERS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          User RBAC
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'AUDIT'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          System Audit Trail
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchDashboardData} />
      ) : (
        <>
          {/* TAB 1: METRICS */}
          {activeTab === 'METRICS' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Total Accounts</span>
                      <h3 className="text-2xl font-black text-gray-900">{stats.totalUsers}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Live Venues</span>
                      <h3 className="text-2xl font-black text-gray-900">{stats.totalVenues}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Total Bookings</span>
                      <h3 className="text-2xl font-black text-gray-900">{stats.totalBookings}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Confirmed Volume</span>
                      <h3 className="text-2xl font-black text-emerald-600">
                        ${Number(stats.totalConfirmedRevenue || 0).toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moderation Alert Card */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-xl border border-rose-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="text-base font-bold text-rose-950 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-rose-600" />
                    Pending Moderation Gateways
                  </h4>
                  <p className="text-xs text-rose-800 mt-1">
                    {stats.pendingVenuesCount} venue(s) and {stats.pendingVendorsCount} vendor(s) are awaiting security verification before public listing.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('VENUES')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow"
                  >
                    Review Venues ({stats.pendingVenuesCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('VENDORS')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow"
                  >
                    Review Vendors ({stats.pendingVendorsCount})
                  </button>
                </div>
              </div>

              {/* Recent Audit Activities Snapshot */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    Recent System Audit Logs
                  </h4>
                  <button onClick={() => setActiveTab('AUDIT')} className="text-xs text-rose-600 font-bold hover:underline">
                    View Full Trail &rarr;
                  </button>
                </div>
                <div className="divide-y divide-gray-100 text-xs">
                  {stats.recentAuditLogs && stats.recentAuditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-3 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-800">{log.action}</span>
                        <span className="text-gray-500 ml-2">by {log.actorEmail}</span>
                        {log.details && <p className="text-[11px] text-gray-400 mt-0.5">{log.details}</p>}
                      </div>
                      <span className="text-[11px] text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VENUE APPROVALS */}
          {activeTab === 'VENUES' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Venue Submissions</h3>
              {pendingVenues.length === 0 ? (
                <EmptyState
                  title="No venues awaiting approval"
                  description="All submitted properties have been reviewed and published."
                />
              ) : (
                <div className="space-y-4">
                  {pendingVenues.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{v.name}</h4>
                        <p className="text-xs text-gray-500">{v.category} • {v.city} • Capacity: {v.capacity} guests</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{v.description}</p>
                        <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">
                          Base Price: ${Number(v.basePricePerDay).toLocaleString()} / day
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveVenue(v.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectVenue(v.id)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VENDOR APPROVALS */}
          {activeTab === 'VENDORS' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Vendor Submissions</h3>
              {pendingVendors.length === 0 ? (
                <EmptyState
                  title="No vendors awaiting approval"
                  description="All service partners have been verified."
                />
              ) : (
                <div className="space-y-4">
                  {pendingVendors.map((vnd) => (
                    <div
                      key={vnd.id}
                      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{vnd.businessName}</h4>
                        <p className="text-xs text-gray-500">{vnd.category} • {vnd.city} • {vnd.contactEmail}</p>
                        <p className="text-sm text-gray-600 mt-1">{vnd.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveVendor(vnd.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectVendor(vnd.id)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: USERS MANAGEMENT */}
          {activeTab === 'USERS' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Registered Platform Users & Role Governance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Current Role</th>
                      <th className="px-4 py-3 text-right">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-900">{u.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="VENUE_OWNER">VENUE_OWNER</option>
                            <option value="VENDOR">VENDOR</option>
                            <option value="EVENT_ORGANIZER">EVENT_ORGANIZER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM AUDIT TRAIL */}
          {activeTab === 'AUDIT' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Security & Operational Audit Log</h3>
                <p className="text-xs text-gray-500">Immutable trail of critical transactions and administrative actions.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Resource</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {stats?.recentAuditLogs && stats.recentAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-700">{log.actorEmail}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {log.resourceType} {log.resourceId ? `#${log.resourceId}` : ''}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{log.details || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
