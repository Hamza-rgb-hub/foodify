import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, ShieldOff } from 'lucide-react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [toggling, setToggling] = useState(null);

  const load = () => {
    const p = new URLSearchParams({ limit: 50 });
    if (search) p.set('search', search);
    if (role) p.set('role', role);
    api.get(`/admin/users?${p}`).then(r => setUsers(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [search, role]);

  const toggleBlock = async (user) => {
    setToggling(user._id);
    try {
      const r = await api.put(`/admin/users/${user._id}/toggle-block`);
      setUsers(us => us.map(u => u._id === user._id ? r.data.data : u));
      toast.success(r.data.message);
    } catch { toast.error('Failed'); }
    setToggling(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Users</h1>
          <p className="text-sm text-gray-500">{users.length} users found</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input pl-10" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)} className="input w-auto">
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="partner">Partners</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-10 rounded-xl" /></td></tr>
                ))
              ) : users.map((user, i) => (
                <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`badge text-xs capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      user.role === 'partner' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${user.isBlocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== 'admin' && (
                      <button onClick={() => toggleBlock(user)} disabled={toggling === user._id}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all ml-auto ${
                          user.isBlocked
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100'
                        }`}>
                        {toggling === user._id ? <span className="w-3 h-3 border border-current rounded-full animate-spin" /> :
                          user.isBlocked ? <><Shield size={12} /> Unblock</> : <><ShieldOff size={12} /> Block</>}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!loading && !users.length && (
            <div className="text-center py-12 text-gray-400">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}
