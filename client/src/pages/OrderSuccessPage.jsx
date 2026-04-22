import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import api from '../utils/api';
import { formatPrice, formatDateTime, getOrderStatusLabel } from '../utils/helpers';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.data)).catch(() => {});
  }, [id]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-emerald-500" />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Order Placed! 🎉
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Your order has been received and is being prepared.
        </p>
        {order && (
          <div className="card p-6 text-left mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs text-gray-400">Order Number</p>
                <p className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</p>
              </div>
              <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {getOrderStatusLabel(order.orderStatus)}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{item.name} ×{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
              <span>Total Paid</span>
              <span className="text-orange-500">{formatPrice(order.pricing?.total)}</span>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              <p>Payment: <span className="capitalize font-medium text-gray-600 dark:text-gray-300">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</span></p>
              <p>Ordered: {order.createdAt && formatDateTime(order.createdAt)}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/orders/${id}`} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Package size={16} /> Track Order
          </Link>
          <Link to="/" className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Home size={16} /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
