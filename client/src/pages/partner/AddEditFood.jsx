import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Upload, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AddEditFood() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', discountedPrice: '',
    category: '', isVeg: false, isVegan: false, isGlutenFree: false,
    spicyLevel: 0, preparationTime: 20, isAvailable: true, isFeatured: false,
    ingredients: '', tags: '',
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data || []));
    if (isEdit) {
      api.get(`/food/${id}`).then(r => {
        const f = r.data.data;
        setForm({
          name: f.name || '', description: f.description || '',
          price: f.price || '', discountedPrice: f.discountedPrice || '',
          category: f.category?._id || '', isVeg: f.isVeg, isVegan: f.isVegan,
          isGlutenFree: f.isGlutenFree, spicyLevel: f.spicyLevel || 0,
          preparationTime: f.preparationTime || 20, isAvailable: f.isAvailable,
          isFeatured: f.isFeatured, ingredients: f.ingredients?.join(', ') || '',
          tags: f.tags?.join(', ') || '',
        });
        setExistingImages(f.images || []);
      });
    }
  }, [id]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggle = k => () => setForm(f => ({ ...f, [k]: !f[k] }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (form.ingredients) formData.set('ingredients', form.ingredients.split(',').map(s => s.trim()).filter(Boolean));
      if (form.tags) formData.set('tags', form.tags.split(',').map(s => s.trim()).filter(Boolean));
      images.forEach(img => formData.append('images', img));

      if (isEdit) {
        await api.put(`/food/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Food item updated!');
      } else {
        await api.post('/food', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Food item added!');
      }
      navigate('/partner/foods');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/partner/foods')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to Foods
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        {isEdit ? 'Edit Food Item' : 'Add New Food Item'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Basic Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Margherita Pizza" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              placeholder="Describe the dish, ingredients, etc." className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price ($) *</label>
              <input type="number" value={form.price} onChange={set('price')} step="0.01" min="0"
                placeholder="12.99" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Discounted Price ($)</label>
              <input type="number" value={form.discountedPrice} onChange={set('discountedPrice')} step="0.01" min="0"
                placeholder="9.99 (optional)" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
              <select value={form.category} onChange={set('category')} className="input" required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prep Time (min)</label>
              <input type="number" value={form.preparationTime} onChange={set('preparationTime')} min="1" className="input" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Images</h3>
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {images.map((img, i) => (
              <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-orange-300">
                <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-400 cursor-pointer transition-colors">
            <Upload size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500">Upload images (max 5)</span>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        {/* Dietary & Properties */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Properties</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {[
              { key: 'isVeg', label: '🌿 Vegetarian' },
              { key: 'isVegan', label: '🌱 Vegan' },
              { key: 'isGlutenFree', label: '🌾 Gluten Free' },
              { key: 'isAvailable', label: '✅ Available' },
              { key: 'isFeatured', label: '⭐ Featured' },
            ].map(opt => (
              <button key={opt.key} type="button" onClick={toggle(opt.key)}
                className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-all ${
                  form[opt.key] ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spicy Level</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(lvl => (
                <button key={lvl} type="button" onClick={() => setForm(f => ({ ...f, spicyLevel: lvl }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.spicyLevel === lvl ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                  {['None', '🌶 Mild', '🌶🌶 Medium', '🌶🌶🌶 Hot'][lvl]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags & Ingredients */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Additional Info</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ingredients (comma-separated)</label>
            <input value={form.ingredients} onChange={set('ingredients')} placeholder="Flour, Tomato, Cheese, Basil" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
            <input value={form.tags} onChange={set('tags')} placeholder="popular, spicy, special" className="input" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/partner/foods')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isEdit ? 'Updating…' : 'Adding…'}</span> : (isEdit ? 'Update Food Item' : 'Add Food Item')}
          </button>
        </div>
      </form>
    </div>
  );
}
