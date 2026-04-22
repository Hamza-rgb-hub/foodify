import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Star, Clock, ShoppingCart, ChevronLeft, Flame, Leaf, Plus, Minus } from 'lucide-react';
import api from '../utils/api';
import { addToCart } from '../store/slices/cartSlice';
import { formatPrice, getImageUrl, spicyLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function FoodDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/food/${id}`).then(r => setFood(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    setAdding(true);
    try {
      await dispatch(addToCart({ foodId: food._id, quantity: qty })).unwrap();
      toast.success(`${food.name} ×${qty} added to cart! 🛒`);
    } catch (e) { toast.error(e || 'Failed'); }
    setAdding(false);
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="skeleton lg:w-1/2 aspect-square rounded-3xl" />
        <div className="flex-1 space-y-4">
          {[180, 80, 120, 60, 100].map((w, i) => <div key={i} className={`skeleton h-${i === 0 ? 10 : 5} w-${w === 180 ? 'full' : `${w === 80 ? '2/3' : '1/2'}`}`} />)}
        </div>
      </div>
    </div>
  );

  if (!food) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">🍽️</p>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Food item not found</h2>
      <Link to="/food" className="btn-primary mt-4 inline-flex">Back to Menu</Link>
    </div>
  );

  const price = food.discountedPrice || food.price;
  const hasDiscount = food.discountedPrice && food.discountedPrice < food.price;
  const discountPct = hasDiscount ? Math.round((1 - food.discountedPrice / food.price) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/food" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to Menu
      </Link>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Images */}
        <div className="lg:w-1/2">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-3xl overflow-hidden mb-3">
            <img
              src={getImageUrl(food.images?.[activeImg]?.public_id)}
              alt={food.name}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'; }}
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4 badge bg-rose-500 text-white text-sm px-3 py-1">
                {discountPct}% OFF
              </div>
            )}
          </motion.div>
          {food.images?.length > 1 && (
            <div className="flex gap-2">
              {food.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-orange-500' : 'border-transparent'}`}>
                  <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          {food.partner && (
            <Link to={`/shops/${food.partner._id}`} className="text-sm text-orange-500 hover:text-orange-600 font-medium mb-2 block">
              🏪 {food.partner.shopName}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            {food.name}
          </h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {food.isVeg && <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><Leaf size={12} /> Vegetarian</span>}
            {food.isVegan && <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">🌱 Vegan</span>}
            {food.isGlutenFree && <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">GF</span>}
            {food.spicyLevel > 0 && (
              <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {Array.from({ length: food.spicyLevel }).map((_, i) => <Flame key={i} size={11} className="inline" />)} {spicyLabel(food.spicyLevel)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-bold text-amber-700 dark:text-amber-400">{food.rating?.average > 0 ? food.rating.average.toFixed(1) : 'No ratings'}</span>
              {food.rating?.count > 0 && <span className="text-xs text-gray-400">({food.rating.count})</span>}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock size={14} className="text-orange-400" />
              {food.preparationTime} min prep time
            </div>
          </div>

          {food.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">{food.description}</p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
            {hasDiscount && <span className="text-lg text-gray-400 line-through">{formatPrice(food.price)}</span>}
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-bold text-gray-900 dark:text-white">{qty}</span>
              <button onClick={() => setQty(q => q + 1)}
                className="w-9 h-9 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                <Plus size={15} />
              </button>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={adding || !food.isAvailable}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              {adding ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShoppingCart size={17} />}
              {food.isAvailable ? `Add to Cart · ${formatPrice(price * qty)}` : 'Currently Unavailable'}
            </motion.button>
          </div>

          {/* Ingredients */}
          {food.ingredients?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Ingredients</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{food.ingredients.join(', ')}</p>
            </div>
          )}

          {/* Nutritional Info */}
          {food.nutritionalInfo && Object.values(food.nutritionalInfo).some(v => v) && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Nutritional Info</h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Calories', value: food.nutritionalInfo.calories, unit: 'kcal' },
                  { label: 'Protein', value: food.nutritionalInfo.protein, unit: 'g' },
                  { label: 'Carbs', value: food.nutritionalInfo.carbs, unit: 'g' },
                  { label: 'Fat', value: food.nutritionalInfo.fat, unit: 'g' },
                ].map(n => n.value ? (
                  <div key={n.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                    <p className="font-bold text-orange-500 text-sm">{n.value}{n.unit}</p>
                    <p className="text-xs text-gray-400">{n.label}</p>
                  </div>
                ) : null)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {food.reviews?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Reviews ({food.reviews.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {food.reviews.slice(0, 6).map((review, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                    {review.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{review.user?.name || 'Customer'}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={11} className={j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
