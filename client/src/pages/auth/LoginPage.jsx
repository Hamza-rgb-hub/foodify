import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ChefHat, Sun, Moon } from 'lucide-react';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const { mode } = useSelector((s) => s.theme);
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@foodie.com', password: 'admin123' },
      partner: { email: 'partner@foodie.com', password: 'partner123' },
      user: { email: 'user@foodie.com', password: 'user123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <button onClick={() => dispatch(toggleTheme())}
        className="fixed top-4 right-4 p-2.5 card shadow-md text-gray-500 hover:text-orange-500 transition-colors">
        {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
            <ChefHat size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>Foodify</span>
        </Link>

        <div className="card p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to your account</p>

          {/* Demo shortcuts */}
          {/* <div className="mb-6">
            <p className="text-xs text-gray-400 mb-2">Quick demo login:</p>
            <div className="flex gap-2">
              {['user', 'partner', 'admin'].map(r => (
                <button key={r} onClick={() => fillDemo(r)}
                  className="flex-1 text-xs py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/10 text-gray-600 dark:text-gray-400 capitalize transition-all">
                  {r}
                </button>
              ))}
            </div>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="you@example.com" required className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••" required className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</span> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
