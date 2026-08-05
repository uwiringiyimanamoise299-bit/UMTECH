'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FaReact, FaNodeJs, FaGitAlt, FaGithub,
} from 'react-icons/fa';
import {
  SiNextdotjs, SiExpress, SiMysql, SiFirebase,
  SiPrisma, SiTailwindcss, SiTypescript, SiJavascript,
} from 'react-icons/si';

const skills = [
  { name: 'React', level: 95, icon: 'FaReact', category: 'Frontend' },
  { name: 'Next.js', level: 92, icon: 'SiNextdotjs', category: 'Frontend' },
  { name: 'Node.js', level: 90, icon: 'FaNodeJs', category: 'Backend' },
  { name: 'Express', level: 88, icon: 'SiExpress', category: 'Backend' },
  { name: 'MySQL', level: 85, icon: 'SiMysql', category: 'Database' },
  { name: 'Firebase', level: 88, icon: 'SiFirebase', category: 'Backend' },
  { name: 'Git', level: 90, icon: 'FaGitAlt', category: 'Tools' },
  { name: 'GitHub', level: 92, icon: 'FaGithub', category: 'Tools' },
  { name: 'Prisma', level: 85, icon: 'SiPrisma', category: 'Backend' },
  { name: 'Tailwind CSS', level: 95, icon: 'SiTailwindcss', category: 'Frontend' },
  { name: 'TypeScript', level: 92, icon: 'SiTypescript', category: 'Language' },
  { name: 'JavaScript', level: 95, icon: 'SiJavascript', category: 'Language' },
];

const iconMap: Record<string, React.ElementType> = {
  FaReact, FaNodeJs, FaGitAlt, FaGithub,
  SiNextdotjs, SiExpress, SiMysql, SiFirebase,
  SiPrisma, SiTailwindcss, SiTypescript, SiJavascript,
};

const categories = ['Frontend', 'Backend', 'Database', 'Tools', 'Language'];

const categoryGradients: Record<string, string> = {
  Frontend: 'from-primary to-purple-600',
  Backend: 'from-secondary to-cyan-600',
  Database: 'from-accent to-orange-600',
  Tools: 'from-emerald-500 to-teal-600',
  Language: 'from-pink-500 to-rose-600',
};

const categoryIcons: Record<string, string> = {
  Frontend: '</>',
  Backend: '{}',
  Database: 'DB',
  Tools: '⚙',
  Language: 'JS',
};

function SkillBar({ skill, index }: { skill: typeof skills[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = iconMap[skill.icon];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-glass flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors duration-300">
            <Icon className="text-sm text-foreground/70 group-hover:text-primary transition-colors duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">{skill.name}</span>
            <span className="text-xs font-bold text-primary">{skill.level}%</span>
          </div>
          <div className="relative h-2 rounded-full bg-glass overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
              transition={{ duration: 1.2, delay: index * 0.05, ease: [0.175, 0.885, 0.32, 1.275] }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary"
            >
              <div className="absolute inset-y-0 right-0 w-4 rounded-full bg-white/20 blur-sm" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="relative py-24 md:py-32 px-4 overflow-hidden">
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
            Skills & <span className="gradient-text">Expertise</span>
          </h2>
          <p className="section-subtitle">
            Years of dedication mastering modern technologies to deliver
            world-class digital solutions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, catIndex) => {
            const categorySkills = skills.filter((s) => s.category === category);
            if (categorySkills.length === 0) return null;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
              >
                <div className={`glass-card rounded-2xl p-6 h-full group hover:border-primary/20 transition-all duration-500`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryGradients[category]} flex items-center justify-center text-xs font-bold text-white`}>
                      {categoryIcons[category]}
                    </div>
                    <div>
                      <h3 className="font-bold">{category}</h3>
                      <p className="text-xs text-foreground/50">
                        {categorySkills.length} skill{categorySkills.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {categorySkills.map((skill, i) => (
                      <SkillBar key={skill.name} skill={skill} index={i} />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
