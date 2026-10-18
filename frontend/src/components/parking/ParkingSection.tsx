import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { ParkingLot, ParkingPrediction, ParkingDataSource, TimeSlot } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, 
  Clock, 
  Activity, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  History,
  Cpu
} from 'lucide-react';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

interface ParkingSectionProps {
  venueId: number;
  isOwnerOrAdmin?: boolean;
}

export const ParkingSection: React.FC<ParkingSectionProps> = ({ venueId, isOwnerOrAdmin = false }) => {
  const { user } = useAuth();
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual Update Modal State
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null);
  const [newOccupiedSpots, setNewOccupiedSpots] = useState<number>(0);
  const [manualUpdating, setManualUpdating] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);

  // Prediction State per Lot
  const [selectedLotForPred, setSelectedLotForPred] = useState<number | null>(null);
  const [predDate, setPredDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [predSlot, setPredSlot] = useState<TimeSlot>('EVENING');
  const [predictions, setPredictions] = useState<Record<number, ParkingPrediction>>({});
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // Expanded History per Lot
  const [expandedHistory, setExpandedHistory] = useState<Record<number, boolean>>({});

  const fetchParkingLots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ParkingLot[]>(`/parking/venues/${venueId}`);
      setLots(res.data);
    } catch (err) {
      console.error('Failed to fetch parking lots', err);
      setError('Could not load parking information for this venue.');
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchParkingLots();
  }, [fetchParkingLots]);

  const handleOpenManualEdit = (lot: ParkingLot) => {

    setEditingLot(lot);
    setNewOccupiedSpots(lot.occupiedSpots);
    setManualError(null);
    setManualSuccess(null);
  };

  const handleSaveManualOccupancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLot) return;

    if (newOccupiedSpots < 0 || newOccupiedSpots > editingLot.totalSpots) {
      setManualError(`Occupied spots must be between 0 and total capacity (${editingLot.totalSpots}).`);
      return;
    }

    try {
      setManualUpdating(true);
      setManualError(null);
      const res = await apiClient.put<ParkingLot>(`/parking/lots/${editingLot.id}/manual`, {
        occupiedSpots: newOccupiedSpots,
      });

      // Update local state
      setLots(lots.map((l) => (l.id === editingLot.id ? res.data : l)));
      setManualSuccess('Parking occupancy updated successfully!');
      setTimeout(() => {
        setEditingLot(null);
        setManualSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to update parking occupancy.';
      setManualError(msg || 'Failed to update parking occupancy.');
    } finally {
      setManualUpdating(false);
    }
  };

  const handleFetchPrediction = async (lotId: number) => {
    try {
      setLoadingPrediction(true);
      const res = await apiClient.get<ParkingPrediction>(`/parking/lots/${lotId}/prediction`, {
        params: {
          date: predDate,
          timeSlot: predSlot,
        },
      });
      setPredictions((prev) => ({ ...prev, [lotId]: res.data }));
    } catch (err) {
      console.error('Failed to generate parking prediction', err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const toggleHistory = (lotId: number) => {
    setExpandedHistory((prev) => ({ ...prev, [lotId]: !prev[lotId] }));
  };

  const renderSourceBadge = (source: ParkingDataSource, tooltip: string) => {
    switch (source) {
      case 'SENSOR':
        return (
          <span
            title={tooltip}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-help"
          >
            <Cpu className="w-3 h-3 text-emerald-600" />
            LIVE SENSOR
          </span>
        );
      case 'MANUAL':
        return (
          <span
            title={tooltip}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 cursor-help"
          >
            <Edit3 className="w-3 h-3 text-blue-600" />
            MANUAL OVERRIDE
          </span>
        );
      case 'PREDICTED':
        return (
          <span
            title={tooltip}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 cursor-help"
          >
            <Sparkles className="w-3 h-3 text-purple-600" />
            PREDICTED
          </span>
        );
      default:
        return (
          <span
            title={tooltip}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 cursor-help"
          >
            <Activity className="w-3 h-3 text-amber-600" />
            SIMULATED DEMO
          </span>
        );
    }
  };

  const getSourceTooltip = (source: ParkingDataSource): string => {
    switch (source) {
      case 'SENSOR':
        return 'Streamed from real-time on-site IoT parking gate sensors.';
      case 'MANUAL':
        return 'Verified and manually recorded by the venue parking manager.';
      case 'PREDICTED':
        return 'Calculated by baseline time-of-day history + scheduled confirmed events.';
      default:
        return 'Synthesized simulated data feed adhering to venue operating hours.';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Car className="w-5 h-5 text-emerald-600" />
          Smart Parking Assistance
        </h2>
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  if (error || lots.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Car className="w-5 h-5 text-emerald-600" />
          Smart Parking Assistance
        </h2>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          <span>{error || 'No designated parking facilities currently listed for this venue.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-600" />
            Smart Parking Assistance
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time lot occupancy, sensor telemetry, and arrival window guidance
          </p>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Active Feed</span>
        </div>
      </div>

      {/* Lots Grid */}
      <div className="space-y-6">
        {lots.map((lot) => {
          const occupancyRate = lot.occupancyPercent;
          const isHighDemand = occupancyRate >= 80;
          const isModerate = occupancyRate >= 50 && occupancyRate < 80;
          const pred = predictions[lot.id];

          return (
            <div
              key={lot.id}
              className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4 transition-all hover:border-gray-300"
            >
              {/* Lot Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
                    <Car className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">{lot.lotName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderSourceBadge(lot.dataSource, getSourceTooltip(lot.dataSource))}
                      <span className="text-[11px] text-gray-400">
                        Updated {new Date(lot.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Manual Update Button */}
                {(isOwnerOrAdmin || user?.role === 'VENUE_OWNER' || user?.role === 'ADMIN') && (
                  <button
                    type="button"
                    onClick={() => handleOpenManualEdit(lot)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    Update Occupancy
                  </button>
                )}
              </div>

              {/* Occupancy Stats Bar */}
              <div className="grid grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-gray-200/80 text-center">
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Capacity</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{lot.totalSpots}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Occupied</p>
                  <p className="text-lg font-bold text-gray-700 mt-0.5">{lot.occupiedSpots}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Available</p>
                  <p className={`text-lg font-extrabold mt-0.5 ${lot.availableSpots > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {lot.availableSpots}
                  </p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600">Current Occupancy</span>
                  <span
                    className={
                      isHighDemand
                        ? 'text-rose-600 font-bold'
                        : isModerate
                        ? 'text-amber-600 font-bold'
                        : 'text-emerald-600 font-bold'
                    }
                  >
                    {lot.occupancyPercent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isHighDemand
                        ? 'bg-rose-500'
                        : isModerate
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(lot.occupancyPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Arrival Window Advice */}
              <div className="flex items-center gap-2 text-xs p-3 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-900">
                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Suggested Arrival:</span>
                <span>{lot.suggestedArrivalWindow}</span>
              </div>

              {/* Prediction & History Accordions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/60 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedLotForPred(selectedLotForPred === lot.id ? null : lot.id)}
                  className="font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {selectedLotForPred === lot.id ? 'Hide Prediction Tool' : 'Forecast Future Event Parking'}
                </button>

                {lot.recentHistory && lot.recentHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleHistory(lot.id)}
                    className="font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    {expandedHistory[lot.id] ? 'Hide Telemetry Log' : 'View Telemetry Log'}
                  </button>
                )}
              </div>

              {/* Prediction Section (Distinctly Styled for Predicted Values) */}
              {selectedLotForPred === lot.id && (
                <div className="p-4 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <h4 className="font-bold text-sm text-purple-900">Event Date Parking Forecast</h4>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      AI Model Projection
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Target Date</label>
                      <input
                        type="date"
                        value={predDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setPredDate(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Time Slot</label>
                      <select
                        value={predSlot}
                        onChange={(e) => setPredSlot(e.target.value as TimeSlot)}
                        className="w-full text-xs px-2.5 py-1.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                      >
                        <option value="MORNING">Morning (08:00 - 13:00)</option>
                        <option value="EVENING">Evening (16:00 - 23:00)</option>
                        <option value="FULL_DAY">Full Day</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleFetchPrediction(lot.id)}
                        disabled={loadingPrediction}
                        className="w-full text-xs font-semibold py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {loadingPrediction ? 'Forecasting...' : 'Calculate Forecast'}
                      </button>
                    </div>
                  </div>

                  {/* Predicted Values Render */}
                  {pred && (
                    <div className="bg-white p-3.5 rounded-xl border border-purple-200 space-y-3">
                      <div className="flex items-center justify-between">
                        {renderSourceBadge('PREDICTED', getSourceTooltip('PREDICTED'))}
                        <span className="text-xs font-bold text-purple-900">
                          {pred.predictedOccupancyPercent}% Expected Occupancy
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-purple-50/50 rounded-lg">
                          <p className="text-gray-500">Predicted Occupied</p>
                          <p className="font-bold text-purple-900 text-sm">{pred.predictedOccupiedSpots} spots</p>
                        </div>
                        <div className="p-2 bg-purple-50/50 rounded-lg">
                          <p className="text-gray-500">Predicted Free</p>
                          <p className="font-bold text-emerald-700 text-sm">{pred.predictedAvailableSpots} spots</p>
                        </div>
                        <div className="p-2 bg-purple-50/50 rounded-lg">
                          <p className="text-gray-500">Recommended Arrival</p>
                          <p className="font-bold text-gray-800 text-xs">{pred.suggestedArrivalWindow}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500 italic">
                        <span className="font-semibold text-gray-700">Formula basis:</span> {pred.predictionBasis}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* History Log Render */}
              {expandedHistory[lot.id] && lot.recentHistory && (
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-2">
                  <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Recent Telemetry Logs
                  </p>
                  <div className="divide-y divide-gray-100 max-h-36 overflow-y-auto">
                    {lot.recentHistory.map((item) => (
                      <div key={item.id} className="py-1.5 flex justify-between items-center text-[11px]">
                        <span className="text-gray-500">
                          {new Date(item.recordedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="font-semibold text-gray-800">{item.occupiedSpots} spots occupied</span>
                        <span className="text-[10px] text-gray-400 font-mono">[{item.dataSource}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Update Modal (Owner / Admin) */}
      {editingLot && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                Update Parking Count
              </h3>
              <button
                type="button"
                onClick={() => setEditingLot(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Update real-time parking count for <span className="font-bold">{editingLot.lotName}</span>. Total capacity: {editingLot.totalSpots} spots.
            </p>

            <form onSubmit={handleSaveManualOccupancy} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Occupied Spots Count
                </label>
                <input
                  type="number"
                  min="0"
                  max={editingLot.totalSpots}
                  value={newOccupiedSpots}
                  onChange={(e) => setNewOccupiedSpots(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Calculated available: {Math.max(0, editingLot.totalSpots - newOccupiedSpots)} spots ({Math.round((newOccupiedSpots / editingLot.totalSpots) * 100)}% occupancy)
                </p>
              </div>

              {manualError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              {manualSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{manualSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingLot(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualUpdating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs"
                >
                  {manualUpdating ? 'Saving...' : 'Save Occupancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
