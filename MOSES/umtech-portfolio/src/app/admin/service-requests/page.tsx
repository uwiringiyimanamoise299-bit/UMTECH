'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FaSearch, FaTrash, FaCheckCircle, FaSpinner,
  FaClock, FaClipboardCheck, FaPaperPlane, FaDollarSign,
  FaPhone, FaEnvelope, FaExclamationTriangle,
} from 'react-icons/fa';

interface ServiceRequest {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  serviceTitle: string;
  description: string;
  amount: number;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  adminResponse: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pending' },
  reviewing: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Reviewing' },
  accepted: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Accepted' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Rejected' },
};

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/service-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
        return data.requests;
      }
    } catch (err) {
      console.error('Failed to fetch service requests:', err);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const selected = requests.find(r => r.id === selectedId);

  const filtered = useMemo(() => {
    return requests.filter(r => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.serviceTitle.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || r.status === filter;
      return matchSearch && matchFilter;
    });
  }, [requests, search, filter]);

  const unreadCount = requests.filter(r => !r.read).length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const markAsRead = async (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, read: true } : r));
    await fetch('/api/service-requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true }),
    });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const prev = requests.find(r => r.id === id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as ServiceRequest['status'] } : r));
    setStatusUpdating(id);
    setApiError(null);
    try {
      const res = await fetch('/api/service-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err) {
      if (prev) {
        setRequests(p => p.map(r => r.id === id ? prev : r));
      }
      setApiError('Failed to update status. Please try again.');
      setTimeout(() => setApiError(null), 3000);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleRespond = async () => {
    if (!responseText.trim() || !selectedId) return;
    setResponding(true);
    setApiError(null);
    const prevSelected = requests.find(r => r.id === selectedId);
    try {
      const res = await fetch('/api/service-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId, adminResponse: responseText.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send response');
      }
      const data = await res.json();
      setRequests(prev => prev.map(r => r.id === selectedId ? { ...r, ...data.request } : r));
      setResponseText('');
    } catch (err) {
      if (prevSelected) {
        setRequests(p => p.map(r => r.id === selectedId ? prevSelected : r));
      }
      setApiError('Failed to send response. Please try again.');
      setTimeout(() => setApiError(null), 3000);
    } finally {
      setResponding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = [...requests];
    setRequests(prev => prev.filter(r => r.id !== id));
    if (selectedId === id) setSelectedId(null);
    try {
      const res = await fetch('/api/service-requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
    } catch {
      setRequests(prev);
      setApiError('Failed to delete request.');
      setTimeout(() => setApiError(null), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Service Requests</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {pendingCount} pending, {unreadCount} unread
          </p>
        </div>
      </div>

      {apiError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
          <FaExclamationTriangle /> {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        <div className="lg:col-span-1 glass-card rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-glass-border space-y-3">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'pending', 'reviewing', 'accepted', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-glass border border-glass-border text-gray-500 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No requests found</div>
            ) : (
              filtered.map((req) => {
                const st = statusConfig[req.status] || statusConfig.pending;
                return (
                  <button
                    key={req.id}
                    onClick={() => { setSelectedId(req.id); if (!req.read) markAsRead(req.id); }}
                    className={`w-full text-left p-4 border-b border-glass-border hover:bg-glass-hover transition-all ${
                      selectedId === req.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    } ${!req.read ? 'bg-primary/[0.02]' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {!req.read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />}
                        <span className={`text-sm font-medium truncate ${!req.read ? 'text-white' : 'text-gray-400'}`}>
                          {req.name}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${st.bg} ${st.text} flex-shrink-0`}>
                        {st.label}
                      </span>
                    </div>
                    <p className={`text-xs truncate mb-0.5 ${!req.read ? 'text-gray-300' : 'text-gray-500'}`}>
                      {req.serviceTitle}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-primary font-medium">
                        ${req.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="p-6 border-b border-glass-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{selected.serviceTitle}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="font-medium text-white">{selected.name}</span>
                      <span className="flex items-center gap-1">
                        <FaEnvelope className="text-xs" /> {selected.email}
                      </span>
                      {selected.phone && (
                        <span className="flex items-center gap-1">
                          <FaPhone className="text-xs" /> {selected.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-xs">
                    <FaDollarSign className="text-primary" />
                    <span className="text-white font-medium">${selected.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-xs">
                    <FaClock className="text-gray-500" />
                    <span className="text-gray-400">{new Date(selected.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="p-5 rounded-xl bg-glass border border-glass-border">
                  <p className="text-xs text-gray-500 mb-2">Project Description:</p>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selected.description}
                  </p>
                </div>

                {selected.adminResponse && (
                  <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCheckCircle className="text-green-400 text-xs" />
                      <span className="text-xs font-medium text-green-400">Your Response</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selected.adminResponse}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-glass border border-glass-border">
                  <p className="text-xs text-gray-500 mb-3">Change Status:</p>
                  <div className="flex flex-wrap gap-2">
                    {(['pending', 'reviewing', 'accepted', 'rejected'] as const).map((s) => {
                      const cfg = statusConfig[s];
                      const isUpdating = statusUpdating === selected.id;
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatus(selected.id, s)}
                          disabled={isUpdating}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 ${
                            selected.status === s
                              ? `${cfg.bg} ${cfg.text} border border-current/20`
                              : 'bg-glass border border-glass-border text-gray-500 hover:text-white'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-glass border border-glass-border">
                  <label className="block text-sm font-medium text-white mb-3">
                    {selected.adminResponse ? 'Update Response' : 'Send Response'} to {selected.name}
                  </label>
                  {selected.adminResponse && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-3">
                      <p className="text-[10px] text-gray-500 mb-1">Current response:</p>
                      <p className="text-xs text-gray-400">{selected.adminResponse}</p>
                    </div>
                  )}
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                    placeholder={selected.adminResponse ? 'Type an updated response...' : 'Write your response about the service request...'}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleRespond}
                      disabled={!responseText.trim() || responding}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      {responding ? (
                        <><FaSpinner className="animate-spin" /> Sending...</>
                      ) : (
                        <><FaPaperPlane /> {selected.adminResponse ? 'Update Response' : 'Send Response'}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FaClipboardCheck className="text-5xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">{loading ? 'Loading...' : 'Select a request to view details'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
