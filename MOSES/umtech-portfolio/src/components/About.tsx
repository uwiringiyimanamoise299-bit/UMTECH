'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FaAward, FaGraduationCap, FaBriefcase,
  FaCode, FaUsers, FaProjectDiagram, FaClock, FaLightbulb,
  FaRocket, FaStar
} from 'react-icons/fa';

const stats = [
  { icon: FaClock, value: '8+', label: 'Years Experience' },
  { icon: FaProjectDiagram, value: '150+', label: 'Projects Completed' },
  { icon: FaUsers, value: '120+', label: 'Happy Clients' },
  { icon: FaCode, value: '30+', label: 'Technologies' },
];

const missions = [
  'Deliver cutting-edge digital solutions that drive measurable business growth',
  'Transform complex challenges into elegant, user-centric experiences',
  'Maintain the highest standards of code quality and security',
];

const visions = [
  'To be Africa\'s most trusted technology partner for digital transformation',
  'Pioneer innovative solutions that bridge technology and human experience',
  'Build a legacy of excellence in every line of code we write',
];

const education = [
  { year: '2020 - 2024', degree: 'Training in Software Engineering', school: 'University of Technology', description: 'Specialized in Software Engineering and AI' },
  { year: '2022', degree: 'Full Stack Web Development', school: 'FreeCodeCamp', description: 'Advanced certification in modern web technologies' },
  { year: '2021', degree: 'AWS Cloud Practitioner', school: 'Amazon Web Services', description: 'Cloud architecture and deployment expertise' },
];

const experience = [
  { year: '2023 - Present', role: 'Lead Full Stack Developer', company: 'UMTECH', description: 'Architecting enterprise-scale web applications' },
  { year: '2022 - 2023', role: 'Senior Software Engineer', company: 'TechCorp Ltd', description: 'Led team of 5 developers on critical projects' },
  { year: '2021 - 2022', role: 'Frontend Developer', company: 'Digital Innovations', description: 'Built responsive, performant user interfaces' },
];

const techTags = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'Python',
  'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'GraphQL',
  'Tailwind CSS', 'Figma', 'Git', 'CI/CD', 'REST APIs',
];

function AnimatedCounter({ end, suffix = '', decimals = 0 }: { end: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);
  const numericValue = parseFloat(end.replace(/[+\-]/g, ''));

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    const duration = 2000;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numericValue));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [isInView, numericValue]);

  return (
    <div ref={ref} className="text-3xl font-bold">
      {count}{suffix}
    </div>
  );
}

function TimelineItem({ item, index, type }: {
  item: { year: string; degree?: string; school?: string; role?: string; company?: string; description: string };
  index: number;
  type: 'education' | 'experience';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-10 pb-8 last:pb-0"
    >
      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_rgba(99,102,241,0.5)] z-10" />
      {index < (type === 'education' ? education.length : experience.length) - 1 && (
        <div className="absolute left-[5px] top-4 w-[2px] h-full bg-gradient-to-b from-primary to-transparent" />
      )}
      <div className="glass-card rounded-xl p-5">
        <span className="text-xs font-semibold text-primary tracking-wider uppercase">
          {item.year}
        </span>
        <h4 className="text-lg font-bold mt-1">
          {item.degree || item.role}
        </h4>
        <p className="text-sm text-foreground/60 font-medium">
          {item.school || item.company}
        </p>
        <p className="text-sm text-foreground/50 mt-2">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

function MissionVisionCard({ title, items, icon: Icon, gradient }: {
  title: string;
  items: string[];
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient}`}>
        <Icon className="text-white text-xl" />
      </div>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-foreground/70">
            <FaStar className="text-accent mt-0.5 shrink-0 text-xs" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 px-4 overflow-hidden">
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
            About <span className="gradient-text">UMTECH</span>
          </h2>
          <p className="section-subtitle">
            Crafting digital excellence through innovative technology solutions
            that empower businesses to thrive in the modern era.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent animate-gradient animate-float" />
              <div className="absolute inset-[3px] rounded-2xl bg-dark-bg dark:bg-dark-bg light:bg-light-bg flex items-center justify-center overflow-hidden">
                <div className="text-center p-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <FaCode className="text-white text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold gradient-text">UMTECH</h3>
                  <p className="text-sm text-foreground/60 mt-1">Building the Future</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.6s' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <p className="text-lg text-foreground/80 leading-relaxed">
              At UMTECH, we are passionate about creating exceptional digital experiences
              that drive real business impact. With years of hands-on expertise across
              the full technology stack, we transform ambitious ideas into scalable,
              high-performance solutions.
            </p>
            <p className="text-base text-foreground/60 leading-relaxed">
              Our approach combines technical excellence with creative innovation,
              ensuring every project delivers measurable value. From startups to
              enterprises, we partner with clients to build digital products that
              stand out in today&apos;s competitive landscape.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <MissionVisionCard
                title="Our Mission"
                items={missions}
                icon={FaRocket}
                gradient="from-primary to-purple-600"
              />
              <MissionVisionCard
                title="Our Vision"
                items={visions}
                icon={FaLightbulb}
                gradient="from-secondary to-cyan-600"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="text-primary text-lg" />
                </div>
                <AnimatedCounter end={stat.value} />
                <p className="text-sm text-foreground/60 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 mb-20">
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold mb-6 flex items-center gap-3"
            >
              <FaGraduationCap className="text-primary" />
              Education
            </motion.h3>
            {education.map((item, i) => (
              <TimelineItem key={i} item={item} index={i} type="education" />
            ))}
          </div>
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold mb-6 flex items-center gap-3"
            >
              <FaBriefcase className="text-secondary" />
              Experience
            </motion.h3>
            {experience.map((item, i) => (
              <TimelineItem key={i} item={item} index={i} type="experience" />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <FaCode className="text-primary" />
            Technologies & Tools
            <FaCode className="text-secondary" />
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {techTags.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="px-4 py-2 rounded-full text-sm font-medium glass-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-default"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
