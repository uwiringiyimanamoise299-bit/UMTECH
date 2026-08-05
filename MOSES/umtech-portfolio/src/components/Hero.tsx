'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FaLinkedin,
  FaFacebook,
  FaGithub,
  FaYoutube,
  FaXTwitter,
  FaArrowRight,
  FaEnvelope,
} from 'react-icons/fa6';

const roles = [
  'Full-Stack Developer',
  'Backend Engineer',
  'UI/UX Designer',
];

const socials: { icon?: React.ComponentType<{ className?: string }>; img?: string; href: string; label: string }[] = [
  { icon: FaLinkedin, href: 'https://www.linkedin.com/in/uwiringiyimana-moise-1315a83b7/', label: 'LinkedIn' },
  { icon: FaFacebook, href: 'https://web.facebook.com/profile.php?id=100095474531603', label: 'Facebook' },
  { icon: FaGithub, href: 'https://github.com/uwiringiyimanamoise299-bit', label: 'GitHub' },
  { icon: FaYoutube, href: 'https://www.youtube.com/@UMTECH12', label: 'YouTube' },
  { icon: FaXTwitter, href: 'https://x.com/moise25t3/articles', label: 'X (Twitter)' },
  { img: '/fiverr-icon.png', href: 'https://www.fiverr.com', label: 'Fiverr' },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 } as const,
  },
} as const;

const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } } as const,
} as const;

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } } as const,
} as const;

function useTypewriter(words: string[], typingSpeed = 100, deleteSpeed = 60, pause = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), pause);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
      } else {
        setIsDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, wordIndex, isDeleting]);

  return text;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const typedText = useTypewriter(roles);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Cinematic Video Background */}
      <motion.div
        style={{ scale: videoScale, opacity: videoOpacity }}
        className="absolute inset-0 z-0"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%230a0a0a' width='1920' height='1080'/%3E%3C/svg%3E"
        >
          <source
            src="https://videos.pexels.com/video-files/5378004/5378004-hd_1280_720_25fps.mp4"
            type="video/mp4"
          />
        </video>
      </motion.div>

      {/* Dark Overlay - ensures text readability */}
      <div className="absolute inset-0 z-[1] bg-black/70" />

      {/* Gradient Overlay - cinematic feel */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-black/80" />

      {/* Color Tint Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

      {/* Grid Background (subtle on top of video) */}
      <div className="absolute inset-0 z-[2] grid-bg opacity-15" />

      {/* Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-24 pb-16 text-center sm:px-6 lg:px-8"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Profile Photo */}
          <motion.div variants={scaleIn} className="mb-8">
            <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent p-[3px] animate-pulse-glow">
                <div className="h-full w-full rounded-full bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <span className="text-3xl sm:text-4xl font-bold gradient-text">
                    UM
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-none tracking-tight text-white mb-4"
            style={{ textShadow: '0 0 60px rgba(99,102,241,0.4), 0 0 120px rgba(99,102,241,0.2)' }}
          >
            UMTECH
          </motion.h1>

          {/* Typing Animation Role */}
          <motion.div variants={fadeUp} className="mb-4 h-10">
            <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-white/80">
              <span>{typedText}</span>
              <span className="ml-1 inline-block h-8 w-0.5 animate-pulse bg-primary" />
            </span>
          </motion.div>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            className="mb-10 max-w-2xl text-base sm:text-lg text-white/50 leading-relaxed"
          >
            Crafting exceptional digital experiences through innovative full-stack solutions
            and human-centered design.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <button
              onClick={() => scrollTo('projects')}
              className="btn-primary group"
            >
              <span>View Projects</span>
              <FaArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button onClick={() => scrollTo('contact')} className="btn-secondary">
              Hire Me
            </button>
            <button onClick={() => scrollTo('contact')} className="btn-secondary">
              <FaEnvelope className="h-4 w-4" />
              <span>Contact Me</span>
            </button>
          </motion.div>

          {/* Social Icons */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 sm:gap-4"
          >
            {socials.map(({ icon: Icon, img, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`group flex items-center justify-center rounded-full glass transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 backdrop-blur-sm border border-white/10 ${
                  img
                    ? 'h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#1dbf73]/10 hover:bg-[#1dbf73]/20 border-[#1dbf73]/30'
                    : 'h-11 w-11 sm:h-12 sm:w-12 text-white/40 hover:bg-primary/20 hover:text-primary hover:shadow-primary/20'
                }`}
              >
                {Icon ? (
                  <Icon className="h-5 w-5 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <img src={img} alt={label} className="h-7 w-7 sm:h-8 sm:w-8 object-contain rounded-[6px] transition-transform duration-300 group-hover:scale-110" />
                )}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom Fade Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none z-20" />

      {/* Top Vignette */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[3]" />
    </section>
  );
}
