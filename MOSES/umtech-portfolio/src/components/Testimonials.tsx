'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';

const testimonials = [
  { id: '1', name: 'Sarah Johnson', company: 'TechCorp Inc.', country: 'USA', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', rating: 5, comment: 'Working with UMTECH was an absolute pleasure. They delivered our e-commerce platform ahead of schedule and exceeded all expectations. The attention to detail and technical expertise is outstanding.' },
  { id: '2', name: 'Michael Chen', company: 'StartupX', country: 'Singapore', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', rating: 5, comment: 'The AI application UMTECH built for us transformed our business operations. Their team understood our requirements perfectly and delivered a solution that was both innovative and practical.' },
  { id: '3', name: 'Emily Rodriguez', company: 'Digital Solutions Ltd', country: 'UK', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', rating: 5, comment: 'Exceptional UI/UX design work. Our user engagement increased by 200% after the redesign. UMTECH truly understands how to create experiences that users love.' },
  { id: '4', name: 'David Kim', company: 'Global Services Co.', country: 'South Korea', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', rating: 4, comment: 'Professional, responsive, and technically brilliant. The booking system they developed handles thousands of transactions daily without any issues.' },
];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

export default function Testimonials() {
  const [[current, direction], setSlide] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    const dir = index > current ? 1 : -1;
    setSlide([index, dir]);
  }, [current]);

  const next = useCallback(() => {
    setSlide(([cur]) => [(cur + 1) % testimonials.length, 1]);
  }, []);

  const prev = useCallback(() => {
    setSlide(([cur]) => [(cur - 1 + testimonials.length) % testimonials.length, -1]);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(next, 4000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, next]);

  const t = testimonials[current];

  return (
    <section id="testimonials" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title gradient-text">Client Testimonials</h2>
          <p className="section-subtitle">
            Hear what our clients say about working with us and the impact we&apos;ve made on their businesses.
          </p>
        </motion.div>

        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="min-h-[320px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={t.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="glass-card rounded-2xl p-8 md:p-10 w-full"
              >
                <FaQuoteLeft className="text-primary/30 text-3xl mb-4" />
                <p className="text-foreground/80 text-lg leading-relaxed mb-6">
                  {t.comment}
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{t.name}</h4>
                    <p className="text-sm text-foreground/60">
                      {t.company} &middot; {t.country}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FaStar
                          key={i}
                          className={i < t.rating ? 'text-yellow-400' : 'text-foreground/20'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-glass-hover transition-all z-10"
            aria-label="Previous testimonial"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-glass-hover transition-all z-10"
            aria-label="Next testimonial"
          >
            <FaChevronRight />
          </button>

          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current
                    ? 'bg-primary w-8'
                    : 'bg-foreground/20 hover:bg-foreground/40'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
