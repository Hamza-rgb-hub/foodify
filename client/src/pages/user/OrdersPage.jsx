import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDateTime, getOrderStatusLabel, getOrderStatusColor, getImageUrl } from '../../utils/helpers';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'placed', label: 'Placed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'On the Way' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 10 });
    if (status) params.set('status', status);
    api.get(`/orders/my-orders?${params}`)
      .then(r => { setOrders(r.data.data || []); setPagination(r.data.pagination || {}); })
      .finally(() => setLoading(false));
  }, [status, page]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        My Orders
      </motion.h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {STATUS_TABS.map(tab => (
          <button key={tab.value} onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${
              status === tab.value ? 'bg-orange-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : orders.length ? (
        <>
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/orders/${order._id}`} className="card p-4 flex items-center gap-4 hover:shadow-lg transition-all group block">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    {order.partner?.logo ? (
                      <img src={getImageUrl(order.partner.logo)} alt="" className="w-full h-full object-cover"
                        onError={e => { e.target.parentElement.innerHTML = '<span class="text-2xl">🏪</span>'; }} />
                    ) : <span className="text-2xl">🏪</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{order.partner?.shopName || 'Restaurant'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{order.orderNumber} · {formatDateTime(order.createdAt)}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`badge text-xs ${getOrderStatusColor(order.orderStatus)}`}>
                        {getOrderStatusLabel(order.orderStatus)}
                      </span>
                      <span className="text-sm font-semibold text-orange-500">{formatPrice(order.pricing?.total)}</span>
                      <span className="text-xs text-gray-400">{order.items?.length} item(s)</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${p === page ? 'bg-orange-500 text-white' : 'card text-gray-600 dark:text-gray-400'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No orders yet</h3>
          <p className="text-gray-400 mb-6">Your order history will appear here</p>
          <Link to="/food" className="btn-primary">Browse Menu</Link>
        </div>
      )}
    </div>
  );
}
