import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { selectCartItems, selectCartTotal } from '../store/slices/cartSlice';
import { formatPrice, getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const handleQty = async (foodId, qty) => {
    await dispatch(updateCartItem({ foodId, quantity: qty }));
  };

  const handleRemove = async (foodId, name) => {
    await dispatch(removeFromCart(foodId));
    toast.success(`${name} removed from cart`);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to view your cart</h2>
        <p className="text-gray-500 mb-6">Please login to access your cart and checkout.</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <ShoppingBag size={80} className="mx-auto text-gray-200 dark:text-gray-800 mb-6" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious food to get started!</p>
        <Link to="/food" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  // Detect partner for delivery info
  const partner = items[0]?.food?.partner;
  const deliveryFee = partner?.deliveryFee || 0;
  const tax = total * 0.08;
  const grandTotal = total + deliveryFee + tax;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 dark:text-white mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
        Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </motion.h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const food = item.food;
              const price = food?.discountedPrice || food?.price || 0;
              return (
                <motion.div key={item._id || food?._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="card p-4 flex gap-4"
                >
                  <Link to={`/food/${food?._id}`} className="flex-shrink-0">
                    <img src={getImageUrl(food?.images?.[0]?.public_id)} alt={food?.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'; }} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/food/${food?._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-orange-500 transition-colors">
                          {food?.name}
                        </Link>
                        {food?.partner && (
                          <p className="text-xs text-gray-400 mt-0.5">{food.partner.shopName}</p>
                        )}
                      </div>
                      <button onClick={() => handleRemove(food?._id, food?.name)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-orange-500">{formatPrice(price * item.quantity)}</span>
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        <button onClick={() => handleQty(food?._id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 transition-all">
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center font-semibold text-sm text-gray-800 dark:text-gray-200">{item.quantity}</span>
                        <button onClick={() => handleQty(food?._id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 transition-all">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-5">Order Summary</h2>
            {partner && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl mb-5">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={getImageUrl(partner.logo)} alt={partner.shopName}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{partner.shopName}</p>
                </div>
              </div>
            )}
            <div className="space-y-3 text-sm mb-5">
              {[
                { label: 'Subtotal', value: formatPrice(total) },
                { label: 'Delivery Fee', value: deliveryFee ? formatPrice(deliveryFee) : 'Free' },
                { label: 'Tax (8%)', value: formatPrice(tax) },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{row.label}</span>
                  <span className={row.label === 'Delivery Fee' && !deliveryFee ? 'text-emerald-500 font-medium' : ''}>{row.value}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="text-orange-500 text-lg">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/food" className="btn-ghost w-full text-center mt-2 text-sm block">
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
