'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  FaUser, FaSignOutAlt, FaEnvelope, FaClipboardList, FaArrowLeft,
  FaCheckCircle, FaSpinner, FaRegPaperPlane, FaClock, FaBell,
  FaDollarSign, FaClipboardCheck,
} from 'react-icons/fa';
import Link from 'next/link';

interface UserMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  reply?: string;
  replied: boolean;
  createdAt: string;
}

interface ServiceRequestItem {
  id: string;
  serviceTitle: string;
  serviceType: string;
  description: string;
  amount: number;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  adminResponse: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: FaClock },
  reviewing: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: FaSpinner },
  accepted: { bg: 'bg-green-500/10', text: 'text-green-400', icon: FaCheckCircle },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', icon: FaClipboardCheck },
};

export default function UserDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestItem[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<UserMessage | null>(null);
  const [selectedReq, setSelectedReq] = useState<ServiceRequestItem | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [newReplyId, setNewReplyId] = useState<string | null>(null);
  const [newRequestReplyId, setNewRequestReplyId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const seenReplyIds = useRef<Set<string> | null>(null);
  const seenRequestReplyIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyMessages();
      fetchMyRequests();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchMyMessages();
      fetchMyRequests();
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (selectedReq && serviceRequests.length > 0) {
      const updated = serviceRequests.find(r => r.id === selectedReq.id);
      if (updated && (updated.adminResponse !== selectedReq.adminResponse || updated.status !== selectedReq.status)) {
        setSelectedReq(updated);
      }
    }
  }, [serviceRequests]);

  const fetchMyMessages = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/messages?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        const sorted = (data.messages || []).sort(
          (a: UserMessage, b: UserMessage) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const replied = sorted.filter((m: UserMessage) => m.replied && m.reply) as UserMessage[];
        if (seenReplyIds.current === null) {
          seenReplyIds.current = new Set(replied.map(m => m.id));
        } else {
          const newReplies = replied.filter(m => !seenReplyIds.current!.has(m.id));
          if (newReplies.length > 0) {
            const newest = newReplies[0];
            setNotification(`Admin replied to "${newest.subject}"`);
            setNewReplyId(newest.id);
            setSelectedMsg(newest);
            setTimeout(() => setNotification(null), 5000);
          }
          newReplies.forEach(m => seenReplyIds.current!.add(m.id));
        }
        setMessages(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('/api/service-requests');
      if (res.ok) {
        const data = await res.json();
        const sorted = (data.requests || []).sort(
          (a: ServiceRequestItem, b: ServiceRequestItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const responded = sorted.filter((r: ServiceRequestItem) => r.adminResponse) as ServiceRequestItem[];
        if (seenRequestReplyIds.current === null) {
          seenRequestReplyIds.current = new Set(responded.map(r => r.id));
        } else {
          const newResponses = responded.filter(r => !seenRequestReplyIds.current!.has(r.id));
          if (newResponses.length > 0) {
            const newest = newResponses[0];
            setNotification(`Admin responded to "${newest.serviceTitle}"`);
            setNewRequestReplyId(newest.id);
            setTimeout(() => setNotification(null), 5000);
          }
          newResponses.forEach(r => seenRequestReplyIds.current!.add(r.id));
        }
        setServiceRequests(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch service requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm"
          >
            <FaArrowLeft /> Back to home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <FaSignOutAlt /> Logout
          </button>
        </motion.div>

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 animate-pulse"
          >
            <FaBell className="text-primary" />
            <p className="text-sm text-primary font-medium">{notification}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-500 hover:text-white"
            >
              &times;
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
                {user.name?.charAt(0) || 'U'}
              </div>
              <h1 className="text-xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-gray-500 text-xs">{user.email}</p>
              <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                Member
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-xl p-4"
            >
              <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/#contact" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-glass-hover transition-all">
                  <FaEnvelope className="text-primary text-xs" /> Contact Us
                </Link>
                <Link href="/#services" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-glass-hover transition-all">
                  <FaClipboardList className="text-secondary text-xs" /> Our Services
                </Link>
                <Link href="/#projects" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-glass-hover transition-all">
                  <FaUser className="text-accent text-xs" /> Our Work
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Activity</h3>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab('messages'); setSelectedMsg(null); setSelectedReq(null); }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === 'messages'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray-400 hover:text-white hover:bg-glass-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-xs" />
                    <span>Messages</span>
                  </div>
                  <span className="text-xs text-gray-600">{messages.length}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('requests'); setSelectedMsg(null); setSelectedReq(null); }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === 'requests'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray-400 hover:text-white hover:bg-glass-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaClipboardCheck className="text-xs" />
                    <span>Service Requests</span>
                  </div>
                  <span className="text-xs text-gray-600">{serviceRequests.length}</span>
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-glass-border">
                {activeTab === 'messages' ? (
                  messagesLoading ? (
                    <FaSpinner className="animate-spin text-primary mx-auto my-4" />
                  ) : messages.length === 0 ? (
                    <p className="text-xs text-gray-600 text-center py-3">No messages yet</p>
                  ) : (
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {messages.slice(0, 8).map(msg => (
                        <button
                          key={msg.id}
                          onClick={() => setSelectedMsg(msg)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                            selectedMsg?.id === msg.id
                              ? 'bg-primary/10 text-primary'
                              : msg.replied && msg.reply && newReplyId === msg.id
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'text-gray-400 hover:text-white hover:bg-glass-hover'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate font-medium">{msg.subject}</span>
                            {msg.replied && msg.reply && <FaCheckCircle className="text-green-400 flex-shrink-0 ml-1" />}
                          </div>
                          <span className="text-[10px] text-gray-600">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  requestsLoading ? (
                    <FaSpinner className="animate-spin text-primary mx-auto my-4" />
                  ) : serviceRequests.length === 0 ? (
                    <p className="text-xs text-gray-600 text-center py-3">No requests yet</p>
                  ) : (
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {serviceRequests.slice(0, 8).map(req => {
                        const st = statusColors[req.status] || statusColors.pending;
                        return (
                          <button
                            key={req.id}
                            onClick={() => setSelectedReq(req)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                              selectedReq?.id === req.id
                                ? 'bg-primary/10 text-primary'
                                : req.adminResponse && newRequestReplyId === req.id
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-glass-hover'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate font-medium">{req.serviceTitle}</span>
                              <div className="flex items-center gap-1">
                                {req.adminResponse && newRequestReplyId === req.id && <FaCheckCircle className="text-green-400 flex-shrink-0" />}
                                <span className={`${st.text} text-[10px]`}>{req.status}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-600">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            {activeTab === 'messages' ? (
              selectedMsg ? (
                <motion.div
                  key={selectedMsg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">{selectedMsg.subject}</h2>
                    <span className="text-xs text-gray-600">
                      {new Date(selectedMsg.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-glass border border-glass-border mb-4">
                    <p className="text-xs text-gray-500 mb-1.5">Your Message:</p>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedMsg.message}
                    </p>
                  </div>

                  {selectedMsg.reply && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FaRegPaperPlane className="text-primary text-xs" />
                        <p className="text-xs font-medium text-primary">Admin Response:</p>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {selectedMsg.reply}
                      </p>
                    </div>
                  )}

                  {!selectedMsg.reply && (
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-3">
                      <FaClock className="text-accent text-sm flex-shrink-0" />
                      <p className="text-xs text-gray-500">Waiting for admin response</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <MessagesOverview
                  messages={messages}
                  messagesLoading={messagesLoading}
                  onSelectMsg={setSelectedMsg}
                  unreadReplies={messages.filter(m => m.replied && m.reply).length}
                />
              )
            ) : (
              selectedReq ? (
                <ServiceRequestDetail request={selectedReq} />
              ) : (
                <RequestsOverview
                  requests={serviceRequests}
                  requestsLoading={requestsLoading}
                  onSelectReq={setSelectedReq}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessagesOverview({
  messages,
  messagesLoading,
  onSelectMsg,
  unreadReplies,
}: {
  messages: UserMessage[];
  messagesLoading: boolean;
  onSelectMsg: (m: UserMessage) => void;
  unreadReplies: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">My Messages</h2>
        {unreadReplies > 0 && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <FaCheckCircle /> {unreadReplies} response{unreadReplies > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {messagesLoading ? (
        <div className="py-12">
          <FaSpinner className="text-primary text-2xl animate-spin mx-auto" />
        </div>
      ) : messages.length === 0 ? (
        <div className="py-12 text-center">
          <FaEnvelope className="text-5xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm mb-2">No messages yet</p>
              <p className="text-gray-600 text-xs">
                    Send us a message from the{' '}
                    <Link href="/#contact" className="text-primary hover:underline">contact form</Link>
                    , and we will respond here.
                  </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.slice(0, 5).map(msg => (
            <button
              key={msg.id}
              onClick={() => onSelectMsg(msg)}
              className="w-full text-left p-4 rounded-xl bg-glass border border-glass-border hover:bg-glass-hover transition-all"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-medium text-white">{msg.subject}</h3>
                {msg.replied && msg.reply && (
                  <FaCheckCircle className="text-green-400 flex-shrink-0 ml-2" />
                )}
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{msg.message}</p>
              <span className="text-[10px] text-gray-600 mt-1 block">
                {new Date(msg.createdAt).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-glass-border">
          <p className="text-gray-500 text-xs">
            Need help?{' '}
            <Link href="/#contact" className="text-primary hover:underline">Send a new message</Link>
          </p>
      </div>
    </motion.div>
  );
}

function RequestsOverview({
  requests,
  requestsLoading,
  onSelectReq,
}: {
  requests: ServiceRequestItem[];
  requestsLoading: boolean;
  onSelectReq: (r: ServiceRequestItem) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">My Service Requests</h2>
        <span className="text-xs text-gray-500">{requests.length} total</span>
      </div>

      {requestsLoading ? (
        <div className="py-12">
          <FaSpinner className="text-primary text-2xl animate-spin mx-auto" />
        </div>
      ) : requests.length === 0 ? (
        <div className="py-12 text-center">
          <FaClipboardCheck className="text-5xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm mb-2">No service requests yet</p>
          <p className="text-gray-600 text-xs">
            Browse our{' '}
            <Link href="/#services" className="text-primary hover:underline">services</Link>
            {' '}and submit a request to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const st = statusColors[req.status] || statusColors.pending;
            return (
              <button
                key={req.id}
                onClick={() => onSelectReq(req)}
                className="w-full text-left p-4 rounded-xl bg-glass border border-glass-border hover:bg-glass-hover transition-all"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-medium text-white">{req.serviceTitle}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${st.bg} ${st.text}`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-1">{req.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-medium">
                    <FaDollarSign className="inline" />{req.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function ServiceRequestDetail({ request }: { request: ServiceRequestItem }) {
  const st = statusColors[request.status] || statusColors.pending;
  const StatusIcon = st.icon;

  return (
    <motion.div
      key={request.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">{request.serviceTitle}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text} flex items-center gap-1`}>
          <StatusIcon className={request.status === 'reviewing' ? 'animate-spin' : ''} />
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-glass border border-glass-border">
          <p className="text-[10px] text-gray-500 mb-1">Budget</p>
          <p className="text-sm font-bold text-primary">${request.amount.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-glass border border-glass-border">
          <p className="text-[10px] text-gray-500 mb-1">Submitted</p>
          <p className="text-sm font-medium text-white">{new Date(request.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-glass border border-glass-border mb-4">
        <p className="text-xs text-gray-500 mb-1.5">Your Description:</p>
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
          {request.description}
        </p>
      </div>

      {request.adminResponse && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <FaRegPaperPlane className="text-primary text-xs" />
            <p className="text-xs font-medium text-primary">Admin Response:</p>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {request.adminResponse}
          </p>
          <p className="text-[10px] text-gray-600 mt-2">
            Updated {new Date(request.updatedAt).toLocaleString()}
          </p>
        </div>
      )}

      {!request.adminResponse && (
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-3">
          <FaClock className="text-accent text-sm flex-shrink-0" />
          <p className="text-xs text-gray-500">
            {request.status === 'pending'
              ? 'Waiting for admin to review your request'
              : 'Admin is reviewing your request'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
