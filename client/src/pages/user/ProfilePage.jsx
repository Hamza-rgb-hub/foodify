import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { updateProfile } from '../../store/slices/authSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPwd = k => e => setPwdForm(f => ({ ...f, [k]: e.target.value }));

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(updateProfile(form)).unwrap();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err || 'Failed'); }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPwd(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSavingPwd(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 dark:text-white mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
        My Profile
      </motion.h1>

      {/* Avatar */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 mt-2 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <User size={17} className="text-orange-500" /> Personal Information
        </h3>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.name} onChange={set('name')} className="input pl-10" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={user?.email} disabled className="input pl-10 opacity-50 cursor-not-allowed" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.phone} onChange={set('phone')} className="input pl-10" placeholder="+1 555 000 0000" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Form */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <Lock size={17} className="text-orange-500" /> Change Password
        </h3>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { key: 'newPassword', label: 'New Password', placeholder: 'Min. 6 characters' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} value={pwdForm[field.key]}
                  onChange={setPwd(field.key)} placeholder={field.placeholder}
                  required className="input pl-10 pr-10" />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="showPwd" checked={showPwd} onChange={e => setShowPwd(e.target.checked)}
              className="rounded" />
            <label htmlFor="showPwd" className="text-sm text-gray-600 dark:text-gray-400">Show passwords</label>
          </div>
          <button type="submit" disabled={savingPwd} className="btn-primary flex items-center gap-2">
            {savingPwd ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={15} />}
            {savingPwd ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
