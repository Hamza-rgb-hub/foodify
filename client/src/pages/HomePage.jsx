import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star, Clock, Shield, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import FoodCard from '../components/food/FoodCard';
import { SkeletonList } from '../components/common/SkeletonCard';
import { getImageUrl, formatPrice } from '../utils/helpers';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
};

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, foodRes, partnerRes] = await Promise.all([
          api.get('/categories'),
          api.get('/food?featured=true&limit=8'),
          api.get('/partners?limit=6'),
        ]);
        setCategories(catRes.data.data || []);
        setFeatured(foodRes.data.data || []);
        setPartners(partnerRes.data.data || []);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/food?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-12 pb-20">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-200/30 dark:bg-rose-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Fast Delivery · Fresh Food
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Delicious Food{' '}
                <span className="text-gradient">Delivered</span>{' '}
                Fast
              </h1>

              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
                Order from the best local restaurants and get fresh, hot meals delivered to your door in minutes.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto lg:mx-0 mb-8">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for food, restaurants..."
                    className="input pl-11 shadow-lg shadow-gray-200/50 dark:shadow-none h-12"
                  />
                </div>
                <button type="submit" className="btn-primary px-6 h-12 flex-shrink-0">
                  Search
                </button>
              </form>

              {/* Stats */}
              <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
                {[['500+', 'Restaurants'], ['50k+', 'Happy Customers'], ['20min', 'Avg. Delivery']].map(([n, l]) => (
                  <div key={l} className="text-center">
                    <p className="font-bold text-xl text-gray-900 dark:text-white">{n}</p>
                    <p className="text-xs">{l}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 flex justify-center"
            >
              <div className="relative w-80 h-80 sm:w-96 sm:h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-rose-200 dark:from-orange-900/40 dark:to-rose-900/40 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
                <motion.img
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80"
                  alt="Delicious food"
                  className="absolute inset-4 rounded-full object-cover shadow-2xl shadow-orange-200/60 dark:shadow-orange-900/40"
                />
                {/* Floating cards */}
                {[
                  { top: '5%', right: '-5%', icon: '⭐', text: '4.9 Rating' },
                  { bottom: '10%', left: '-5%', icon: '🚀', text: '20 min delivery' },
                ].map((card, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.2 }}
                    style={{ top: card.top, right: card.right, bottom: card.bottom, left: card.left }}
                    className="absolute card px-3 py-2 flex items-center gap-2 shadow-xl text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    <span className="text-lg">{card.icon}</span>
                    {card.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Browse Categories
            </h2>
            <Link to="/food" className="text-sm font-medium text-orange-500 flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
            {(categories.length ? categories : Array.from({ length: 12 })).map((cat, i) => (
              cat ? (
                <Link key={cat._id} to={`/food?category=${cat._id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-orange-50 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-700 cursor-pointer transition-all"
                  >
                    <span className="text-2xl">{cat.icon || '🍽️'}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{cat.name}</span>
                  </motion.div>
                </Link>
              ) : (
                <div key={i} className="skeleton h-20 rounded-2xl" />
              )
            ))}
          </div>
        </div>
      </section>

      {/* Featured Foods */}
      <section className="py-14 bg-orange-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Featured Dishes
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Handpicked favorites from our top restaurants</p>
            </div>
            <Link to="/food?featured=true" className="btn-secondary text-sm py-2 hidden sm:flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {loading ? (
            <SkeletonList count={8} />
          ) : featured.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.map((food, i) => <FoodCard key={food._id} food={food} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🍽️</p>
              <p className="font-medium">No featured dishes yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Restaurants */}
      {partners.length > 0 && (
        <section className="py-14 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Top Restaurants
              </h2>
              <Link to="/shops" className="text-sm font-medium text-orange-500 flex items-center gap-1 hover:gap-2 transition-all">
                See all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {partners.map((partner, i) => (
                <motion.div
                  key={partner._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link to={`/shops/${partner._id}`} className="card-hover block overflow-hidden group">
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={getImageUrl(partner.coverImage || partner.logo) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80'}
                        alt={partner.shopName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className={`absolute top-3 right-3 badge ${partner.isOpen ? 'bg-emerald-500' : 'bg-red-500'} text-white text-xs`}>
                        {partner.isOpen ? '● Open' : '● Closed'}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {partner.shopName}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">{partner.cuisine?.join(', ')}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            {partner.rating?.average?.toFixed(1) || 'New'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={11} /> {partner.deliveryTime?.min}–{partner.deliveryTime?.max} min</span>
                        <span>{partner.deliveryFee ? `${formatPrice(partner.deliveryFee)} delivery` : 'Free delivery'}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-14 bg-orange-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
            Why Choose Foodify?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Lightning Fast', desc: 'Average delivery time of just 20 minutes. Hot food at your door.', color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20' },
              { icon: Star, title: 'Top Quality', desc: 'All restaurants are vetted and rated by real customers.', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/20' },
              { icon: Shield, title: 'Secure Payments', desc: 'Pay securely with Stripe or cash on delivery. 100% safe.', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card p-6 text-center">
                <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <f.icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-rose-500">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Own a Restaurant?
          </h2>
          <p className="text-lg text-orange-100 mb-8">
            Join thousands of food partners and grow your business with FoodieRush.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors shadow-xl">
            Become a Partner <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
