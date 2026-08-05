'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });
const Hero = dynamic(() => import('@/components/Hero'), { ssr: false });
const About = dynamic(() => import('@/components/About'), { ssr: false });
const Services = dynamic(() => import('@/components/Services'), { ssr: false });
const Skills = dynamic(() => import('@/components/Skills'), { ssr: false });
const Projects = dynamic(() => import('@/components/Projects'), { ssr: false });
const Posts = dynamic(() => import('@/components/Posts'), { ssr: false });
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false });
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] },
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <motion.div className="relative py-32 px-4" {...fadeInUp}>
          <About />
        </motion.div>
        <motion.div className="relative py-32 px-4" {...fadeInUp}>
          <Services />
        </motion.div>
        <motion.div className="relative py-32 px-4" {...fadeInUp}>
          <Skills />
        </motion.div>
        <motion.div className="relative py-32 px-4" {...fadeInUp}>
          <Projects />
        </motion.div>
        <motion.div className="relative py-32 px-4" {...fadeInUp}>
          <Posts />
        </motion.div>
        <motion.div className="relative py-32 px-4" {...fadeInUp}>
          <Testimonials />
        </motion.div>
        <motion.div className="relative py-32 px-4" {...fadeInUp}>
          <Contact />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
