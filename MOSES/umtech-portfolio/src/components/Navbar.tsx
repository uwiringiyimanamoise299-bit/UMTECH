'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { FaLinkedin, FaGithub, FaXTwitter, FaYoutube, FaBars, FaXmark } from 'react-icons/fa6';
import { FaSignInAlt, FaTachometerAlt } from 'react-icons/fa';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Posts', href: '#posts' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

const socialLinks: { icon?: React.ComponentType<{ className?: string }>; img?: string; href: string; label: string }[] = [
  { icon: FaLinkedin, href: 'https://www.linkedin.com/in/uwiringiyimana-moise-1315a83b7/', label: 'LinkedIn' },
  { icon: FaGithub, href: 'https://github.com/uwiringiyimanamoise299-bit', label: 'GitHub' },
  { icon: FaXTwitter, href: 'https://x.com/moise25t3/articles', label: 'X (Twitter)' },
  { icon: FaYoutube, href: 'https://www.youtube.com/@UMTECH12', label: 'YouTube' },
  { img: '/fiverr-icon.png', href: 'https://www.fiverr.com', label: 'Fiverr' },
];

const containerVariants = {
  hidden: { y: -80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' } as const,
  },
} as const;

const linkVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.1 + i * 0.05, duration: 0.4, ease: 'easeOut' } as const,
  }),
} as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('#home');
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = navLinks.map((l) => l.href.slice(1));
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveLink(`#${id}`);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-primary/5'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('#home')}
            className="text-2xl sm:text-3xl font-extrabold gradient-text tracking-tight cursor-pointer"
          >
            UMTECH
          </button>

          {/* Desktop Links */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <motion.li
                key={link.href}
                custom={i}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
              >
                <button
                  onClick={() => handleNavClick(link.href)}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-300 cursor-pointer ${
                    activeLink === link.href
                      ? 'text-primary'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {activeLink === link.href && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </motion.li>
            ))}
          </ul>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Social Icons - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {socialLinks.map(({ icon: Icon, img, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex items-center justify-center transition-all duration-300 ${
                    img
                      ? 'h-9 w-9 rounded-lg bg-[#1dbf73]/10 hover:bg-[#1dbf73]/20 border border-[#1dbf73]/30'
                      : 'h-9 w-9 rounded-full text-foreground/60 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {Icon ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    <img src={img} alt={label} className="w-5 h-5 object-contain rounded-[3px]" />
                  )}
                </a>
              ))}
            </div>

            <ThemeToggle />

            {user ? (
              <Link
                href="/admin/dashboard"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
              >
                <FaTachometerAlt className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
              >
                <FaSignInAlt className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full glass text-foreground cursor-pointer"
              aria-label="Open menu"
            >
              <FaBars className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-[100] flex flex-col ${
              isDark ? 'bg-dark-bg/98' : 'bg-light-bg/98'
            } backdrop-blur-xl`}
          >
            {/* Close Button */}
            <div className="flex items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
              <span className="text-2xl sm:text-3xl font-extrabold gradient-text tracking-tight">
                UMTECH
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full glass text-foreground cursor-pointer"
                aria-label="Close menu"
              >
                <FaXmark className="h-5 w-5" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
                  onClick={() => handleNavClick(link.href)}
                  className={`w-full max-w-xs py-4 text-center text-2xl font-bold tracking-wide transition-colors duration-300 cursor-pointer ${
                    activeLink === link.href
                      ? 'gradient-text'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {link.label}
                </motion.button>
              ))}
            </div>

            {/* Mobile Auth Links */}
            <div className="flex items-center justify-center gap-4 pb-6">
              {user ? (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
                >
                  <FaTachometerAlt className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
                >
                  <FaSignInAlt className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Social Icons */}
            <div className="flex items-center justify-center gap-4 pb-12">
              {socialLinks.map(({ icon: Icon, img, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex items-center justify-center transition-all duration-300 ${
                    img
                      ? 'h-13 w-13 rounded-xl bg-[#1dbf73]/10 hover:bg-[#1dbf73]/20 border border-[#1dbf73]/30'
                      : 'h-12 w-12 rounded-full glass text-foreground/60 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {Icon ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <img src={img} alt={label} className="w-7 h-7 object-contain rounded-[5px]" />
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
