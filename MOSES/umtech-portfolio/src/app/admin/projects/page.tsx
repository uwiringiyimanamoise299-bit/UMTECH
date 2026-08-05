'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus, FaEdit, FaTrash, FaThumbtack, FaTimes,
  FaImage, FaLink, FaGithub, FaStar, FaSearch, FaSpinner,
  FaExclamationCircle, FaCheckCircle, FaEye, FaCode,
  FaGlobe, FaVideo, FaTag, FaAlignLeft,
} from 'react-icons/fa';

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  status: 'completed' | 'in-progress' | 'coming-soon';
  featured: boolean;
  pinned: boolean;
  coverImage: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  date: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'in-progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'coming-soon': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const statusLabels: Record<string, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  'coming-soon': 'Coming Soon',
};

const initialFormState = {
  title: '',
  description: '',
  longDescription: '',
  coverImage: '',
  technologies: '',
  category: '',
  status: 'completed' as 'completed' | 'in-progress' | 'coming-soon',
  featured: false,
  liveUrl: '',
  githubUrl: '',
  videoUrl: '',
};

type FormTab = 'details' | 'preview';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FormTab>('details');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Reset image error when cover URL changes
  useEffect(() => {
    setImageError(false);
  }, [form.coverImage]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects/list');
      if (!res.ok) {
        setError('Failed to load projects');
        setProjects([]);
        return;
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      setError('Network error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const openAddPanel = () => {
    setEditingProject(null);
    setForm(initialFormState);
    setActiveTab('details');
    setShowPanel(true);
  };

  const openEditPanel = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description || '',
      longDescription: project.longDescription || '',
      coverImage: project.coverImage,
      technologies: project.technologies.join(', '),
      category: project.category,
      status: project.status,
      featured: project.featured,
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      videoUrl: project.videoUrl || '',
    });
    setActiveTab('details');
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setEditingProject(null);
    setForm(initialFormState);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Project title is required');
      return;
    }
    const techs = form.technologies.split(',').map(t => t.trim()).filter(Boolean);
    setSaving(true);
    setError(null);
    try {
      if (editingProject) {
        const res = await fetch('/api/projects/manage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProject.id, ...form, technologies: techs }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Update failed' }));
          setError(err.error || 'Update failed');
          return;
        }
        const data = await res.json();
        setProjects(prev => prev.map(p => p.id === editingProject.id ? data.project : p));
        setSuccess('Project updated successfully!');
      } else {
        const res = await fetch('/api/projects/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            technologies: techs,
            screenshots: [],
            pinned: false,
            likes: 0,
            shares: 0,
            comments: 0,
            date: new Date().toISOString().split('T')[0],
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Create failed' }));
          setError(err.error || 'Failed to create project');
          return;
        }
        const data = await res.json();
        setProjects(prev => [data.project, ...prev]);
        setSuccess('Project created successfully!');
      }
      closePanel();
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch('/api/projects/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Delete failed' }));
        setError(err.error || 'Delete failed');
        return;
      }
      setProjects(prev => prev.filter(p => p.id !== id));
      setSuccess('Project deleted.');
    } catch {
      setError('Network error deleting project');
    }
    setDeleteConfirm(null);
  };

  const togglePin = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    setError(null);
    try {
      const res = await fetch('/api/projects/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pinned: !project.pinned }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Toggle pin failed' }));
        setError(err.error || 'Toggle pin failed');
        return;
      }
      const data = await res.json();
      setProjects(prev => prev.map(p => p.id === id ? data.project : p));
    } catch {
      setError('Network error toggling pin');
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const techList = form.technologies.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-500 mt-1 text-sm">{projects.length} total · {projects.filter(p => p.featured).length} featured</p>
        </div>
        <button onClick={openAddPanel} className="btn-primary self-start flex items-center gap-2">
          <FaPlus /> Post New Project
        </button>
      </div>

      {/* Toast messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <FaExclamationCircle />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
          >
            <FaCheckCircle />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
        />
      </div>

      {/* Projects Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="text-primary text-2xl animate-spin" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  {['Cover', 'Project', 'Category', 'Status', 'Featured', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((project, i) => (
                    <motion.tr
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-glass-border last:border-0 hover:bg-glass-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-glass flex-shrink-0">
                          {project.coverImage ? (
                            <img
                              src={project.coverImage}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <FaImage />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-sm font-medium text-white truncate">{project.title}</p>
                        <p className="text-[10px] text-gray-600 truncate">{project.technologies.slice(0, 4).join(', ')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">{project.category || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${statusColors[project.status || 'completed']}`}>
                          {statusLabels[project.status || 'completed']}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <FaStar className={project.featured ? 'text-amber-400' : 'text-gray-700'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditPanel(project)}
                            title="Edit"
                            className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(project.id)}
                            title="Delete"
                            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => togglePin(project.id)}
                            title={project.pinned ? 'Unpin' : 'Pin'}
                            className={`p-2 rounded-lg transition-all ${project.pinned ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary hover:bg-primary/10'}`}
                          >
                            <FaThumbtack className={project.pinned ? 'rotate-45' : ''} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-glass flex items-center justify-center mx-auto mb-4">
                <FaCode className="text-gray-600 text-2xl" />
              </div>
              <p className="text-gray-500 text-sm">No projects found</p>
              <button onClick={openAddPanel} className="mt-4 text-primary text-sm hover:underline">
                Post your first project →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== FULL-SCREEN POST PROJECT PANEL ===== */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />

            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl flex flex-col"
              style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #13131f 100%)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-glass-border flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingProject ? 'Edit Project' : 'Post New Project'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingProject ? 'Update project details' : 'Add a project to your portfolio'}
                  </p>
                </div>
                <button
                  onClick={closePanel}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-glass-hover transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-6 py-3 border-b border-glass-border flex-shrink-0">
                {([['details', 'Edit Details', FaAlignLeft], ['preview', 'Preview Card', FaEye]] as const).map(([tab, label, Icon]) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as FormTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    <Icon size={11} /> {label}
                  </button>
                ))}
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {activeTab === 'details' ? (
                  <div className="space-y-5">
                    {/* Cover Image Section */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                        <FaImage size={10} /> Cover Image URL <span className="text-gray-600">(paste external link)</span>
                      </label>
                      <input
                        type="url"
                        value={form.coverImage}
                        onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <p className="text-[10px] text-gray-600 mt-1.5">Use a public image URL (https://...) or a path from your /public folder (e.g. /images/project.png).</p>
                      {/* Live preview */}
                      <AnimatePresence>
                        {form.coverImage && !imageError && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 rounded-xl overflow-hidden border border-glass-border"
                          >
                            <img
                              src={form.coverImage}
                              alt="Cover preview"
                              className="w-full h-44 object-cover"
                              onError={() => setImageError(true)}
                            />
                            <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] flex items-center gap-1.5">
                              <FaCheckCircle size={9} /> Image loaded successfully
                            </div>
                          </motion.div>
                        )}
                        {form.coverImage && imageError && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2"
                          >
                            <FaExclamationCircle size={10} /> Could not display this image. Check the URL is correct, public, and ends in an image file (e.g. .jpg/.png). You can still save — it will load once the URL is valid.
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Project Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                        placeholder="My Awesome Project"
                      />
                    </div>

                    {/* Short Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Short Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                        placeholder="Brief one-line description shown on the project card..."
                      />
                    </div>

                    {/* Long Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Full Description
                      </label>
                      <textarea
                        value={form.longDescription}
                        onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                        placeholder="Detailed description shown on the project detail page..."
                      />
                    </div>

                    {/* Technologies */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                        <FaCode size={10} /> Technologies <span className="text-gray-600">(comma separated)</span>
                      </label>
                      <input
                        type="text"
                        value={form.technologies}
                        onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                        placeholder="React, TypeScript, Node.js, Tailwind CSS"
                      />
                      {techList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {techList.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Category & Status in a row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                          <FaTag size={10} /> Category
                        </label>
                        <input
                          type="text"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="Web App, Mobile, API..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Status</label>
                        <select
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value as 'completed' | 'in-progress' | 'coming-soon' })}
                          className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                        >
                          <option value="completed">✅ Completed</option>
                          <option value="in-progress">🔨 In Progress</option>
                          <option value="coming-soon">🔜 Coming Soon</option>
                        </select>
                      </div>
                    </div>

                    {/* Live URL */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                        <FaGlobe size={10} /> Live / Demo URL
                      </label>
                      <div className="relative">
                        <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={11} />
                        <input
                          type="url"
                          value={form.liveUrl}
                          onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="https://myproject.netlify.app"
                        />
                      </div>
                    </div>

                    {/* GitHub URL */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                        <FaGithub size={10} /> GitHub Repository URL
                      </label>
                      <div className="relative">
                        <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={11} />
                        <input
                          type="url"
                          value={form.githubUrl}
                          onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="https://github.com/username/repo"
                        />
                      </div>
                    </div>

                    {/* Video URL */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                        <FaVideo size={10} /> Video URL <span className="text-gray-600">(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>

                    {/* Featured checkbox */}
                    <label className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-glass border border-glass-border cursor-pointer hover:border-primary/30 transition-all group">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <div>
                        <p className="text-sm text-white font-medium">Mark as Featured</p>
                        <p className="text-[10px] text-gray-500">Featured projects appear prominently on the homepage</p>
                      </div>
                      <FaStar className={`ml-auto ${form.featured ? 'text-amber-400' : 'text-gray-600 group-hover:text-gray-400'} transition-colors`} />
                    </label>
                  </div>
                ) : (
                  /* PREVIEW TAB */
                  <div>
                    <p className="text-xs text-gray-500 mb-4">This is how your project card will look:</p>
                    <div className="rounded-2xl overflow-hidden border border-glass-border bg-glass">
                      {/* Card image */}
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                        {form.coverImage && !imageError ? (
                          <img
                            src={form.coverImage}
                            alt={form.title || 'Project'}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                            <FaImage size={32} />
                            <p className="text-xs mt-2">No cover image</p>
                          </div>
                        )}
                        {/* Status badge on image */}
                        <div className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${statusColors[form.status]}`}>
                          {statusLabels[form.status]}
                        </div>
                        {form.featured && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                            <FaStar className="text-amber-400" size={11} />
                          </div>
                        )}
                      </div>
                      {/* Card body */}
                      <div className="p-4">
                        <h3 className="font-bold text-white text-lg">{form.title || 'Project Title'}</h3>
                        {form.category && (
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{form.category}</span>
                        )}
                        {form.description && (
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{form.description}</p>
                        )}
                        {techList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {techList.slice(0, 5).map(t => (
                              <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">
                                {t}
                              </span>
                            ))}
                            {techList.length > 5 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-glass text-gray-500 border border-glass-border">
                                +{techList.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-glass-border">
                          {form.liveUrl && (
                            <span className="flex items-center gap-1.5 text-xs text-primary">
                              <FaGlobe size={10} /> Live Demo
                            </span>
                          )}
                          {form.githubUrl && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-400">
                              <FaGithub size={10} /> Source Code
                            </span>
                          )}
                          {!form.liveUrl && !form.githubUrl && (
                            <span className="text-xs text-gray-600">No links added</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-3 text-center">Switch to &quot;Edit Details&quot; to make changes</p>
                  </div>
                )}
              </div>

              {/* Panel Footer */}
              <div className="px-6 py-4 border-t border-glass-border flex-shrink-0">
                {error && (
                  <p className="text-red-400 text-xs mb-3 flex items-center gap-2">
                    <FaExclamationCircle size={10} /> {error}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <button onClick={closePanel} className="btn-secondary text-sm flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!form.title.trim() || saving}
                    className="btn-primary text-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <><FaSpinner className="animate-spin" /> Saving...</>
                    ) : (
                      <>{editingProject ? 'Update Project' : 'Post Project'}</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card rounded-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-400 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
              <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The project will be permanently removed.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
