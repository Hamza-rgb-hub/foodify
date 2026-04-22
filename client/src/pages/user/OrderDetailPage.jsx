import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle, Circle, Clock } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDateTime, getImageUrl, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📋' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'out_for_delivery', label: 'On the Way', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.data)).finally(() => setLoading(false));
    // Poll every 30s for status updates
    const interval = setInterval(() => {
      api.get(`/orders/${id}`).then(r => setOrder(r.data.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by user' });
      toast.success('Order cancelled');
      const r = await api.get(`/orders/${id}`);
      setOrder(r.data.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Cannot cancel'); }
    setCancelling(false);
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  );

  if (!order) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">📦</p>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Order not found</h2>
      <Link to="/orders" className="btn-primary mt-4 inline-flex">My Orders</Link>
    </div>
  );

  const currentStep = ORDER_STEPS.findIndex(s => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';
  const canCancel = ['placed', 'confirmed'].includes(order.orderStatus);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ChevronLeft size={16} /> My Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Order #{order.orderNumber}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`badge text-sm ${getOrderStatusColor(order.orderStatus)}`}>
          {getOrderStatusLabel(order.orderStatus)}
        </span>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Order Progress</h2>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="absolute left-5 top-5 w-0.5 bg-orange-400 transition-all duration-500"
              style={{ height: `${Math.max(0, currentStep / (ORDER_STEPS.length - 1)) * 100}%` }} />
            <div className="space-y-6">
              {ORDER_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.key} className="flex items-center gap-4 relative">
                    <motion.div
                      animate={active ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 text-sm flex-shrink-0 transition-all ${
                        done ? 'bg-orange-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/40' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                      {done ? <span>{step.icon}</span> : <Circle size={16} className="text-gray-300 dark:text-gray-600" />}
                    </motion.div>
                    <div>
                      <p className={`font-medium text-sm ${done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.label}</p>
                      {active && <p className="text-xs text-orange-500 mt-0.5 flex items-center gap-1"><Clock size={11} /> In progress</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isCancelled && order.cancelReason && (
        <div className="card p-4 mb-6 border-l-4 border-red-400">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Order Cancelled</p>
          <p className="text-sm text-gray-500 mt-1">{order.cancelReason}</p>
        </div>
      )}

      {/* Restaurant */}
      {order.partner && (
        <div className="card p-4 mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
            <img src={getImageUrl(order.partner.logo)} alt="" className="w-full h-full object-cover"
              onError={e => { e.target.parentElement.innerHTML = '<div class="w-full h-full bg-orange-100 flex items-center justify-center text-2xl">🏪</div>'; }} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{order.partner.shopName}</p>
            {order.partner.phone && <p className="text-xs text-gray-400">{order.partner.phone}</p>}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Items Ordered</h3>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.image && (
                <img src={getImageUrl(item.image)} alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  onError={e => { e.target.style.display = 'none'; }} />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-gray-400">×{item.quantity} · {formatPrice(item.price)} each</p>
              </div>
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="card p-5 mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          {[
            ['Subtotal', formatPrice(order.pricing?.subtotal)],
            ['Delivery Fee', order.pricing?.deliveryFee > 0 ? formatPrice(order.pricing.deliveryFee) : 'Free'],
            ['Tax', formatPrice(order.pricing?.tax)],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{l}</span><span>{v}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-2">
            <span>Total</span>
            <span className="text-orange-500 text-base">{formatPrice(order.pricing?.total)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 pt-1">
            <span>Payment Method</span>
            <span className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Payment Status</span>
            <span className={`capitalize font-medium ${order.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Delivery Address</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>{order.deliveryAddress?.street}</p>
          <p>{order.deliveryAddress?.city}{order.deliveryAddress?.state ? `, ${order.deliveryAddress.state}` : ''} {order.deliveryAddress?.zipCode}</p>
          {order.deliveryAddress?.phone && <p>📞 {order.deliveryAddress.phone}</p>}
          {order.deliveryAddress?.instructions && <p className="italic text-gray-400">"{order.deliveryAddress.instructions}"</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {canCancel && (
          <button onClick={handleCancel} disabled={cancelling}
            className="btn-secondary text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/10 flex-1">
            {cancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
        <Link to="/food" className="btn-primary flex-1 text-center">Order Again</Link>
      </div>
    </div>
  );
}
