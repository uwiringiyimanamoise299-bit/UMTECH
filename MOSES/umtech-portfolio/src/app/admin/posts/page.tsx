'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  FaPlus, FaEdit, FaTrash, FaTimes, FaImage,
  FaVideo, FaLink, FaGithub, FaCalendarAlt,
  FaHeart, FaShare, FaComment, FaClock, FaSpinner
} from 'react-icons/fa';

interface Post {
  id: string;
  content: string;
  images: string[];
  videoUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
  likes: number;
  shares: number;
  comments: number;
  createdAt: string;
  scheduledAt?: string;
  pinned: boolean;
}

const initialFormState = {
  content: '',
  imageUrls: '',
  videoUrl: '',
  websiteUrl: '',
  githubUrl: '',
  scheduledAt: '',
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts/list');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setForm(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setForm({
      content: post.content,
      imageUrls: post.images.join(', '),
      videoUrl: post.videoUrl || '',
      websiteUrl: post.websiteUrl || '',
      githubUrl: post.githubUrl || '',
      scheduledAt: post.scheduledAt || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const images = form.imageUrls.split(',').map(u => u.trim()).filter(Boolean);
    setSaving(true);
    try {
      if (editingPost) {
        const res = await fetch('/api/posts/manage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPost.id,
            content: form.content,
            images,
            videoUrl: form.videoUrl || undefined,
            websiteUrl: form.websiteUrl || undefined,
            githubUrl: form.githubUrl || undefined,
            scheduledAt: form.scheduledAt || undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(prev => prev.map(p => p.id === editingPost.id ? data.post : p));
        }
      } else {
        const res = await fetch('/api/posts/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: form.content,
            images,
            videoUrl: form.videoUrl || undefined,
            websiteUrl: form.websiteUrl || undefined,
            githubUrl: form.githubUrl || undefined,
            scheduledAt: form.scheduledAt || undefined,
            likes: 0,
            shares: 0,
            comments: 0,
            pinned: false,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(prev => [data.post, ...prev]);
        }
      }
      setShowModal(false);
    } catch {
      console.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/posts/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch {
      console.error('Failed to delete post');
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
          <h1 className="text-3xl font-bold text-white">Manage Posts</h1>
          <p className="text-gray-500 mt-1 text-sm">{posts.length} total posts</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary self-start">
          <FaPlus /> Create Post
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="text-primary text-2xl animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card rounded-xl overflow-hidden group"
            >
              {post.images.length > 0 && (
                <div className={`grid ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5`}>
                  {post.images.slice(0, 3).map((img, j) => (
                    <div key={j} className={`${post.images.length === 3 && j === 0 ? 'row-span-2' : ''} overflow-hidden`}>
                      <img
                        src={img}
                        alt=""
                        className="w-full h-36 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                  {post.images.length > 3 && (
                    <div className="relative flex items-center justify-center bg-glass">
                      <span className="text-white font-bold text-lg">+{post.images.length - 3}</span>
                    </div>
                  )}
                </div>
              )}

              {post.videoUrl && (
                <div className="relative overflow-hidden">
                  <div className="h-36 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <FaVideo className="text-3xl text-primary/50" />
                  </div>
                </div>
              )}

              <div className="p-5">
                {post.scheduledAt && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium mb-3">
                    <FaClock /> Scheduled: {new Date(post.scheduledAt).toLocaleDateString()}
                  </div>
                )}

                <p className="text-sm text-gray-300 leading-relaxed line-clamp-4 mb-4">
                  {post.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.websiteUrl && (
                    <a href={post.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-[10px] border border-primary/10 hover:bg-primary/10 transition-all">
                      <FaLink /> Website
                    </a>
                  )}
                  {post.githubUrl && (
                    <a href={post.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glass text-gray-400 text-[10px] border border-glass-border hover:text-white transition-all">
                      <FaGithub /> GitHub
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5"><FaHeart className="text-red-400" /> {post.likes}</span>
                  <span className="flex items-center gap-1.5"><FaComment className="text-primary/60" /> {post.comments}</span>
                  <span className="flex items-center gap-1.5"><FaShare className="text-secondary/60" /> {post.shares}</span>
                  <span className="ml-auto text-[10px]">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-glass-border opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(post)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-gray-500 hover:text-primary hover:bg-primary/10 transition-all">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}

      <AnimatePresence>
        {showModal && (
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
              className="glass-card rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingPost ? 'Edit Post' : 'Create Post'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-glass-hover transition-all">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                    placeholder="What's on your mind?"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Image URLs (comma separated)</label>
                  <div className="relative">
                    <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={form.imageUrls}
                      onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                      placeholder="https://..., https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Video URL</label>
                    <div className="relative">
                      <FaVideo className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="url"
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Website URL</label>
                    <div className="relative">
                      <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="url"
                        value={form.websiteUrl}
                        onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">GitHub URL</label>
                    <div className="relative">
                      <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="url"
                        value={form.githubUrl}
                        onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Schedule Date/Time</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-glass-border">
                <button onClick={() => setShowModal(false)} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.content || saving}
                  className="btn-primary text-sm"
                >
                  {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : (editingPost ? 'Update Post' : 'Create Post')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
