import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMOJIS = ['🍔', '🍕', '🍱', '🥡', '🍛', '🍝', '🥗', '🍰', '🥤', '🍳', '🌮', '🥪', '🍜', '🍣', '🌯', '🥘', '🍤', '🧆', '🫕', '🍩'];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '🍽️', sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/categories').then(r => setCategories(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openForm = (cat = null) => {
    if (cat) {
      setEditing(cat._id);
      setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '🍽️', sortOrder: cat.sortOrder || 0 });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', icon: '🍽️', sortOrder: 0 });
    }
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing}`, form);
        toast.success('Category updated!');
      } else {
        await api.post('/admin/categories', form);
        toast.success('Category created!');
      }
      setShowForm(false);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const deleteCategory = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(cs => cs.filter(c => c._id !== id));
      toast.success('Category deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Categories</h1>
          <p className="text-sm text-gray-500">{categories.length} categories</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="card p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 dark:text-white">{editing ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Burgers" className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Icon Emoji</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {EMOJIS.map(e => (
                      <button key={e} type="button" onClick={() => setForm(f => ({ ...f, icon: e }))}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === e ? 'bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-500' : 'bg-gray-100 dark:bg-gray-800 hover:bg-orange-50'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Custom emoji" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className="input" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                    {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <AnimatePresence>
            {categories.map((cat, i) => (
              <motion.div key={cat._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card p-4 text-center relative group">
                <p className="text-3xl mb-2">{cat.icon || '🍽️'}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{cat.name}</p>
                <p className="text-xs text-gray-400">#{cat.sortOrder}</p>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openForm(cat)}
                    className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600">
                    <Pencil size={10} />
                  </button>
                  <button onClick={() => deleteCategory(cat._id, cat.name)}
                    className="w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600">
                    <Trash2 size={10} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
