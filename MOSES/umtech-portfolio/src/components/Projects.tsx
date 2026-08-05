'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiShare2, FiLink, FiMessageCircle, FiExternalLink,
  FiGithub, FiChevronDown, FiStar, FiSend, FiUser, FiTwitter,
  FiFacebook, FiLinkedin, FiMail, FiPlay, FiImage, FiSearch,
} from 'react-icons/fi';
import { formatDate, copyToClipboard } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  technologies: string[];
  category: string;
  status: 'completed' | 'in-progress' | 'coming-soon';
  featured: boolean;
  pinned: boolean;
  likes: number;
  shares: number;
  comments: number;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  date: string;
}

interface ProjectComment {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 4;

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'in-progress': { label: 'In Progress', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  'coming-soon': { label: 'Coming Soon', className: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
};

function CommentSection({ projectId, commentCount }: { projectId: string; commentCount: number }) {
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/comment`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch { /* ignore */ }
  }, [projectId]);

  const handleToggle = () => {
    setShowComments((prev) => {
      if (!prev && !loaded) {
        setLoaded(true);
        loadComments();
      }
      return !prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, content }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setName('');
        setEmail('');
        setContent('');
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  return (
    <div className="border-t border-glass-border pt-3">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground/70 transition-colors"
      >
        <FiMessageCircle className="w-4 h-4" />
        <span>{commentCount} comments</span>
      </button>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center shrink-0">
                    <FiUser className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                      <span className="text-[10px] text-foreground/40">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground/70 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-glass border border-glass-border text-white text-xs placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-glass border border-glass-border text-white text-xs placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-glass border border-glass-border text-white text-xs placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShareMenu({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const url = `https://umtech.dev/projects/${projectId}`;
  const text = 'Check out this project from UMTECH!';

  const shareLinks = [
    { icon: FiTwitter, label: 'Twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, color: 'hover:text-sky-400' },
    { icon: FiFacebook, label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: 'hover:text-blue-600' },
    { icon: FiLinkedin, label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, color: 'hover:text-blue-500' },
    { icon: FiMail, label: 'Email', href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`, color: 'hover:text-amber-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      className="absolute bottom-full left-0 mb-2 z-20"
    >
      <div className="glass-card rounded-xl p-2 flex gap-1 shadow-xl border border-glass-border">
        {shareLinks.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={`p-2.5 rounded-lg text-foreground/50 ${s.color} transition-all hover:bg-glass-hover`}
            title={s.label}
          >
            <s.icon className="w-4 h-4" />
          </a>
        ))}
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(project.likes);
  const [localShares, setLocalShares] = useState(project.shares);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleLike = useCallback(async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLocalLikes((l) => l + (newLiked ? 1 : -1));
    try {
      const res = await fetch(`/api/projects/${project.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: newLiked }),
      });
      const data = await res.json();
      setLocalLikes(data.count);
    } catch { /* ignore */ }
  }, [liked, project.id]);

  const handleShare = useCallback(() => {
    setShowShare(false);
    setLocalShares((s) => s + 1);
    fetch(`/api/projects/${project.id}/share`, { method: 'POST' }).catch(() => {});
  }, [project.id]);

  const handleCopyLink = useCallback(async () => {
    await copyToClipboard(`https://umtech.dev/projects/${project.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [project.id]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl overflow-hidden group w-full flex flex-col"
    >
      <div className="relative aspect-[16/9] overflow-hidden shrink-0">
        {project.coverImage ? (
          <motion.img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <FiImage className="w-12 h-12 text-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {project.pinned && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-3 right-3 z-10"
          >
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/25 text-amber-300 border border-amber-400/30 backdrop-blur-md">
              <FiStar className="w-3 h-3 fill-amber-400" />
              Pinned
            </span>
          </motion.div>
        )}

        <div className="absolute top-3 left-3 z-10">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${statusConfig[project.status || 'completed']?.className || ''}`}>
            {statusConfig[project.status || 'completed']?.label || 'Completed'}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">{project.category}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">{formatDate(project.date)}</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-foreground leading-tight">{project.title}</h3>
        <p className="text-sm text-foreground/60 leading-relaxed line-clamp-3 flex-1">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-glass-border">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? 'text-rose-500' : 'text-foreground/50 hover:text-rose-400'
              }`}
            >
              <motion.div
                animate={liked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <FiHeart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
              </motion.div>
              <span>{localLikes}</span>
            </motion.button>

            <div className="relative">
              <button
                onClick={() => setShowShare(!showShare)}
                className="flex items-center gap-1.5 text-sm text-foreground/50 hover:text-sky-400 transition-colors"
              >
                <FiShare2 className="w-4 h-4" />
                <span>{localShares}</span>
              </button>
              <AnimatePresence>
                {showShare && <ShareMenu projectId={project.id} onClose={() => setShowShare(false)} />}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyLink}
              className="relative flex items-center gap-1.5 text-sm text-foreground/50 hover:text-emerald-400 transition-colors"
            >
              <FiLink className="w-4 h-4" />
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500 text-white whitespace-nowrap"
                >
                  Copied!
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        <CommentSection projectId={project.id} commentCount={project.comments} />

        <div className="flex items-center gap-3 pt-1">
          {project.videoUrl && (
            <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-2 px-4">
              <FiPlay className="w-3.5 h-3.5" />
              <span>Watch Video</span>
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-2 px-4">
              <FiExternalLink className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2 px-4">
              <FiGithub className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(ITEMS_PER_PAGE);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects/list');
        const data = await res.json();
        setProjects(data.projects || []);
        setLoading(false);
      } catch {
        setProjects([]);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category))).filter(Boolean)];

  const filtered = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const hasMore = visible < sorted.length;

  const handleLoadMore = useCallback(() => {
    setLoadMoreLoading(true);
    setTimeout(() => {
      setVisible((prev) => Math.min(prev + ITEMS_PER_PAGE, sorted.length));
      setLoadMoreLoading(false);
    }, 800);
  }, [sorted.length]);

  const displayed = sorted.slice(0, visible);

  if (loading) {
    return (
      <section id="projects" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title gradient-text inline-block">Featured Projects</h2>
            <p className="section-subtitle">
              Showcasing our finest work — from e-commerce platforms to AI-powered applications.
            </p>
          </div>
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section id="projects" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title gradient-text inline-block">Featured Projects</h2>
            <p className="section-subtitle">
              Showcasing our finest work — from e-commerce platforms to AI-powered applications.
            </p>
          </div>
          <div className="text-center py-12 text-foreground/50">
            No projects yet. Check back soon!
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title gradient-text inline-block">Featured Projects</h2>
          <p className="section-subtitle">
            Showcasing our finest work — from e-commerce platforms to AI-powered applications.
          </p>
        </motion.div>

        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setVisible(ITEMS_PER_PAGE); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-glass border border-glass-border text-gray-400 hover:text-white hover:border-primary/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisible(ITEMS_PER_PAGE); }}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-glass border border-glass-border text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <AnimatePresence mode="popLayout">
            {displayed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {displayed.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-gray-500 w-full"
              >
                No projects found matching your criteria.
              </motion.div>
            )}
          </AnimatePresence>

          {hasMore && (
            <motion.button
              ref={loadMoreRef}
              onClick={handleLoadMore}
              disabled={loadMoreLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-accent mt-4"
            >
              {loadMoreLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Load More Projects
                  <FiChevronDown className="w-4 h-4" />
                </span>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
