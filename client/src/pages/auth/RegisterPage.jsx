import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ChefHat, Phone } from 'lucide-react';
import { registerUser, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    dispatch(registerUser(form));
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
            <ChefHat size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>Foodify</span>
        </Link>

        <div className="card p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Join thousands of food lovers</p>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            {[{ value: 'user', label: '🛍️ Customer' }, { value: 'partner', label: '🍳 Restaurant' }].map(r => (
              <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  form.role === r.value ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', type: 'text', placeholder: 'Your full name', icon: User, label: 'Full Name' },
              { key: 'email', type: 'email', placeholder: 'you@example.com', icon: Mail, label: 'Email' },
              { key: 'phone', type: 'tel', placeholder: '+1 (555) 000-0000', icon: Phone, label: 'Phone (optional)' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
                <div className="relative">
                  <field.icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={field.type} value={form[field.key]} onChange={set(field.key)}
                    placeholder={field.placeholder}
                    required={field.key !== 'phone'}
                    className="input pl-10" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters" required className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</span> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
