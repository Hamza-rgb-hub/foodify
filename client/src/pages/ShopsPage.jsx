import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Clock, MapPin } from 'lucide-react';
import api from '../utils/api';
import { formatPrice, getImageUrl } from '../utils/helpers';

export default function ShopsPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterOpen) params.set('isOpen', 'true');
    api.get(`/partners?${params}&limit=20`)
      .then(r => setPartners(r.data.data || []))
      .finally(() => setLoading(false));
  }, [search, filterOpen]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Restaurants Near You
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Discover the best food spots in your area</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants..."
            className="input pl-11" />
        </div>
        <button onClick={() => setFilterOpen(!filterOpen)}
          className={`btn-secondary flex-shrink-0 ${filterOpen ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10 text-orange-600' : ''}`}>
          {filterOpen ? '● Open Now' : 'Open Now'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton h-48" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : partners.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner, i) => (
            <motion.div key={partner._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link to={`/shops/${partner._id}`} className="card-hover block overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getImageUrl(partner.coverImage || partner.logo) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'}
                    alt={partner.shopName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className={`absolute top-3 right-3 badge text-white text-xs ${partner.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {partner.isOpen ? '● Open' : '● Closed'}
                  </div>
                  {partner.cuisine?.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                      {partner.cuisine.slice(0, 2).map(c => (
                        <span key={c} className="badge bg-black/50 text-white text-xs backdrop-blur-sm">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors text-lg leading-tight">
                      {partner.shopName}
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {partner.rating?.average > 0 ? partner.rating.average.toFixed(1) : 'New'}
                      </span>
                      {partner.rating?.count > 0 && (
                        <span className="text-xs text-gray-400">({partner.rating.count})</span>
                      )}
                    </div>
                  </div>
                  {partner.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{partner.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {partner.deliveryTime?.min}–{partner.deliveryTime?.max} min
                    </span>
                    <span>
                      {partner.deliveryFee > 0 ? `${formatPrice(partner.deliveryFee)} delivery` : '🎁 Free delivery'}
                    </span>
                    {partner.minimumOrder > 0 && (
                      <span>Min {formatPrice(partner.minimumOrder)}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🏪</p>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No restaurants found</h3>
          <p className="text-gray-400">Try a different search or check back later</p>
        </div>
      )}
    </div>
  );
}
