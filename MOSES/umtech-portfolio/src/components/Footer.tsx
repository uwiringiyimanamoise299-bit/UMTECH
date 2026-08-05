'use client';

import { motion } from 'framer-motion';
import {
  FaLinkedinIn, FaFacebookF, FaGithub, FaYoutube, FaTwitter,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowUp,
} from 'react-icons/fa';

const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Posts', href: '#posts' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

const services = [
  'Website Development',
  'E-Commerce',
  'AI Apps',
  'Mobile App',
  'UI/UX Design',
  'API Development',
];

const socialLinks: { icon?: React.ComponentType<{ className?: string }>; img?: string; href: string; label: string; color: string }[] = [
  { icon: FaLinkedinIn, href: 'https://www.linkedin.com/in/uwiringiyimana-moise-1315a83b7/', label: 'LinkedIn', color: 'hover:text-[#0a66c2]' },
  { icon: FaFacebookF, href: 'https://web.facebook.com/profile.php?id=100095474531603', label: 'Facebook', color: 'hover:text-[#1877f2]' },
  { icon: FaGithub, href: 'https://github.com/uwiringiyimanamoise299-bit', label: 'GitHub', color: 'hover:text-[#333] dark:hover:text-[#fff]' },
  { icon: FaYoutube, href: 'https://www.youtube.com/@UMTECH12', label: 'YouTube', color: 'hover:text-[#ff0000]' },
  { icon: FaTwitter, href: 'https://x.com/moise25t3/articles', label: 'X (Twitter)', color: 'hover:text-[#1da1f2]' },
  { img: '/fiverr-icon.png', href: 'https://www.fiverr.com', label: 'Fiverr', color: 'hover:text-[#1dbf73]' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-background border-t border-glass-border">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <motion.div variants={itemVariants} className="space-y-5">
            <h3 className="text-3xl font-extrabold gradient-text">UMTECH</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">
              We craft modern, scalable, and user-centric digital experiences
              that drive business growth and innovation.
            </p>
            <div className="flex gap-3 flex-wrap">
              {socialLinks.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  className={`flex items-center justify-center glass transition-all duration-300 hover:scale-110 ${
                    s.img
                      ? 'w-11 h-11 rounded-xl bg-[#1dbf73]/10 hover:bg-[#1dbf73]/20 border border-[#1dbf73]/30'
                      : `w-9 h-9 rounded-lg text-foreground/60 ${s.color}`
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  {s.icon ? (
                    <s.icon className="text-sm" />
                  ) : (
                    <img src={s.img} alt={s.label} className="w-6 h-6 object-contain rounded-[4px]" />
                  )}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={itemVariants} className="space-y-5">
            <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-foreground/60 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Services */}
          <motion.div variants={itemVariants} className="space-y-5">
            <h4 className="text-lg font-semibold text-foreground">Services</h4>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="text-foreground/60 hover:text-primary transition-colors text-sm"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Contact & Newsletter */}
          <motion.div variants={itemVariants} className="space-y-5">
            <h4 className="text-lg font-semibold text-foreground">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-foreground/60">
                <FaEnvelope className="text-primary shrink-0" />
                uwiringiyimanamoise299@gmail.com
              </li>
              <li className="flex items-center gap-3 text-foreground/60">
                <FaPhone className="text-primary shrink-0" />
                +250 795 552 517
              </li>
              <li className="flex items-center gap-3 text-foreground/60">
                <FaMapMarkerAlt className="text-primary shrink-0" />
                Menge, Muhoza, Musanze, Rwanda
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          variants={itemVariants}
          className="mt-16 pt-8 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-foreground/40 text-xs">
            &copy; {new Date().getFullYear()} UMTECH. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <a href="#" className="text-foreground/40 hover:text-foreground/70 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-foreground/40 hover:text-foreground/70 transition-colors">
              Terms of Service
            </a>
          </div>
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-foreground/60 hover:text-primary hover:bg-glass-hover transition-all"
            aria-label="Back to top"
          >
            <FaArrowUp />
          </button>
        </motion.div>
      </motion.div>
    </footer>
  );
}
