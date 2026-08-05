'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaWhatsapp,
  FaCopy, FaCheck, FaPaperPlane, FaSpinner,
} from 'react-icons/fa';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
};

export default function Contact() {
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', company: '', subject: '', message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('uwiringiyimanamoise299@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full bg-transparent border rounded-xl px-4 pt-6 pb-2 text-foreground outline-none transition-all duration-200 peer ${
      errors[field] ? 'border-red-500' : 'border-glass-border focus:border-primary'
    }`;

  const labelClass = (field: keyof FormErrors) =>
    `absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-all duration-200 pointer-events-none ${
      errors[field] ? 'text-red-400' : 'text-foreground/50'
    } peer-focus:top-3 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs`;

  const infoCards = [
    {
      icon: FaEnvelope,
      label: 'Email',
      value: 'uwiringiyimanamoise299@gmail.com',
      action: (
        <button
          onClick={copyEmail}
          className="text-foreground/50 hover:text-primary transition-colors"
          aria-label="Copy email"
        >
          {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
        </button>
      ),
    },
    {
      icon: FaPhone,
      label: 'Phone',
      value: '+250 795 552 517',
    },
    {
      icon: FaMapMarkerAlt,
      label: 'Location',
      value: 'Menge, Muhoza, Musanze, Rwanda',
    },
  ];

  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="section-title gradient-text">Get In Touch</h2>
          <p className="section-subtitle">
            Have a project in mind? Let&apos;s build something amazing together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Form */}
          <motion.form
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 glass-card rounded-2xl p-8 space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {(['name', 'email', 'phone', 'company'] as const).map((field) => (
                <div key={field} className="relative">
                  <input
                    id={field}
                    type={field === 'email' ? 'email' : 'text'}
                    placeholder=" "
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={inputClass(field as keyof FormErrors)}
                  />
                  <label htmlFor={field} className={labelClass(field as keyof FormErrors)}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {errors[field as keyof FormErrors] && (
                    <p className="text-red-400 text-xs mt-1">{errors[field as keyof FormErrors]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="relative">
              <input
                id="subject"
                type="text"
                placeholder=" "
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                className={inputClass('subject')}
              />
              <label htmlFor="subject" className={labelClass('subject')}>
                Subject
              </label>
              {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
            </div>

            <div className="relative">
              <textarea
                id="message"
                rows={5}
                placeholder=" "
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className={`${inputClass('message')} resize-none pt-6`}
              />
              <label htmlFor="message" className={labelClass('message')}>
                Message
              </label>
              {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary min-w-[160px] justify-center"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>

            {status === 'success' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 font-medium"
              >
                Message sent successfully! We&apos;ll get back to you soon.
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-medium"
              >
                Something went wrong. Please try again later.
              </motion.p>
            )}
          </motion.form>

          {/* Info */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {infoCards.map((card) => (
              <div key={card.label} className="glass-card rounded-xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg glass flex items-center justify-center text-primary shrink-0">
                  <card.icon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/50 uppercase tracking-wider">{card.label}</p>
                  <p className="text-foreground font-medium truncate">{card.value}</p>
                </div>
                {card.action}
              </div>
            ))}

            <a
              href="https://wa.me/250795552517"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full glass-card rounded-xl p-5 hover:bg-glass-hover transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 shrink-0 group-hover:bg-green-500/30 transition-colors">
                <FaWhatsapp className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-foreground/50 uppercase tracking-wider">WhatsApp</p>
                <p className="text-foreground font-medium">Chat with us</p>
              </div>
            </a>

            <div className="glass-card rounded-xl overflow-hidden h-52">
              <iframe
                title="Google Maps"
                src="https://maps.google.com/maps?q=Menge,%20Muhoza,%20Musanze,%20Rwanda&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '0.75rem' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
