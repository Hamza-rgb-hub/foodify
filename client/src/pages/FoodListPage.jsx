import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import FoodCard from '../components/food/FoodCard';
import { SkeletonList } from '../components/common/SkeletonCard';
import { debounce } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function FoodListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: 'createdAt',
    isVeg: false,
    featured: searchParams.get('featured') || '',
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const fetchFoods = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.search) params.set('search', f.search);
      if (f.category) params.set('category', f.category);
      if (f.sortBy) params.set('sortBy', f.sortBy);
      if (f.isVeg) params.set('isVeg', 'true');
      if (f.featured) params.set('featured', f.featured);
      params.set('page', f.page);
      params.set('limit', '12');
      const { data } = await api.get(`/food?${params}`);
      setFoods(data.data || []);
      setPagination(data.pagination || {});
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchFoods(filters); }, [filters]);

  const debouncedSearch = useCallback(debounce((val) => {
    setFilters(f => ({ ...f, search: val, page: 1 }));
  }, 400), []);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {filters.search ? `Results for "${filters.search}"` : 'Explore Menu'}
        </h1>
        {pagination.total !== undefined && (
          <p className="text-gray-500 dark:text-gray-400">{pagination.total} items found</p>
        )}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            defaultValue={filters.search}
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Search food, cuisine, ingredients..."
            className="input pl-11"
          />
        </div>
        <div className="flex gap-2">
          <select value={filters.sortBy} onChange={e => setFilter('sortBy', e.target.value)}
            className="input w-auto min-w-[160px] cursor-pointer">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 flex-shrink-0 ${showFilters ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10 text-orange-600' : ''}`}>
            <Filter size={16} />
            Filters
            {(filters.isVeg || filters.category) && (
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6">
            <div className="card p-5">
              <div className="flex flex-wrap gap-4">
                {/* Categories */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setFilter('category', '')}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${!filters.category ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                      All
                    </button>
                    {categories.map(cat => (
                      <button key={cat._id} onClick={() => setFilter('category', filters.category === cat._id ? '' : cat._id)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filters.category === cat._id ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Dietary */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dietary</p>
                  <button onClick={() => setFilter('isVeg', !filters.isVeg)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filters.isVeg ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    🌿 Vegetarian
                  </button>
                </div>
                {/* Clear */}
                {(filters.isVeg || filters.category) && (
                  <button onClick={() => setFilters(f => ({ ...f, isVeg: false, category: '', page: 1 }))}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 ml-auto self-end">
                    <X size={14} /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {loading ? (
        <SkeletonList count={12} />
      ) : foods.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {foods.map((food, i) => <FoodCard key={food._id} food={food} index={i} />)}
          </div>
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                  className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                    p === filters.page ? 'bg-orange-500 text-white shadow-lg' : 'card hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🍽️</p>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No food items found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
          <button onClick={() => setFilters({ search: '', category: '', sortBy: 'createdAt', isVeg: false, featured: '', page: 1 })}
            className="btn-primary mt-4">Clear all filters</button>
        </div>
      )}
    </div>
  );
}
