import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Store, Package, DollarSign, TrendingUp, Clock } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  );

  const { stats, recentOrders = [], revenueData = [] } = data || {};

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', link: '/admin/users' },
    { label: 'Total Partners', value: stats?.totalPartners || 0, icon: Store, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20', link: '/admin/partners' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: Package, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20', link: '/admin/orders' },
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', link: '/admin/orders' },
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: TrendingUp, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20', link: '/admin/orders' },
    { label: 'Pending Approvals', value: stats?.pendingPartners || 0, icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', link: '/admin/partners' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={card.link} className="card p-5 block hover:shadow-lg transition-shadow group">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                <card.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Revenue Trend (Last 30 Days)</h2>
          <div className="flex items-end gap-1 h-40">
            {revenueData.slice(-30).map((day, i) => {
              const max = Math.max(...revenueData.map(d => d.revenue), 1);
              const pct = (day.revenue / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatPrice(day.revenue)}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(pct, 3)}%` }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-gradient-to-t from-orange-500 to-orange-300 rounded-t w-full min-h-[3px]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600">View all</Link>
        </div>
        {recentOrders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 text-left font-medium">Order</th>
                  <th className="pb-3 text-left font-medium">Customer</th>
                  <th className="pb-3 text-left font-medium hidden sm:table-cell">Restaurant</th>
                  <th className="pb-3 text-left font-medium">Total</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {recentOrders.map(order => (
                  <tr key={order._id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">#{order.orderNumber}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{order.user?.name}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{order.partner?.shopName}</td>
                    <td className="py-3 font-semibold text-orange-500">{formatPrice(order.pricing?.total)}</td>
                    <td className="py-3"><span className={`badge text-xs ${getOrderStatusColor(order.orderStatus)}`}>{getOrderStatusLabel(order.orderStatus)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-sm">No recent orders</p>}
      </div>
    </div>
  );
}
