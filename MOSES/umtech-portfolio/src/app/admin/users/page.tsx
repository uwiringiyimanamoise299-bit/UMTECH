'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers, FaEnvelope, FaCalendarAlt, FaUserTag, FaSearch, FaSpinner,
  FaCheckCircle, FaTrash, FaTimes, FaEdit, FaSave, FaExclamationCircle
} from 'react-icons/fa';

interface UserRecord {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        setError('Failed to load users');
        setUsers([]);
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError('Network error loading users');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: UserRecord) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const handleUpdate = async () => {
    if (!editUser || !editName.trim() || !editEmail.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: editUser.uid, name: editName, email: editEmail }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Update failed' }));
        setError(err.error || 'Update failed');
        return;
      }
      const data = await res.json();
      setUsers(prev => prev.map(u => u.uid === editUser.uid ? data.user : u));
      setEditUser(null);
    } catch (err) {
      setError('Network error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uid: string) => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Delete failed' }));
        setError(err.error || 'Delete failed');
        return;
      }
      setUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (err) {
      setError('Network error deleting user');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Users</h1>
          <p className="text-gray-500 mt-1 text-sm">{users.length} registered users</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <FaExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="relative max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="text-primary text-2xl animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-sm">No users found</div>
      ) : (
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border">
                {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user.uid}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-glass-border last:border-0 hover:bg-glass-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400">{user.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                        user.role === 'admin' || user.role === 'superadmin'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        <FaUserTag className="text-[8px]" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit user"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.uid)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete user"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      )}

      <AnimatePresence>
        {editUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Edit User</h2>
                <button onClick={() => setEditUser(null)} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-glass-hover transition-all">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-glass-border">
                <button onClick={() => setEditUser(null)} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={!editName.trim() || !editEmail.trim() || saving}
                  className="btn-primary text-sm"
                >
                  {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Update User</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-400 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete User</h3>
              <p className="text-gray-500 text-sm mb-6">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleting ? <FaSpinner className="animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
