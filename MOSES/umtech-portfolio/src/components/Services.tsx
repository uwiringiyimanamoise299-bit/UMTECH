'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  FaGlobe, FaShoppingCart, FaCalendarCheck, FaRobot,
  FaMobileAlt, FaPaintBrush, FaCode, FaDatabase,
  FaCheckCircle, FaArrowRight, FaTimes, FaPaperPlane,
  FaSpinner, FaPhone, FaDollarSign, FaClipboardList,
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const services = [
  {
    id: 'portfolio',
    title: 'Portfolio Website',
    description: 'A beautiful, personal portfolio to showcase your work and skills.',
    features: ['Responsive Design', 'SEO Optimization', 'Contact Form', 'Custom Domain'],
    icon: 'FaGlobe',
    basePrice: 150000,
  },
  {
    id: 'business',
    title: 'Business Website',
    description: 'Professional website to establish your corporate presence online.',
    features: ['CMS Integration', 'Analytics', 'Lead Generation', 'Fast Loading'],
    icon: 'FaPaintBrush',
    basePrice: 300000,
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Website',
    description: 'Full-featured online stores with secure payment gateways.',
    features: ['Payment Integration', 'Inventory Management', 'Shopping Cart', 'Order Tracking'],
    icon: 'FaShoppingCart',
    basePrice: 600000,
  },
  {
    id: 'school',
    title: 'School Management System',
    description: 'Comprehensive system to manage students, staff, and academics.',
    features: ['Student Portal', 'Grade Tracking', 'Attendance', 'Timetable Management'],
    icon: 'FaCalendarCheck',
    basePrice: 900000,
  },
  {
    id: 'hospital',
    title: 'Hospital Management System',
    description: 'Advanced system for healthcare facility administration.',
    features: ['Patient Records', 'Appointment Booking', 'Billing', 'Pharmacy Management'],
    icon: 'FaDatabase',
    basePrice: 1500000,
  },
  {
    id: 'inventory',
    title: 'Inventory Management System',
    description: 'Track stock levels, orders, and sales in real-time.',
    features: ['Real-time Tracking', 'Supplier Management', 'Reporting', 'Low Stock Alerts'],
    icon: 'FaClipboardList',
    basePrice: 700000,
  },
  {
    id: 'pos',
    title: 'POS System',
    description: 'Point of Sale system for retail stores and restaurants.',
    features: ['Barcode Scanning', 'Receipt Printing', 'Sales Analytics', 'Multi-user Support'],
    icon: 'FaShoppingCart',
    basePrice: 500000,
  },
  {
    id: 'mobile',
    title: 'Mobile Application',
    description: 'Native and cross-platform mobile apps for iOS and Android.',
    features: ['Cross-platform', 'Push Notifications', 'Offline Support', 'App Store Deployment'],
    icon: 'FaMobileAlt',
    basePrice: 1200000,
  },
  {
    id: 'custom',
    title: 'Custom Software Development',
    description: 'Tailored software solutions to meet your unique business needs.',
    features: ['Requirement Analysis', 'Scalable Architecture', 'Dedicated Support', 'API Integration'],
    icon: 'FaCode',
    basePrice: 0, // 0 for "Contact for Pricing"
  },
];

const iconMap: Record<string, React.ElementType> = {
  FaGlobe, FaShoppingCart, FaCalendarCheck, FaRobot,
  FaMobileAlt, FaPaintBrush, FaCode, FaDatabase, FaClipboardList
};

const iconGradients: Record<string, string> = {
  portfolio: 'from-primary to-purple-600',
  business: 'from-secondary to-cyan-600',
  ecommerce: 'from-accent to-orange-600',
  school: 'from-pink-500 to-rose-600',
  hospital: 'from-emerald-500 to-teal-600',
  inventory: 'from-violet-500 to-fuchsia-600',
  pos: 'from-amber-500 to-yellow-600',
  mobile: 'from-sky-500 to-blue-600',
  custom: 'from-slate-500 to-gray-600',
};

const amountPresets = [150000, 300000, 500000, 600000, 700000, 900000, 1200000, 1500000];

interface ServiceRequestModalProps {
  service: typeof services[0];
  isOpen: boolean;
  onClose: () => void;
}

function ServiceRequestModal({ service, isOpen, onClose }: ServiceRequestModalProps) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe your project');
      return;
    }
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) {
      setError('Please enter a budget amount');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: service.id,
          serviceTitle: service.title,
          description: description.trim(),
          amount: finalAmount,
          phone: phone.trim(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setDescription('');
          setPhone('');
          setAmount(0);
          setCustomAmount('');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit request');
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-card rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-glass-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Request {service.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Tell us about your project</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-glass-hover transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-green-400 text-3xl" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Request Submitted!</h4>
                  <p className="text-sm text-gray-500">
                    Admin will review your request and respond soon.
                  </p>
                </motion.div>
              ) : (
                <>
                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  {!user && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm text-gray-400">
                      Please <Link href="/login" className="text-primary hover:underline">login</Link> or{' '}
                      <Link href="/register" className="text-primary hover:underline">register</Link> to request a service.
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <FaPhone className="inline mr-2 text-primary" />
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 7XX XXX XXX"
                      className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <FaClipboardList className="inline mr-2 text-primary" />
                      Project Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe your project requirements, timeline, and any specific features you need..."
                      className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      <FaDollarSign className="inline mr-2 text-primary" />
                      Budget (RWF) *
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {amountPresets.map((preset) => (
                        <button
                          key={preset}
                          onClick={(e) => { e.preventDefault(); setAmount(preset); setCustomAmount(''); }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            amount === preset && !customAmount
                              ? 'bg-primary text-white border border-primary shadow-lg shadow-primary/20'
                              : 'bg-glass border border-glass-border text-gray-400 hover:text-white hover:border-primary/30'
                          }`}
                        >
                          {preset >= 1000000 ? `${preset / 1000000}M RWF` : `${preset / 1000}k RWF`}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">RWF</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                        placeholder="Custom amount"
                        min="1"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {!submitted && (
              <div className="p-6 border-t border-glass-border">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !user}
                  className="btn-primary w-full text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><FaSpinner className="animate-spin" /> Submitting...</>
                  ) : (
                    <><FaPaperPlane /> Submit Request</>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ServiceCard({ service, index, onRequest }: { service: typeof services[0]; index: number; onRequest: (s: typeof services[0]) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const Icon = iconMap[service.icon];
  const gradientClass = iconGradients[service.id.replace(/-/g, '_')] || 'from-primary to-secondary';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.175, 0.885, 0.32, 1.275] }}
      whileHover={{ y: -8, scale: 1.01 }}
      onMouseMove={(e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.01)`;
      }}
      onMouseLeave={() => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
      }}
      className="glass-card rounded-2xl p-6 md:p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)]"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-5 shadow-lg`}>
        {Icon && <Icon className="text-white text-xl" />}
      </div>

      <h3 className="text-xl font-bold mb-2">{service.title}</h3>
      <p className="text-sm text-foreground/60 mb-5 leading-relaxed">{service.description}</p>

      <ul className="space-y-2.5 mb-6">
        {service.features.map((feature, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.3, delay: index * 0.1 + i * 0.08 }}
            className="flex items-center gap-3 text-sm"
          >
            <FaCheckCircle className="text-primary shrink-0 text-xs" />
            <span className="text-foreground/70">{feature}</span>
          </motion.li>
        ))}
      </ul>

      <div className="mb-6 pt-4 border-t border-glass-border">
        <span className="text-xs text-gray-400 block mb-1">Starting from</span>
        <span className="text-xl font-bold text-white">
          {service.basePrice > 0 ? `${service.basePrice.toLocaleString()} RWF` : 'Contact for Pricing'}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRequest(service); }}
        className="btn-primary w-full text-sm justify-center"
      >
        <span>Request Service</span>
        <FaArrowRight className="text-xs" />
      </button>
    </motion.div>
  );
}

export default function Services() {
  const [modalService, setModalService] = useState<typeof services[0] | null>(null);

  return (
    <section id="services" className="relative py-24 md:py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="section-title">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="section-subtitle">
            End-to-end digital solutions crafted with cutting-edge technology
            to accelerate your business growth.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              onRequest={setModalService}
            />
          ))}
        </div>
      </div>

      {modalService && (
        <ServiceRequestModal
          service={modalService}
          isOpen={true}
          onClose={() => setModalService(null)}
        />
      )}
    </section>
  );
}
