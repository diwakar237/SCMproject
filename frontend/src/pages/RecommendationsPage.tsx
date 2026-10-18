import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { RecommendationRequest, RecommendationResult, TimeSlot } from '../types';
import { Sparkles, MapPin, Sliders, CheckCircle2, ChevronRight } from 'lucide-react';

import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const RecommendationsPage: React.FC = () => {
  const [eventType, setEventType] = useState('WEDDING');
  const [targetCity, setTargetCity] = useState('');
  const [guestCount, setGuestCount] = useState<number>(150);
  const [maxBudget, setMaxBudget] = useState<number | ''>(3500);
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('FULL_DAY');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(['WIFI', 'PARKING']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendationResult[] | null>(null);

  const availableFacilities = [
    'WIFI',
    'PARKING',
    'CATERING_KITCHEN',
    'AUDIO_VISUAL',
    'AIR_CONDITIONING',
    'STAGE',
    'BAR_SETUP',
    'SECURITY_PERSONNEL',
  ];

  const handleFacilityToggle = (facility: string) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  const handleSearchRecommendations = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guestCount || guestCount <= 0) {
      setError('Guest count must be at least 1.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: RecommendationRequest = {
        eventType: eventType || undefined,
        targetCity: targetCity.trim() || undefined,
        guestCount,
        maxBudget: typeof maxBudget === 'number' && maxBudget > 0 ? maxBudget : undefined,
        date: date || undefined,
        timeSlot: date ? timeSlot : undefined,
        preferredFacilities: selectedFacilities.length > 0 ? selectedFacilities : undefined,
      };

      const res = await apiClient.post<RecommendationResult[]>('/recommendations', payload);
      setResults(res.data);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to compute recommendations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Multi-Factor Scoring
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            AI-Assisted Venue Recommendations
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Specify your event vision, guest requirements, and budget constraints. Our scoring engine filters hard
            conflicts (undersized or booked slots) and evaluates budget fit, capacity, and amenities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm self-start space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-lg">Event Criteria</h2>
          </div>

          <form onSubmit={handleSearchRecommendations} className="space-y-4 text-xs">
            <div>
              <label htmlFor="event-type" className="block font-semibold text-slate-700 mb-1">Event Type</label>
              <select
                id="event-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="WEDDING">Wedding</option>
                <option value="CORPORATE">Corporate Conference / Seminar</option>
                <option value="BIRTHDAY">Birthday Celebration</option>
                <option value="ANNIVERSARY">Anniversary Banquet</option>
                <option value="GALA">Gala Dinner</option>
              </select>
            </div>

            <div>
              <label htmlFor="target-city" className="block font-semibold text-slate-700 mb-1">Target City / Region</label>
              <input
                id="target-city"
                type="text"
                placeholder="e.g. New York, Chicago, Austin..."
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expected-guests" className="block font-semibold text-slate-700 mb-1">Expected Guests</label>
                <input
                  id="expected-guests"
                  type="number"
                  min="1"
                  required
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="max-budget" className="block font-semibold text-slate-700 mb-1">Max Budget ($)</label>
                <input
                  id="max-budget"
                  type="number"
                  min="100"
                  step="100"
                  placeholder="e.g. 3500"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="target-date" className="block font-semibold text-slate-700 mb-1">Target Date</label>
                <input
                  id="target-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="time-slot" className="block font-semibold text-slate-700 mb-1">Slot</label>
                <select
                  id="time-slot"
                  disabled={!date}
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm disabled:opacity-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"

                >
                  <option value="FULL_DAY">Full Day</option>
                  <option value="MORNING">Morning (8am-3pm)</option>
                  <option value="EVENING">Evening (4pm-11pm)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Required Facilities</label>
              <div className="flex flex-wrap gap-1.5">
                {availableFacilities.map((fac) => {
                  const active = selectedFacilities.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => handleFacilityToggle(fac)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        active
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {fac.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Evaluating Scoring Models...' : 'Calculate Recommendations'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-6">
          {error && <ErrorMessage message={error} onRetry={() => handleSearchRecommendations()} />}

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : results === null ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <Sparkles className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Ready to Discover Venues</h3>
              <p className="text-sm max-w-md mx-auto">
                Adjust criteria on the left and click <b>Calculate Recommendations</b> to trigger the transparent
                weighted multi-factor scoring model.
              </p>
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="No Venues Match Hard Constraints"
              message="No venues met the hard requirements (sufficient guest capacity or open availability on your chosen date). Try adjusting guest count or choosing an alternative date."
              actionLabel="Reset Constraints"
              onAction={() => {
                setGuestCount(100);
                setDate('');
                setMaxBudget(5000);
                handleSearchRecommendations();
              }}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm text-slate-600 px-1">
                <span>
                  Found <b className="text-slate-900">{results.length}</b> eligible venue{results.length === 1 ? '' : 's'}{' '}
                  ranked by overall match score.
                </span>
                <span className="text-xs text-slate-400">Hard constraints applied ✓</span>
              </div>

              {results.map((r, index) => {
                const score = r.scoreBreakdown.overallScore;
                const scoreColor =
                  score >= 85
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : score >= 70
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200';

                return (
                  <div
                    key={r.venue.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-5"
                  >
                    {/* Top Row: Rank, Title, Overall Score */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900">{r.venue.name}</h3>
                            <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full font-medium">
                              {r.venue.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {r.venue.address}, {r.venue.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-2xl border text-center ${scoreColor}`}>
                          <div className="text-2xl font-black">{score.toFixed(1)}</div>
                          <div className="text-[10px] uppercase font-bold tracking-wider">Match Score</div>
                        </div>
                      </div>
                    </div>

                    {/* Plain Language Explanation */}
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{r.plainExplanation}</span>
                    </div>

                    {/* Matching Highlights */}
                    {r.matchingHighlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {r.matchingHighlights.map((hl, i) => (
                          <span
                            key={i}
                            className="bg-emerald-50/70 border border-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-medium text-[11px]"
                          >
                            ✓ {hl}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Score Component Breakdown Bars */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
                        Transparent Weighting Breakdown:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Budget Fit (25%)</span>
                            <span className="font-semibold">{r.scoreBreakdown.budgetScore}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full"
                              style={{ width: `${r.scoreBreakdown.budgetScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Capacity Fit (20%)</span>
                            <span className="font-semibold">{r.scoreBreakdown.capacityScore}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${r.scoreBreakdown.capacityScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Location Match (20%)</span>
                            <span className="font-semibold">{r.scoreBreakdown.locationScore}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${r.scoreBreakdown.locationScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Event Type (15%)</span>
                            <span className="font-semibold">{r.scoreBreakdown.eventTypeScore}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-purple-600 h-1.5 rounded-full"
                              style={{ width: `${r.scoreBreakdown.eventTypeScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Facilities (10%)</span>
                            <span className="font-semibold">{r.scoreBreakdown.facilitiesScore}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-500 h-1.5 rounded-full"
                              style={{ width: `${r.scoreBreakdown.facilitiesScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Availability (10%)</span>
                            <span className="font-semibold">{r.scoreBreakdown.availabilityScore}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-teal-600 h-1.5 rounded-full"
                              style={{ width: `${r.scoreBreakdown.availabilityScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-900">${r.venue.basePricePerDay}</span> / day • Max{' '}
                        {r.venue.capacity} guests
                      </div>
                      <Link
                        to={`/venues/${r.venue.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
                      >
                        <span>View & Reserve Venue</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
