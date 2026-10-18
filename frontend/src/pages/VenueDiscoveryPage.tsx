import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Venue, PageResponse } from '../types';
import { VenueCardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
  Search,
  Filter,
  MapPin,
  Users,
  Star,
  X,
  Scale,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const VenueDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Compare state (up to 3 venues)
  const [compareList, setCompareList] = useState<Venue[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Filter form states derived from URL searchParams
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const category = searchParams.get('category') || '';
  const eventType = searchParams.get('eventType') || '';
  const minCapacity = searchParams.get('minCapacity') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const facility = searchParams.get('facility') || '';
  const sortBy = searchParams.get('sortBy') || 'rating';
  const sortDir = searchParams.get('sortDir') || 'desc';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Local filter states for sidebar
  const [localSearch, setLocalSearch] = useState(search);
  const [localCity, setLocalCity] = useState(city);
  const [localCategory, setLocalCategory] = useState(category);
  const [localEventType, setLocalEventType] = useState(eventType);
  const [localMinCapacity, setLocalMinCapacity] = useState(minCapacity);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localFacility, setLocalFacility] = useState(facility);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<PageResponse<Venue>>('/venues', {
        params: {
          search: search || undefined,
          city: city || undefined,
          category: category || undefined,
          eventType: eventType || undefined,
          minCapacity: minCapacity ? parseInt(minCapacity, 10) : undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          facility: facility || undefined,
          sortBy,
          sortDir,
          page,
          size: 9,
        },
      });
      setVenues(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load venues. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  }, [search, city, category, eventType, minCapacity, minPrice, maxPrice, facility, sortBy, sortDir, page]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (localSearch) newParams.set('search', localSearch);
    if (localCity) newParams.set('city', localCity);
    if (localCategory) newParams.set('category', localCategory);
    if (localEventType) newParams.set('eventType', localEventType);
    if (localMinCapacity) newParams.set('minCapacity', localMinCapacity);
    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    if (localFacility) newParams.set('facility', localFacility);
    newParams.set('sortBy', sortBy);
    newParams.set('sortDir', sortDir);
    newParams.set('page', '0'); // reset page
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setLocalSearch('');
    setLocalCity('');
    setLocalCategory('');
    setLocalEventType('');
    setLocalMinCapacity('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalFacility('');
    setSearchParams(new URLSearchParams({ sortBy: 'rating', sortDir: 'desc', page: '0' }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [newSortBy, newSortDir] = value.split(':');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSortBy);
    newParams.set('sortDir', newSortDir);
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCompare = (venue: Venue) => {
    if (compareList.some((v) => v.id === venue.id)) {
      setCompareList(compareList.filter((v) => v.id !== venue.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 venues at a time.');
        return;
      }
      setCompareList([...compareList, venue]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Explore Event Venues</h1>
          <p className="text-sm text-gray-500 mt-1">
            Found <span className="font-semibold text-gray-900">{totalElements}</span> verified venue{totalElements === 1 ? '' : 's'}
          </p>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={`${sortBy}:${sortDir}`}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="rating:desc">Highest Rated</option>
            <option value="basePricePerDay:asc">Price: Low to High</option>
            <option value="basePricePerDay:desc">Price: High to Low</option>
            <option value="capacity:desc">Capacity: Largest First</option>
            <option value="capacity:asc">Capacity: Smallest First</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-6 self-start sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Filter className="w-4 h-4 text-green-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={resetFilters}
              type="button"
              className="text-xs text-green-600 hover:text-green-800 font-semibold"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={applyFilters} className="space-y-4">
            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Venue Keyword
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Ballroom, Resort..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. New York, Chicago"
                value={localCity}
                onChange={(e) => setLocalCity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={localCategory}
                onChange={(e) => setLocalCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="Grand Ballroom">Grand Ballroom</option>
                <option value="Luxury Resort">Luxury Resort</option>
                <option value="Rooftop Terrace">Rooftop Terrace</option>
                <option value="Heritage Palace">Heritage Palace</option>
                <option value="Beachside Lawn">Beachside Lawn</option>
                <option value="Conference Center">Conference Center</option>
                <option value="Modern Loft">Modern Loft</option>
                <option value="Botanical Pavilion">Botanical Pavilion</option>
                <option value="Country Club">Country Club</option>
                <option value="Banquet Hall">Banquet Hall</option>
              </select>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Event Type
              </label>
              <select
                value={localEventType}
                onChange={(e) => setLocalEventType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="">Any Event</option>
                <option value="WEDDING">Wedding</option>
                <option value="CONFERENCE">Conference</option>
                <option value="BIRTHDAY">Birthday</option>
                <option value="CORPORATE">Corporate</option>
                <option value="GALA">Gala Dinner</option>
                <option value="EXPO">Exhibition / Expo</option>
              </select>
            </div>

            {/* Minimum Capacity */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Min Capacity: {localMinCapacity || 'Any'}
              </label>
              <input
                type="number"
                placeholder="e.g. 150"
                min="0"
                value={localMinCapacity}
                onChange={(e) => setLocalMinCapacity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Daily Budget ($)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Facility search */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Desired Amenity
              </label>
              <input
                type="text"
                placeholder="e.g. Parking, WiFi, Bar"
                value={localFacility}
                onChange={(e) => setLocalFacility(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-sm transition-colors mt-2"
            >
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Venues Grid */}
        <main className="lg:col-span-3 space-y-6">
          {error && <ErrorMessage message={error} onRetry={fetchVenues} />}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <VenueCardSkeleton key={i} />
              ))}
            </div>
          ) : venues.length === 0 ? (
            <EmptyState
              title="No matching venues found"
              description="Try adjusting your filters, budget, or searching for a different city."
              actionText="Clear All Filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => {
                const isCompared = compareList.some((v) => v.id === venue.id);

                return (
                  <div
                    key={venue.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Placeholder Card Header */}
                      <div className="h-44 bg-gradient-to-br from-green-800 via-green-700 to-gray-800 relative p-3 flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                          <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            {venue.category}
                          </span>
                          <div className="bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span>{venue.rating.toFixed(1)}</span>
                            <span className="text-gray-300 font-normal">({venue.reviewCount})</span>
                          </div>
                        </div>

                        {/* Location Tag */}
                        <div className="flex items-center gap-1 text-xs text-white/90">
                          <MapPin className="w-3.5 h-3.5 text-green-300" />
                          <span>{venue.city}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-green-700 transition-colors line-clamp-1">
                          {venue.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {venue.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-600 pt-2">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span>Up to <b>{venue.capacity}</b> guests</span>
                          </div>
                        </div>

                        {/* Facilities tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {venue.facilities.split(',').slice(0, 3).map((f, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-md">
                              {f.trim()}
                            </span>
                          ))}
                          {venue.facilities.split(',').length > 3 && (
                            <span className="text-[10px] text-gray-400 self-center">
                              +{venue.facilities.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">From</span>
                          <div className="text-base font-extrabold text-green-700">
                            ${venue.basePricePerDay.toLocaleString()}
                            <span className="text-xs font-normal text-gray-500"> / day</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCompare(venue)}
                            className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                              isCompared
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                            title="Compare venue"
                          >
                            <Scale className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/venues/${venue.id}`}
                            className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-sm text-gray-600">
                Page <span className="font-semibold">{page + 1}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </span>

              <button
                disabled={page >= totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Floating Compare Drawer Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Scale className="w-4 h-4 text-green-400" />
            <span>
              Comparing <b className="text-green-400">{compareList.length}</b> / 3 venues
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Open Comparison
            </button>
            <button
              onClick={() => setCompareList([])}
              className="text-gray-400 hover:text-white p-1 text-xs"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={() => setIsCompareOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl p-6 border border-gray-200 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Compare Venues</h3>
                </div>
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 font-semibold text-gray-500 w-1/4">Feature</th>
                      {compareList.map((v) => (
                        <th key={v.id} className="py-3 px-4 font-bold text-gray-900">
                          {v.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2.5 px-4 text-gray-500 font-medium">City</td>
                      {compareList.map((v) => (
                        <td key={v.id} className="py-2.5 px-4 font-medium text-gray-800">{v.city}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-gray-500 font-medium">Category</td>
                      {compareList.map((v) => (
                        <td key={v.id} className="py-2.5 px-4">{v.category}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-gray-500 font-medium">Base Price / Day</td>
                      {compareList.map((v) => (
                        <td key={v.id} className="py-2.5 px-4 font-bold text-green-700">${v.basePricePerDay.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-gray-500 font-medium">Capacity</td>
                      {compareList.map((v) => (
                        <td key={v.id} className="py-2.5 px-4 font-semibold">{v.capacity} guests</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-gray-500 font-medium">Rating</td>
                      {compareList.map((v) => (
                        <td key={v.id} className="py-2.5 px-4 flex items-center gap-1 text-yellow-600 font-semibold">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{v.rating.toFixed(1)}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-gray-500 font-medium">Facilities</td>
                      {compareList.map((v) => (
                        <td key={v.id} className="py-2.5 px-4 text-xs text-gray-600 leading-relaxed">
                          {v.facilities}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
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
