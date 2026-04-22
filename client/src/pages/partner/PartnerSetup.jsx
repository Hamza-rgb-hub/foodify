import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Upload } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CUISINES = ['American', 'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'Mediterranean', 'French', 'Greek', 'Other'];

export default function PartnerSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shopName: '', description: '', phone: '', email: '',
    'address.street': '', 'address.city': '', 'address.state': '', 'address.zipCode': '',
    deliveryFee: '', minimumOrder: '', 'deliveryTime.min': '20', 'deliveryTime.max': '45',
  });
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [logo, setLogo] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleCuisine = (c) => setSelectedCuisines(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName) { toast.error('Shop name is required'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      selectedCuisines.forEach(c => formData.append('cuisine', c));
      if (logo) formData.append('logo', logo);

      await api.post('/partners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Restaurant profile created! Pending admin approval.');
      navigate('/partner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create profile');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Set Up Your Restaurant
        </h1>
        <p className="text-gray-500 mt-2">Tell us about your restaurant to start receiving orders</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Restaurant Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Restaurant Name *</label>
            <input value={form.shopName} onChange={set('shopName')} placeholder="The Burger House" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              placeholder="Tell customers what makes your restaurant special..." className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="restaurant@example.com" className="input" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Address</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street</label>
            <input value={form['address.street']} onChange={set('address.street')} placeholder="123 Main Street" className="input" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
              <input value={form['address.city']} onChange={set('address.city')} placeholder="New York" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ZIP</label>
              <input value={form['address.zipCode']} onChange={set('address.zipCode')} placeholder="10001" className="input" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Settings</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Fee ($)</label>
              <input type="number" value={form.deliveryFee} onChange={set('deliveryFee')} step="0.01" min="0" placeholder="2.99" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Min Order ($)</label>
              <input type="number" value={form.minimumOrder} onChange={set('minimumOrder')} step="0.01" min="0" placeholder="10" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Time</label>
              <div className="flex items-center gap-1.5">
                <input type="number" value={form['deliveryTime.min']} onChange={set('deliveryTime.min')} min="5" className="input w-16 text-center px-2" />
                <span className="text-gray-400 text-sm">–</span>
                <input type="number" value={form['deliveryTime.max']} onChange={set('deliveryTime.max')} min="5" className="input w-16 text-center px-2" />
                <span className="text-gray-400 text-xs">min</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cuisine Types</h3>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map(c => (
              <button key={c} type="button" onClick={() => toggleCuisine(c)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  selectedCuisines.includes(c) ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Logo</h3>
          <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-400 cursor-pointer transition-colors">
            {logo ? (
              <div className="flex items-center gap-3">
                <img src={URL.createObjectURL(logo)} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{logo.name}</span>
              </div>
            ) : (
              <>
                <Upload size={18} className="text-gray-400" />
                <span className="text-sm text-gray-500">Upload restaurant logo</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={e => setLogo(e.target.files[0])} className="hidden" />
          </label>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</span> : '🚀 Create Restaurant Profile'}
        </button>
      </form>
    </div>
  );
}
