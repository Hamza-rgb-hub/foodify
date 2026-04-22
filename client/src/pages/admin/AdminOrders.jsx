import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatPrice, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 20 });
    if (status) p.set('status', status);
    api.get(`/admin/orders?${p}`)
      .then(r => { setOrders(r.data.data || []); setPagination(r.data.pagination || {}); })
      .finally(() => setLoading(false));
  }, [status, page]);

  const STATUS_TABS = ['', 'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>All Orders</h1>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all capitalize ${status === s ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                {['Order', 'Customer', 'Restaurant', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 rounded-xl" /></td></tr>
              )) : orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.user?.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.partner?.shopName}</td>
                  <td className="px-4 py-3 font-semibold text-orange-500">{formatPrice(order.pricing?.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs capitalize ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${getOrderStatusColor(order.orderStatus)}`}>
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !orders.length && <div className="text-center py-12 text-gray-400">No orders found</div>}
        </div>
      </div>
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-orange-500 text-white' : 'card text-gray-600 dark:text-gray-400'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
