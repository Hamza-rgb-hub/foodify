import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, ChevronLeft, Phone } from 'lucide-react';
import api from '../utils/api';
import FoodCard from '../components/food/FoodCard';
import { SkeletonList } from '../components/common/SkeletonCard';
import { formatPrice, getImageUrl } from '../utils/helpers';

export default function ShopDetailPage() {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, fRes] = await Promise.all([
          api.get(`/partners/${id}`),
          api.get(`/food/partner/${id}`),
        ]);
        setPartner(pRes.data.data);
        const foodList = fRes.data.data || [];
        setFoods(foodList);
        // Extract unique categories
        const cats = [...new Map(foodList.map(f => [f.category?._id, f.category]).filter(([k]) => k)).values()];
        setCategories(cats);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, [id]);

  const filteredFoods = activeCategory === 'all'
    ? foods
    : foods.filter(f => f.category?._id === activeCategory);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="skeleton h-64 rounded-3xl mb-6" />
        <SkeletonList count={6} />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🏪</p>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Restaurant not found</h2>
        <Link to="/shops" className="btn-primary mt-4 inline-flex">Back to Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/shops" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ChevronLeft size={16} /> All Restaurants
      </Link>

      {/* Cover + Info */}
      <div className="card overflow-hidden mb-8">
        <div className="relative h-56 sm:h-72">
          <img
            src={getImageUrl(partner.coverImage || partner.logo) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80'}
            alt={partner.shopName}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge text-white text-xs ${partner.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {partner.isOpen ? '● Open Now' : '● Closed'}
                  </span>
                  {partner.cuisine?.slice(0, 3).map(c => (
                    <span key={c} className="badge bg-white/20 text-white text-xs backdrop-blur-sm">{c}</span>
                  ))}
                </div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {partner.shopName}
                </h1>
              </div>
              {partner.logo && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-xl flex-shrink-0">
                  <img src={getImageUrl(partner.logo)} alt="" className="w-full h-full object-cover"
                    onError={e => { e.target.parentElement.style.display = 'none'; }} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-5 flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-1.5">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-900 dark:text-white">
              {partner.rating?.average > 0 ? partner.rating.average.toFixed(1) : 'New'}
            </span>
            {partner.rating?.count > 0 && <span className="text-sm text-gray-400">({partner.rating.count} reviews)</span>}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Clock size={15} className="text-orange-400" />
            {partner.deliveryTime?.min}–{partner.deliveryTime?.max} min delivery
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            🛵 {partner.deliveryFee > 0 ? `${formatPrice(partner.deliveryFee)} delivery` : 'Free delivery'}
          </div>
          {partner.minimumOrder > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📦 Min order: {formatPrice(partner.minimumOrder)}
            </div>
          )}
          {partner.address?.city && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin size={14} className="text-orange-400" />
              {partner.address.city}
            </div>
          )}
        </div>
        {partner.description && (
          <div className="px-5 pb-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{partner.description}</p>
          </div>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          <button onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${activeCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
            All Items ({foods.length})
          </button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${activeCategory === cat._id ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Food Grid */}
      {filteredFoods.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFoods.map((food, i) => <FoodCard key={food._id} food={food} index={i} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-gray-500 dark:text-gray-400">No items in this category</p>
        </div>
      )}
    </div>
  );
}
