import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { EventBudget, BudgetRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Calculator, 
  DollarSign, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  FolderOpen, 
  PlusCircle
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const BudgetEstimatorPage: React.FC = () => {
  const { user } = useAuth();

  const [eventTitle, setEventTitle] = useState('My Grand Event');
  const [totalLimit, setTotalLimit] = useState<number>(10000);
  const [venueCost, setVenueCost] = useState<number>(3500);
  const [cateringCost, setCateringCost] = useState<number>(2500);
  const [decorationCost, setDecorationCost] = useState<number>(1200);
  const [photographyCost, setPhotographyCost] = useState<number>(800);
  const [entertainmentCost, setEntertainmentCost] = useState<number>(600);
  const [otherCost, setOtherCost] = useState<number>(400);
  const [contingencyPercent, setContingencyPercent] = useState<number>(10);
  const [currentBudgetId, setCurrentBudgetId] = useState<number | null>(null);

  const [savedBudgets, setSavedBudgets] = useState<EventBudget[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Live client-side math
  const subtotal = (venueCost || 0) + (cateringCost || 0) + (decorationCost || 0) + 
                   (photographyCost || 0) + (entertainmentCost || 0) + (otherCost || 0);
  const contingencyAmount = Math.round((subtotal * (contingencyPercent / 100)) * 100) / 100;
  const totalEstimatedCost = Math.round((subtotal + contingencyAmount) * 100) / 100;
  const variance = Math.round((totalLimit - totalEstimatedCost) * 100) / 100;
  const isOverBudget = variance < 0;
  const percentUsed = totalLimit > 0 ? Math.min(Math.round((totalEstimatedCost / totalLimit) * 100), 200) : 100;

  const loadSavedBudgets = useCallback(async () => {
    try {
      setLoadingSaved(true);
      const res = await apiClient.get<EventBudget[]>('/budgets/my');
      setSavedBudgets(res.data);
    } catch (err) {
      console.error('Failed to load user budgets', err);
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadSavedBudgets();
    }
  }, [user, loadSavedBudgets]);


  const handleSelectBudget = (b: EventBudget) => {
    setCurrentBudgetId(b.id);
    setEventTitle(b.eventTitle);
    setTotalLimit(b.totalLimit);
    setVenueCost(b.venueCost);
    setCateringCost(b.cateringCost);
    setDecorationCost(b.decorationCost);
    setPhotographyCost(b.photographyCost);
    setEntertainmentCost(b.entertainmentCost);
    setOtherCost(b.otherCost);
    setContingencyPercent(b.contingencyPercent);
    setSaveSuccess(`Loaded budget: "${b.eventTitle}"`);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleReset = () => {
    setCurrentBudgetId(null);
    setEventTitle('New Event Budget');
    setTotalLimit(8000);
    setVenueCost(2500);
    setCateringCost(2000);
    setDecorationCost(1000);
    setPhotographyCost(600);
    setEntertainmentCost(500);
    setOtherCost(300);
    setContingencyPercent(10);
    setSaveSuccess(null);
    setSaveError(null);
  };

  const handleApplyPreset = (type: 'wedding' | 'corporate' | 'party') => {
    if (type === 'wedding') {
      setEventTitle('Dream Wedding Budget');
      setTotalLimit(18000);
      setVenueCost(6500);
      setCateringCost(5000);
      setDecorationCost(2500);
      setPhotographyCost(1800);
      setEntertainmentCost(1200);
      setOtherCost(500);
      setContingencyPercent(12);
    } else if (type === 'corporate') {
      setEventTitle('Tech Summit & Banquet');
      setTotalLimit(12000);
      setVenueCost(4500);
      setCateringCost(3500);
      setDecorationCost(800);
      setPhotographyCost(1000);
      setEntertainmentCost(1500);
      setOtherCost(400);
      setContingencyPercent(8);
    } else {
      setEventTitle('Birthday Celebration');
      setTotalLimit(4000);
      setVenueCost(1200);
      setCateringCost(1400);
      setDecorationCost(500);
      setPhotographyCost(300);
      setEntertainmentCost(400);
      setOtherCost(150);
      setContingencyPercent(10);
    }
  };

  const handleSaveBudget = async () => {
    if (!user) {
      setSaveError('Please log in to save this budget to your account.');
      return;
    }

    if (!eventTitle.trim()) {
      setSaveError('Please enter an event title.');
      return;
    }

    if (totalLimit <= 0) {
      setSaveError('Total budget limit must be greater than 0.');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      const payload: BudgetRequest = {
        eventTitle: eventTitle.trim(),
        totalLimit,
        venueCost: venueCost || 0,
        cateringCost: cateringCost || 0,
        decorationCost: decorationCost || 0,
        photographyCost: photographyCost || 0,
        entertainmentCost: entertainmentCost || 0,
        otherCost: otherCost || 0,
        contingencyPercent: contingencyPercent || 0,
      };

      if (currentBudgetId) {
        const res = await apiClient.put<EventBudget>(`/budgets/${currentBudgetId}`, payload);
        setSaveSuccess(`Budget "${res.data.eventTitle}" updated successfully!`);
      } else {
        const res = await apiClient.post<EventBudget>('/budgets', payload);
        setCurrentBudgetId(res.data.id);
        setSaveSuccess(`Budget "${res.data.eventTitle}" saved successfully!`);
      }

      await loadSavedBudgets();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to save budget.';
      setSaveError(msg || 'Failed to save budget.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Calculator className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Event Budget Estimator
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Plan, break down, and calibrate costs for venue, catering, decor, and contingencies.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('wedding')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            Wedding
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('corporate')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            Corporate
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('party')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
          >
            Party
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* MANDATORY DISCLAIMER BANNER (Spec Requirement) */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              Estimate only, not a quotation
            </p>
            <p className="text-xs text-amber-800">
              All calculated figures are indicative estimates based on typical industry rates. Final bookings and vendor pricing are confirmed at checkout.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form / Table vs Summary Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Editable Line Items Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Annual Gala 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Budget Target ($)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={totalLimit}
                    onChange={(e) => setTotalLimit(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-base font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Line Item Breakdown
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-y border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description / Allocation</th>
                      <th className="py-2.5 px-3 text-right">Estimated Cost ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Venue */}
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-semibold text-gray-800">Venue Rental</td>
                      <td className="py-3 px-3 text-xs text-gray-500">Hall, grounds, base fees, security deposit</td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={venueCost}
                          onChange={(e) => setVenueCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 px-2 py-1.5 text-right border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>

                    {/* Catering */}
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-semibold text-gray-800">Catering & Dining</td>
                      <td className="py-3 px-3 text-xs text-gray-500">Meals, beverages, cocktail bar, tableware</td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={cateringCost}
                          onChange={(e) => setCateringCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 px-2 py-1.5 text-right border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>

                    {/* Decoration */}
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-semibold text-gray-800">Decor & Styling</td>
                      <td className="py-3 px-3 text-xs text-gray-500">Floral, backdrop, lighting, table centerpieces</td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={decorationCost}
                          onChange={(e) => setDecorationCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 px-2 py-1.5 text-right border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>

                    {/* Photography */}
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-semibold text-gray-800">Photography & Video</td>
                      <td className="py-3 px-3 text-xs text-gray-500">Crew, drone coverage, edited highlight reel</td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={photographyCost}
                          onChange={(e) => setPhotographyCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 px-2 py-1.5 text-right border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>

                    {/* Entertainment */}
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-semibold text-gray-800">Entertainment & Music</td>
                      <td className="py-3 px-3 text-xs text-gray-500">DJ, live band, sound technician, emcee</td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={entertainmentCost}
                          onChange={(e) => setEntertainmentCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 px-2 py-1.5 text-right border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>

                    {/* Other */}
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-semibold text-gray-800">Other / Miscellaneous</td>
                      <td className="py-3 px-3 text-xs text-gray-500">Stationery, guest favors, permits, transport</td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={otherCost}
                          onChange={(e) => setOtherCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 px-2 py-1.5 text-right border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contingency Slider */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-gray-800">Contingency Buffer</span>
                  <p className="text-xs text-gray-500">Recommended 5% - 15% for unforeseen extras</p>
                </div>
                <span className="text-base font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  {contingencyPercent}% (${contingencyAmount.toLocaleString()})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={contingencyPercent}
                onChange={(e) => setContingencyPercent(parseInt(e.target.value) || 0)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Actions: Save / Messages */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSaveBudget}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : currentBudgetId ? 'Update Budget' : 'Save Budget to Account'}
              </button>

              {saveSuccess && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  {saveSuccess}
                </div>
              )}

              {saveError && (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
                  <AlertCircle className="w-4 h-4" />
                  {saveError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Calculation Dashboard & Saved Budgets */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Cost Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal (Items)</span>
                <span className="font-semibold text-gray-900">${subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Contingency ({contingencyPercent}%)</span>
                <span className="font-semibold text-gray-900">+${contingencyAmount.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Total Estimated</span>
                <span className="text-2xl font-extrabold text-emerald-600">
                  ${totalEstimatedCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Target Limit</span>
                <span>${totalLimit.toLocaleString()}</span>
              </div>
            </div>

            {/* Variance Alert Box */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                isOverBudget
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {isOverBudget ? (
                <TrendingUp className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              ) : (
                <TrendingDown className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-bold">
                  {isOverBudget ? 'Over Budget Warning' : 'Under Budget'}
                </p>
                <p className="mt-0.5">
                  {isOverBudget
                    ? `Estimated costs exceed target by $${Math.abs(variance).toLocaleString()}. Consider adjusting decor or catering.`
                    : `You have $${variance.toLocaleString()} buffer remaining under your target limit.`}
                </p>
              </div>
            </div>

            {/* Visual Budget Utilization Meter */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>Budget Consumed</span>
                <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                  {percentUsed}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    percentUsed > 100
                      ? 'bg-rose-500'
                      : percentUsed > 85
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* User Saved Budgets Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-emerald-600" />
                Saved Budgets
              </h2>
              {user && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  New
                </button>
              )}
            </div>

            {!user ? (
              <p className="text-xs text-gray-500 italic">
                Sign in to save and manage multiple event budgets on your account.
              </p>
            ) : loadingSaved ? (
              <LoadingSkeleton count={2} />
            ) : savedBudgets.length === 0 ? (
              <p className="text-xs text-gray-500">
                No saved budgets yet. Customize numbers above and click "Save Budget".
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {savedBudgets.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBudget(b)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                      currentBudgetId === b.id
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-gray-900">{b.eventTitle}</p>
                      <p className="text-gray-500">
                        Total: ${b.totalEstimatedCost.toLocaleString()} (Limit: ${b.totalLimit.toLocaleString()})
                      </p>
                    </div>
                    {b.isOverBudget ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        Over
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        OK
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
