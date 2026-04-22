import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Star, Clock, Flame, Leaf } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function FoodCard({ food, index = 0 }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await dispatch(addToCart({ foodId: food._id, quantity: 1 })).unwrap();
      toast.success(`${food.name} added to cart! 🛒`);
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    }
  };

  const price = food.discountedPrice || food.price;
  const hasDiscount = food.discountedPrice && food.discountedPrice < food.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="card-hover group overflow-hidden"
    >
      <Link to={`/food/${food._id}`}>
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={getImageUrl(food.images?.[0]?.public_id)}
            alt={food.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {food.isVeg && (
              <span className="badge bg-emerald-500 text-white text-xs gap-1">
                <Leaf size={10} /> Veg
              </span>
            )}
            {food.isFeatured && (
              <span className="badge bg-orange-500 text-white text-xs">Featured</span>
            )}
            {hasDiscount && (
              <span className="badge bg-rose-500 text-white text-xs">
                {Math.round((1 - food.discountedPrice / food.price) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Spicy indicator */}
          {food.spicyLevel > 0 && (
            <div className="absolute top-3 right-3 flex gap-0.5">
              {Array.from({ length: food.spicyLevel }).map((_, i) => (
                <Flame key={i} size={14} className="text-red-500" fill="currentColor" />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {food.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {food.rating?.average?.toFixed(1) || '—'}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {food.description}
          </p>

          {food.partner && (
            <p className="text-xs text-orange-500 dark:text-orange-400 font-medium mb-2 truncate">
              {food.partner.shopName}
            </p>
          )}

          <div className="flex items-center gap-2 mb-4">
            {food.partner?.deliveryTime && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} />
                {food.partner.deliveryTime.min}–{food.partner.deliveryTime.max}m
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(food.price)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={15} />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
