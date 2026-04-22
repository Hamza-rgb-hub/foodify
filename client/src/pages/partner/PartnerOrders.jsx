import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Package } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'placed', label: '🆕 New' },
  { value: 'confirmed', label: '✅ Confirmed' },
  { value: 'preparing', label: '👨‍🍳 Preparing' },
  { value: 'out_for_delivery', label: '🛵 On the Way' },
  { value: 'delivered', label: '✔ Delivered' },
  { value: 'cancelled', label: '✖ Cancelled' },
];

const NEXT_STATUS = {
  placed: { label: 'Confirm Order', value: 'confirmed' },
  confirmed: { label: 'Start Preparing', value: 'preparing' },
  preparing: { label: 'Out for Delivery', value: 'out_for_delivery' },
  out_for_delivery: { label: 'Mark Delivered', value: 'delivered' },
};

export default function PartnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = () => {
    const params = new URLSearchParams({ limit: 50 });
    if (status) params.set('status', status);
    api.get(`/orders/partner-orders?${params}`)
      .then(r => setOrders(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [status]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [status]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(os => os.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success(`Order status updated to ${getOrderStatusLabel(newStatus)}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setUpdating(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Manage Orders
        </h1>
        <button onClick={() => { setLoading(true); load(); }}
          className="btn-ghost flex items-center gap-1.5 text-sm">
          <Clock size={14} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {STATUS_TABS.map(tab => (
          <button key={tab.value} onClick={() => setStatus(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${
              status === tab.value ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : orders.length ? (
        <div className="space-y-3">
          <AnimatePresence>
            {orders.map(order => {
              const next = NEXT_STATUS[order.orderStatus];
              const isExp = expanded === order._id;
              return (
                <motion.div key={order._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`card overflow-hidden ${['placed'].includes(order.orderStatus) ? 'ring-2 ring-orange-400' : ''}`}>
                  <button onClick={() => setExpanded(isExp ? null : order._id)}
                    className="w-full p-4 flex items-center gap-3 text-left">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      order.orderStatus === 'placed' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                      order.orderStatus === 'delivered' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      <Package size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">#{order.orderNumber}</p>
                        <span className={`badge text-xs ${getOrderStatusColor(order.orderStatus)}`}>
                          {getOrderStatusLabel(order.orderStatus)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.user?.name} · {formatDateTime(order.createdAt)} · {formatPrice(order.pricing?.total)}
                      </p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden border-t border-gray-100 dark:border-gray-800">
                        <div className="p-4 space-y-4">
                          {/* Customer Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Customer</p>
                              <p className="font-medium text-gray-900 dark:text-white">{order.user?.name}</p>
                              {order.user?.phone && <p className="text-gray-500">{order.user.phone}</p>}
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Delivery To</p>
                              <p className="font-medium text-gray-900 dark:text-white">{order.deliveryAddress?.street}</p>
                              <p className="text-gray-500">{order.deliveryAddress?.city}</p>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Items ({order.items?.length})</p>
                            <div className="space-y-1">
                              {order.items?.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-gray-700 dark:text-gray-300">{item.name} ×{item.quantity}</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="flex justify-between text-sm font-bold border-t border-gray-100 dark:border-gray-800 pt-2">
                            <span className="text-gray-700 dark:text-gray-300">Total</span>
                            <span className="text-orange-500">{formatPrice(order.pricing?.total)}</span>
                          </div>

                          {/* Payment info */}
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Payment: <span className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</span></span>
                            <span className={`capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{order.paymentStatus}</span>
                          </div>

                          {/* Action Button */}
                          {next && (
                            <button onClick={() => updateStatus(order._id, next.value)} disabled={updating === order._id}
                              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                              {updating === order._id
                                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <CheckCircle size={15} />}
                              {updating === order._id ? 'Updating…' : next.label}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
          <p className="text-gray-500">No {status ? getOrderStatusLabel(status).toLowerCase() : ''} orders</p>
        </div>
      )}
    </div>
  );
}
