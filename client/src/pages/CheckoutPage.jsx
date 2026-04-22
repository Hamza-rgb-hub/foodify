import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, MapPin, Phone, Info } from 'lucide-react';
import { selectCartItems, selectCartTotal, clearCartLocal } from '../store/slices/cartSlice';
import { formatPrice, getImageUrl } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', phone: '', instructions: '' });

  if (!items.length) { navigate('/cart'); return null; }

  const partner = items[0]?.food?.partner;
  const partnerId = typeof partner === 'object' ? partner._id : partner;
  const deliveryFee = partner?.deliveryFee || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const set = (k) => (e) => setAddress(a => ({ ...a, [k]: e.target.value }));

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.phone) {
      toast.error('Please fill in all required address fields');
      return;
    }
    setLoading(true);
    try {
      const orderPayload = {
        items: items.map(i => ({ food: i.food._id, quantity: i.quantity })),
        deliveryAddress: address,
        paymentMethod,
        partnerId,
        pricing: { subtotal, deliveryFee, tax, total, discount: 0 },
      };

      if (paymentMethod === 'stripe') {
        // Create payment intent first
        const { data: intentData } = await api.post('/payments/create-intent', { amount: total });
        // In production, use Stripe Elements to confirm. For demo, we proceed directly.
        toast('Stripe integration ready — connect Stripe Elements for live payments', { icon: 'ℹ️' });
        orderPayload.stripePaymentIntentId = intentData.paymentIntentId;
      }

      const { data } = await api.post('/orders', orderPayload);
      dispatch(clearCartLocal());
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-success/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 dark:text-white mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
        Checkout
      </motion.h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Form */}
        <div className="flex-1 space-y-6">
          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" /> Delivery Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street Address *</label>
                <input value={address.street} onChange={set('street')} placeholder="123 Main Street, Apt 4B" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                <input value={address.city} onChange={set('city')} placeholder="New York" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                <input value={address.state} onChange={set('state')} placeholder="NY" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ZIP Code</label>
                <input value={address.zipCode} onChange={set('zipCode')} placeholder="10001" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone *</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={address.phone} onChange={set('phone')} placeholder="+1 555 000 0000" className="input pl-10" required />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Instructions</label>
                <textarea value={address.instructions} onChange={set('instructions')} rows={2}
                  placeholder="Leave at door, ring bell, etc." className="input resize-none" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <CreditCard size={18} className="text-orange-500" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'cod', icon: Banknote, label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                { value: 'stripe', icon: CreditCard, label: 'Credit/Debit Card', desc: 'Powered by Stripe — secure' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setPaymentMethod(opt.value)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod === opt.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${paymentMethod === opt.value ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <opt.icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {paymentMethod === 'stripe' && (
              <div className="mt-4 flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                In production, Stripe Elements would load here for secure card entry. This demo will proceed to order confirmation.
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:w-80">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-5">Order Review</h2>
            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto scrollbar-hide">
              {items.map(item => (
                <div key={item._id} className="flex items-center gap-3">
                  <img src={getImageUrl(item.food?.images?.[0]?.url)} alt={item.food?.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.food?.name}</p>
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {formatPrice((item.food?.discountedPrice || item.food?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-4 mb-5">
              {[['Subtotal', formatPrice(subtotal)], ['Delivery', deliveryFee ? formatPrice(deliveryFee) : 'Free'], ['Tax (8%)', formatPrice(tax)]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-2">
                <span>Total</span>
                <span className="text-orange-500 text-lg">{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing Order…</> : `Place Order · ${formatPrice(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
