import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Star, Package, Search, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import { formatDate, getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [approving, setApproving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (search) params.set('search', search);
      // /admin/partners — returns ALL partners including unapproved
      const r = await api.get(`/admin/partners?${params}`);
      setPartners(r.data.data || []);
    } catch (e) {
      toast.error('Failed to load partners');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const approve = async (id, isApproved) => {
    setApproving(id);
    try {
      const r = await api.put(`/admin/partners/${id}/approve`, { isApproved });
      setPartners(ps => ps.map(p => p._id === id ? { ...p, isApproved } : p));
      toast.success(r.data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
    setApproving(null);
  };

  const toggleBlock = async (partner) => {
    try {
      await api.put(`/admin/users/${partner.user?._id}/toggle-block`);
      setPartners(ps => ps.map(p => p._id === partner._id ? { ...p, isBlocked: !p.isBlocked } : p));
      toast.success(`Partner ${partner.isBlocked ? 'unblocked' : 'blocked'}`);
    } catch {
      toast.error('Failed');
    }
  };

  const filtered = (() => {
    if (filter === 'pending')  return partners.filter(p => !p.isApproved && !p.isBlocked);
    if (filter === 'approved') return partners.filter(p => p.isApproved);
    if (filter === 'blocked')  return partners.filter(p => p.isBlocked);
    return partners;
  })();

  const pendingCount  = partners.filter(p => !p.isApproved && !p.isBlocked).length;
  const approvedCount = partners.filter(p => p.isApproved).length;
  const blockedCount  = partners.filter(p => p.isBlocked).length;

  const tabs = [
    { value: 'all',      label: `All (${partners.length})` },
    { value: 'pending',  label: `⏳ Pending (${pendingCount})` },
    { value: 'approved', label: `✅ Approved (${approvedCount})` },
    { value: 'blocked',  label: `🚫 Blocked (${blockedCount})` },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Partners
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              ⚠️ {pendingCount} partner{pendingCount > 1 ? 's' : ''} waiting for approval
            </p>
          )}
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 self-start text-sm py-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search restaurants..." className="input pl-10" />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.value
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : filtered.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((partner, i) => (
            <motion.div key={partner._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`card p-5 ${!partner.isApproved && !partner.isBlocked ? 'ring-2 ring-amber-400' : ''}`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50 dark:bg-orange-900/20">
                  {partner.logo
                    ? <img src={getImageUrl(partner.logo)} alt="" className="w-full h-full object-cover"
                        onError={e => { e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🏪</div>'; }} />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{partner.shopName}</h3>
                  <p className="text-xs text-gray-400 truncate">{partner.user?.email}</p>
                  <p className="text-xs text-gray-400">{partner.user?.name}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className={`badge text-xs ${
                      partner.isBlocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : partner.isApproved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {partner.isBlocked ? '🚫 Blocked' : partner.isApproved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                    <span className={`badge text-xs ${partner.isOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {partner.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Star size={11} />{partner.rating?.average > 0 ? partner.rating.average.toFixed(1) : 'New'}</span>
                <span className="flex items-center gap-1"><Package size={11} />{partner.totalOrders || 0} orders</span>
                <span>Joined {formatDate(partner.createdAt)}</span>
              </div>

              {partner.cuisine?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {partner.cuisine.slice(0, 3).map(c => (
                    <span key={c} className="badge bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs">{c}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {!partner.isBlocked && (
                  !partner.isApproved ? (
                    <button onClick={() => approve(partner._id, true)} disabled={approving === partner._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 transition-all">
                      {approving === partner._id ? <span className="w-3 h-3 border border-current rounded-full animate-spin" /> : <CheckCircle size={14} />}
                      Approve
                    </button>
                  ) : (
                    <button onClick={() => approve(partner._id, false)} disabled={approving === partner._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 transition-all">
                      {approving === partner._id ? <span className="w-3 h-3 border border-current rounded-full animate-spin" /> : <XCircle size={14} />}
                      Revoke
                    </button>
                  )
                )}
                <button onClick={() => toggleBlock(partner)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    partner.isBlocked
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100'
                  }`}>
                  {partner.isBlocked ? '✓ Unblock' : '🚫 Block'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏪</p>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No partners found</h3>
          <p className="text-sm text-gray-400">
            {filter === 'pending' ? 'No partner requests awaiting approval'
             : filter === 'blocked' ? 'No blocked partners'
             : 'No partners have registered yet'}
          </p>
        </div>
      )}
    </div>
  );
}