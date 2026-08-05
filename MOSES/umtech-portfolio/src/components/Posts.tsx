'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiShare2, FiLink, FiMessageCircle, FiChevronDown, FiChevronUp,
  FiExternalLink, FiGithub, FiMapPin, FiMoreHorizontal, FiSend, FiUser,
  FiTwitter, FiFacebook, FiLinkedin, FiMail,
} from 'react-icons/fi';
import { formatTimeAgo, copyToClipboard } from '@/lib/utils';

interface PostComment {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
}

interface PostData {
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
  pinned: boolean;
}

function CommentSection({ postId, commentCount }: { postId: string; commentCount: number }) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comment`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch { /* ignore */ }
  }, [postId]);

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
      const res = await fetch(`/api/posts/${postId}/comment`, {
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
                      <span className="text-[10px] text-foreground/40">{formatTimeAgo(c.createdAt)}</span>
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

function ShareMenu({ postId, onClose }: { postId: string; onClose: () => void }) {
  const url = `https://umtech.dev/posts/${postId}`;
  const text = 'Check out this post from UMTECH!';

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

function PostCard({ post, index }: { post: PostData; index: number }) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [localShares, setLocalShares] = useState(post.shares);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const isLongContent = post.content.length > 180;
  const displayContent = expanded || !isLongContent ? post.content : post.content.slice(0, 180) + '...';

  const handleLike = useCallback(async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLocalLikes((l) => l + (newLiked ? 1 : -1));
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: newLiked }),
      });
      const data = await res.json();
      setLocalLikes(data.count);
    } catch { /* revert on error */ }
  }, [liked, post.id]);

  const handleShare = useCallback(async () => {
    setShowShare(false);
    setLocalShares((s) => s + 1);
    try {
      await fetch(`/api/posts/${post.id}/share`, { method: 'POST' });
    } catch { /* ignore */ }
  }, [post.id]);

  const handleCopyLink = useCallback(async () => {
    await copyToClipboard(`https://umtech.dev/posts/${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [post.id]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card rounded-2xl overflow-hidden w-full max-w-[600px] mx-auto"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0"
            >
              U
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">UMTECH</h4>
                {post.pinned && <FiMapPin className="w-3 h-3 text-amber-400" />}
              </div>
              <span className="text-xs text-foreground/40">{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
          <button className="text-foreground/30 hover:text-foreground/60 transition-colors">
            <FiMoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{displayContent}</p>

        {isLongContent && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-light transition-colors"
          >
            {expanded ? (
              <>Show less <FiChevronUp className="w-3 h-3" /></>
            ) : (
              <>Read more <FiChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}

        {post.images && post.images.length > 0 && (
          <div className={`grid gap-2 ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
          }`}>
            {post.images.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01 }}
                className={`relative overflow-hidden rounded-xl ${
                  post.images.length === 3 && i === 0 ? 'col-span-2 row-span-1' : ''
                } ${post.images.length === 3 && i === 0 ? 'aspect-[2/1]' : 'aspect-[4/3]'}`}
              >
                <img src={img} alt={`Post image ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        )}

        {post.videoUrl && (
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <iframe
              src={post.videoUrl}
              title="Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {post.websiteUrl && (
            <a href={post.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-2 px-4">
              <FiExternalLink className="w-3.5 h-3.5" />
              <span>Website</span>
            </a>
          )}
          {post.githubUrl && (
            <a href={post.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2 px-4">
              <FiGithub className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-glass-border">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? 'text-rose-500' : 'text-foreground/50 hover:text-rose-400'
              }`}
            >
              <motion.div animate={liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
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
                {showShare && <ShareMenu postId={post.id} onClose={() => setShowShare(false)} />}
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

        <CommentSection postId={post.id} commentCount={post.comments} />
      </div>
    </motion.article>
  );
}

export default function Posts() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [visible, setVisible] = useState(3);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts/list');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch {
        // Posts will remain empty
      } finally {
        setInitialLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const hasMore = visible < posts.length;

  const handleLoadMore = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setVisible((prev) => Math.min(prev + 2, posts.length));
      setLoading(false);
    }, 300);
  }, [posts.length]);

  const sorted = [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayed = sorted.slice(0, visible);

  return (
    <section id="posts" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title gradient-text inline-block">Latest Posts</h2>
          <p className="section-subtitle">Thoughts, tutorials, and updates from the UMTECH team.</p>
        </motion.div>

        <div className="flex flex-col items-center gap-5">
          {initialLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/40 text-sm">No posts yet. Check back later!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {displayed.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </AnimatePresence>
          )}

          {hasMore && (
            <motion.button
              onClick={handleLoadMore}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-accent mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Load More Posts
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
