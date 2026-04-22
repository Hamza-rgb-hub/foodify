import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Package, DollarSign, UtensilsCrossed, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';

export default function PartnerDashboard() {
  const { user } = useSelector(s => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partnerProfile, setPartnerProfile] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/partners/dashboard'),
      api.get('/partners?limit=1').then(r => r.data.data?.[0]),
    ]).then(([dashRes, partner]) => {
      setData(dashRes.data.data);
      setPartnerProfile(partner);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  );

  // Partner not set up
  if (!partnerProfile) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={36} className="text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Set Up Your Restaurant
        </h2>
        <p className="text-gray-500 mb-6">You need to create your restaurant profile before you can start receiving orders.</p>
        <Link to="/partner/setup" className="btn-primary">Set Up Restaurant</Link>
      </div>
    );
  }

  const { stats, recentOrders = [], revenueByDay = [] } = data || {};

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: Package, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Pending', value: stats?.pendingOrders || 0, icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Today\'s Orders', value: stats?.todayOrders || 0, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Menu Items', value: stats?.totalFoods || 0, icon: UtensilsCrossed, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {partnerProfile?.shopName} · {partnerProfile?.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
        </p>
      </div>

      {!partnerProfile?.isApproved && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Your restaurant is pending admin approval. You can add food items while waiting.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Link to="/partner/foods/add" className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <UtensilsCrossed size={15} /> Add Food Item
        </Link>
        <Link to="/partner/orders" className="btn-secondary flex items-center gap-2 text-sm py-2.5">
          <Package size={15} /> Manage Orders
          {stats?.pendingOrders > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {stats.pendingOrders}
            </span>
          )}
        </Link>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/partner/orders" className="text-sm text-orange-500 hover:text-orange-600">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{order.user?.name} · {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-orange-500">{formatPrice(order.pricing?.total)}</p>
                  <span className={`badge text-xs ${getOrderStatusColor(order.orderStatus)}`}>
                    {getOrderStatusLabel(order.orderStatus)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Chart (simple bar) */}
      {revenueByDay.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Revenue (Last 7 Days)</h2>
          <div className="flex items-end gap-2 h-32">
            {revenueByDay.slice(-7).map((day, i) => {
              const max = Math.max(...revenueByDay.map(d => d.revenue), 1);
              const pct = (day.revenue / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      className="bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg min-h-[4px] w-full"
                      style={{ height: `${Math.max(pct, 5)}%` }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatPrice(day.revenue)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{day._id?.slice(-5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
