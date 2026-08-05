'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  FaSearch, FaTrash, FaReply, FaCheckCircle,
  FaDownload, FaEnvelope, FaEnvelopeOpen,
  FaPhone, FaBuilding, FaGlobe, FaPaperPlane, FaSpinner
} from 'react-icons/fa';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  reply: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        if (data.messages.length > 0) {
          setSelectedId(data.messages[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const selected = messages.find(m => m.id === selectedId);

  const filtered = useMemo(() =>
    messages.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())
    ),
    [messages, search]
  );

  const unreadCount = messages.filter(m => !m.read).length;

  const markAsRead = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true }),
    });
  };

  const markReplied = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, replied: true } : m));
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, replied: true }),
    });
  };

  const handleDelete = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedId === id) setSelectedId(filtered[0]?.id || null);
    await fetch('/api/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedId) return;
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedId, reply: replyText }),
    });
    setMessages(prev => prev.map(m => m.id === selectedId ? { ...m, replied: true, reply: replyText } : m));
    setReplyText('');
  };

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `messages-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Subject', 'Message', 'Date'];
      const rows = messages.map(m => [m.name, m.email, m.phone, m.company, m.subject, `"${m.message.replace(/"/g, '""')}"`, m.createdAt]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `messages-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
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
          <h1 className="text-3xl font-bold text-white">Messages</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportData('csv')} className="btn-secondary text-sm">
            <FaDownload /> CSV
          </button>
          <button onClick={() => exportData('json')} className="btn-secondary text-sm">
            <FaDownload /> JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        <div className="lg:col-span-1 glass-card rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-glass-border">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No messages found</div>
            ) : (
              filtered.map((msg) => (
                <motion.button
                  key={msg.id}
                  layout
                  onClick={() => { setSelectedId(msg.id); if (!msg.read) markAsRead(msg.id); }}
                  className={`w-full text-left p-4 border-b border-glass-border hover:bg-glass-hover transition-all ${
                    selectedId === msg.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  } ${!msg.read ? 'bg-primary/[0.02]' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />}
                      <span className={`text-sm font-medium truncate ${!msg.read ? 'text-white' : 'text-gray-400'}`}>
                        {msg.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-600 flex-shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-xs truncate mb-0.5 ${!msg.read ? 'text-gray-300' : 'text-gray-500'}`}>
                    {msg.subject}
                  </p>
                  <p className="text-[10px] text-gray-600 truncate">{msg.message}</p>
                  {msg.replied && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-green-400 mt-1.5">
                      <FaCheckCircle /> Replied
                    </span>
                  )}
                </motion.button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="p-6 border-b border-glass-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{selected.subject}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="font-medium text-white">{selected.name}</span>
                      <span>{selected.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markAsRead(selected.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
                      title="Mark as read"
                    >
                      <FaEnvelopeOpen />
                    </button>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  {selected.phone && (
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <FaPhone className="text-primary/60" /> {selected.phone}
                    </span>
                  )}
                  {selected.company && (
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <FaBuilding className="text-primary/60" /> {selected.company}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <FaGlobe className="text-primary/60" /> {new Date(selected.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl bg-glass border border-glass-border"
                >
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </motion.div>

                {selected.reply && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-primary/5 border border-primary/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaCheckCircle className="text-green-400 text-xs" />
                      <span className="text-xs font-medium text-green-400">Your Reply</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selected.reply}
                    </p>
                  </motion.div>
                )}

                {!selected.reply && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Reply to {selected.name}
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                    placeholder="Write your reply..."
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="btn-primary text-sm"
                    >
                      <FaPaperPlane /> Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FaEnvelope className="text-5xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">{loading ? 'Loading...' : 'No messages yet'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
