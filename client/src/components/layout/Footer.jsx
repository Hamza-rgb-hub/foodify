import { Link } from 'react-router-dom';
import { ChefHat, Globe, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center">
                <ChefHat size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>Foodify</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Delivering happiness to your doorstep. Fresh food, fast delivery.
            </p>
            <div className="flex gap-3 mt-4">
              {[Globe, Mail, Phone].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-500 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Explore', links: [{ to: '/food', label: 'Browse Menu' }, { to: '/shops', label: 'Restaurants' }] },
            { title: 'Account', links: [{ to: '/profile', label: 'My Profile' }, { to: '/orders', label: 'Order History' }, { to: '/register', label: 'Sign Up' }] },
            { title: 'Business', links: [{ to: '/register', label: 'Become a Partner' }, { to: '/partner/dashboard', label: 'Partner Dashboard' }] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.to}><Link to={l.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 mt-10 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Foodify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
