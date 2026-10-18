import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { EventEntity, EventGuest } from '../types';
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Copy,
  Printer,
  CheckCircle,
  XCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const EventGuestRsvpPage: React.FC = () => {
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('WEDDING');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('17:00');
  const [locationName, setLocationName] = useState('Grand Crystal Ballroom');
  const [locationAddress, setLocationAddress] = useState('100 Banquet Way, New York');
  const [dressCode, setDressCode] = useState('Black Tie / Formal');
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // New Guest Modal
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submittingGuest, setSubmittingGuest] = useState(false);

  // Invitation Print Modal
  const [printGuest, setPrintGuest] = useState<EventGuest | null>(null);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/events');
      const list: EventEntity[] = response.data || [];
      setEvents(list);
      if (list.length > 0) {
        setSelectedEvent(list[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEvent(true);
    try {
      const response = await apiClient.post('/events', {
        title: eventTitle,
        eventType,
        eventDate,
        startTime,
        locationName,
        locationAddress,
        dressCode,
      });
      const created = response.data;
      setEvents([...events, created]);
      setSelectedEvent(created);
      setIsEventModalOpen(false);
      setEventTitle('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmittingGuest(true);
    try {
      const response = await apiClient.post(`/events/${selectedEvent.id}/guests`, {
        guestName,
        guestEmail,
      });
      const updatedGuests = [...(selectedEvent.guests || []), response.data];
      const updatedEvent = { ...selectedEvent, guests: updatedGuests };
      setSelectedEvent(updatedEvent);
      setEvents(events.map((ev) => (ev.id === selectedEvent.id ? updatedEvent : ev)));
      setIsGuestModalOpen(false);
      setGuestName('');
      setGuestEmail('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add guest.');
    } finally {
      setSubmittingGuest(false);
    }
  };

  const copyRsvpLink = (token: string) => {
    const link = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const guests = selectedEvent?.guests || [];
  const attendingCount = guests.filter((g) => g.rsvpStatus === 'ATTENDING').length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === 'DECLINED').length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === 'PENDING').length;
  const totalPlusOnes = guests.reduce((sum, g) => sum + (g.plusOnes || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-600" />
            Guest List, Invitations & RSVP Tracker
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Send secure invitation tokens, monitor real-time RSVP responses, and generate printable formal invites.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create New Event
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
          <Users className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Created Yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first event to start issuing invitations and tracking RSVPs.</p>
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow"
          >
            Create Event Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Events Selector */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Event</h3>
            {events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedEvent?.id === ev.id
                    ? 'border-teal-500 bg-teal-50 shadow-sm'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{ev.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>{ev.eventDate}</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {ev.guests?.length || 0} guests invited
                </div>
              </button>
            ))}
          </div>

          {/* Right Column: Selected Event Details & Guest Management */}
          {selectedEvent && (
            <div className="lg:col-span-3 space-y-6">
              {/* Event Overview Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                      {selectedEvent.eventType}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-teal-600" /> {selectedEvent.eventDate}
                    </span>
                    {selectedEvent.startTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-teal-600" /> {selectedEvent.startTime}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-teal-600" /> {selectedEvent.locationName}
                    </span>
                  </div>
                  {selectedEvent.dressCode && (
                    <p className="text-xs text-gray-500 mt-1">Dress Code: {selectedEvent.dressCode}</p>
                  )}
                </div>

                <button
                  onClick={() => setIsGuestModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Plus className="w-4 h-4" /> Invite Guest
                </button>
              </div>

              {/* RSVP Stats Bar */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Total Invited</span>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{guests.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm text-center">
                  <span className="text-xs text-green-700 font-semibold uppercase">Attending</span>
                  <p className="text-2xl font-bold text-green-800 mt-1">
                    {attendingCount} <span className="text-xs font-normal">(+{totalPlusOnes})</span>
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm text-center">
                  <span className="text-xs text-amber-700 font-semibold uppercase">Pending</span>
                  <p className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm text-center">
                  <span className="text-xs text-red-700 font-semibold uppercase">Declined</span>
                  <p className="text-2xl font-bold text-red-800 mt-1">{declinedCount}</p>
                </div>
              </div>

              {/* Guests Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-base font-bold text-gray-900">Guest Roster & Response Status</h3>
                  <span className="text-xs text-gray-500">Secure 1-click token links for guests</span>
                </div>

                {guests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No guests invited yet. Click "Invite Guest" above to generate your first RSVP invitation.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3">Guest</th>
                          <th className="px-4 py-3">RSVP Status</th>
                          <th className="px-4 py-3">Plus-Ones</th>
                          <th className="px-4 py-3">Dietary / Notes</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {guests.map((g) => (
                          <tr key={g.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-900">{g.guestName}</div>
                              <div className="text-xs text-gray-500">{g.guestEmail}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                  g.rsvpStatus === 'ATTENDING'
                                    ? 'bg-green-100 text-green-800'
                                    : g.rsvpStatus === 'DECLINED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {g.rsvpStatus === 'ATTENDING' && <CheckCircle className="w-3 h-3" />}
                                {g.rsvpStatus === 'DECLINED' && <XCircle className="w-3 h-3" />}
                                {g.rsvpStatus === 'PENDING' && <HelpCircle className="w-3 h-3" />}
                                {g.rsvpStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-700">
                              {g.plusOnes > 0 ? `+${g.plusOnes}` : '0'}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              {g.dietaryRequirements || g.notes || '—'}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => copyRsvpLink(g.invitationToken)}
                                className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-100 inline-flex items-center gap-1"
                                title="Copy secure public RSVP link"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                {copiedToken === g.invitationToken ? 'Copied!' : 'Copy Link'}
                              </button>
                              <button
                                onClick={() => setPrintGuest(g)}
                                className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 inline-flex items-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5" /> Invite Card
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="E.g., Sophia & Liam Wedding Celebration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="WEDDING">Wedding</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="BIRTHDAY">Birthday</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="CONCERT">Concert</option>
                  </select>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dress Code</label>
                  <input
                    type="text"
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    placeholder="E.g. Semi-Formal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location Address</label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvent}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow"
                >
                  {submittingEvent ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Guest Modal */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Guest & Issue Invitation</h3>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="E.g., Dr. Jane Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Guest Email</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <p className="text-xs text-gray-500">
                A unique, secure invitation token will be generated automatically. Guests will access a private RSVP portal with no passwords required.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGuest}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow"
                >
                  {submittingGuest ? 'Adding...' : 'Issue Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invitation Card Modal */}
      {printGuest && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative print:m-0 print:p-0 print:border-none">
            <button
              onClick={() => setPrintGuest(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 print:hidden"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Formal Invitation Card */}
            <div className="border-4 border-double border-teal-700 p-8 text-center rounded-lg bg-gradient-to-b from-stone-50 to-teal-50/20">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-widest block mb-4">
                Cordially Invited
              </span>
              <p className="text-sm italic text-gray-600 mb-2">We request the pleasure of the company of</p>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">{printGuest.guestName}</h2>
              <p className="text-xs text-gray-500 mb-3">to celebrate the occasion of</p>
              <h1 className="text-xl font-extrabold text-teal-900 tracking-wide mb-6">{selectedEvent.title}</h1>

              <div className="border-t border-b border-teal-200 py-3 my-4 text-sm text-gray-700 space-y-1">
                <div className="font-semibold">{selectedEvent.eventDate} at {selectedEvent.startTime || '18:00'}</div>
                <div>{selectedEvent.locationName}</div>
                <div className="text-xs text-gray-500">{selectedEvent.locationAddress}</div>
                {selectedEvent.dressCode && (
                  <div className="text-xs font-medium text-teal-800 pt-1">Dress Code: {selectedEvent.dressCode}</div>
                )}
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <p className="font-semibold">RSVP Online with your personal token:</p>
                <p className="font-mono text-teal-700 break-all mt-1 font-bold">
                  {window.location.origin}/rsvp/{printGuest.invitationToken}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setPrintGuest(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
