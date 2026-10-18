import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { PublicInvitation, RsvpStatus } from '../types';
import {
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Send,
  Building2,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const PublicRsvpPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [invitation, setInvitation] = useState<PublicInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('ATTENDING');
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [dietaryRequirements, setDietaryRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/rsvp/${token}`);
        setInvitation(response.data);
        if (response.data.rsvpStatus) {
          setRsvpStatus(response.data.rsvpStatus);
        }
        if (response.data.plusOnes) {
          setPlusOnes(response.data.plusOnes);
        }
        if (response.data.dietaryRequirements) {
          setDietaryRequirements(response.data.dietaryRequirements);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'We could not locate an invitation for this link.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await apiClient.post(`/rsvp/${token}`, {
        rsvpStatus,
        plusOnes,
        dietaryRequirements,
        notes,
      });
      setInvitation(response.data);
      setSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit RSVP.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-700">
            <Building2 className="w-8 h-8 text-teal-600" />
            <span className="font-bold text-2xl tracking-tight text-gray-900">
              Smart<span className="text-teal-600">Venue</span> Events
            </span>
          </Link>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">
            Official Guest Invitation Response
          </p>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <LoadingSkeleton count={3} />
          </div>
        ) : error || !invitation ? (
          <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Invitation Link Not Found</h3>
            <p className="text-sm text-gray-600 mb-4">{error || 'Please contact your event organizer for a valid link.'}</p>
            <Link to="/" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Event Header Banner */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-700 p-6 text-white text-center">
              <span className="text-xs uppercase font-extrabold tracking-widest bg-teal-800/60 px-3 py-1 rounded-full">
                {invitation.eventType}
              </span>
              <h2 className="text-2xl font-extrabold mt-3">{invitation.eventTitle}</h2>
              <p className="text-teal-100 text-sm mt-1">{invitation.description || 'You are warmly invited to join us for this special gathering.'}</p>
            </div>

            {/* Event Key Details */}
            <div className="p-6 bg-slate-50 border-b border-gray-200 grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold block">Date & Time</span>
                  <span>{invitation.eventDate} {invitation.startTime ? `at ${invitation.startTime}` : ''}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold block">Location</span>
                  <span className="truncate">{invitation.locationName}</span>
                </div>
              </div>

              {invitation.dressCode && (
                <div className="col-span-2 text-gray-600 border-t border-slate-200 pt-2">
                  <span className="font-semibold">Dress Code:</span> {invitation.dressCode}
                </div>
              )}
            </div>

            {/* RSVP Form / Confirmation */}
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    RSVP Response Recorded!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Thank you, <span className="font-semibold">{invitation.guestName}</span>. Your status is set to{' '}
                    <span className="font-bold text-teal-700 uppercase">{rsvpStatus}</span>
                    {rsvpStatus === 'ATTENDING' && plusOnes > 0 && ` with +${plusOnes} guest(s)`}.
                  </p>
                  <p className="text-xs text-gray-400">
                    You can return to this page anytime if you need to update your response.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase block mb-1">Guest</span>
                    <p className="text-base font-bold text-gray-900">{invitation.guestName}</p>
                    <p className="text-xs text-gray-500">{invitation.guestEmail}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Will you be attending?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRsvpStatus('ATTENDING')}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition ${
                          rsvpStatus === 'ATTENDING'
                            ? 'bg-teal-50 border-teal-600 text-teal-800 ring-2 ring-teal-500'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 text-teal-600" /> Yes, Attending
                      </button>

                      <button
                        type="button"
                        onClick={() => setRsvpStatus('DECLINED')}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition ${
                          rsvpStatus === 'DECLINED'
                            ? 'bg-red-50 border-red-600 text-red-800 ring-2 ring-red-500'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <XCircle className="w-4 h-4 text-red-600" /> Regretfully Decline
                      </button>
                    </div>
                  </div>

                  {rsvpStatus === 'ATTENDING' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Bringing Additional Guests (Plus-Ones)?
                        </label>
                        <select
                          value={plusOnes}
                          onChange={(e) => setPlusOnes(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value={0}>0 (Just me)</option>
                          <option value={1}>+1 Guest</option>
                          <option value={2}>+2 Guests</option>
                          <option value={3}>+3 Guests</option>
                          <option value={4}>+4 Guests</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Dietary Preferences / Allergies
                        </label>
                        <input
                          type="text"
                          value={dietaryRequirements}
                          onChange={(e) => setDietaryRequirements(e.target.value)}
                          placeholder="E.g., Vegetarian, Gluten-Free, Nut allergy"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Note to Organizers (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Can't wait to celebrate! / Sending warm congratulations!"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting RSVP...' : 'Confirm RSVP'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
