import { Skill } from '@/types';

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diff = now.getTime() - past.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 365) return `${Math.floor(days / 365)}y ago`;
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 7) return `${Math.floor(days / 7)}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error('Clipboard not available'));
}

export const socialPlatforms = [
  { name: 'LinkedIn', icon: 'FaLinkedin', color: '#0A66C2' },
  { name: 'Facebook', icon: 'FaFacebook', color: '#1877F2' },
  { name: 'Instagram', icon: 'FaInstagram', color: '#E4405F' },
  { name: 'GitHub', icon: 'FaGithub', color: '#333' },
  { name: 'YouTube', icon: 'FaYoutube', color: '#FF0000' },
  { name: 'X (Twitter)', icon: 'FaXTwitter', color: '#000' },
  { name: 'TikTok', icon: 'FaTiktok', color: '#000' },
  { name: 'Telegram', icon: 'FaTelegram', color: '#0088CC' },
  { name: 'WhatsApp', icon: 'FaWhatsapp', color: '#25D366' },
];

export const defaultProfile = {
  name: 'UMTECH',
  position: 'Full-Stack Developer & UI/UX Designer',
  bio: 'We are a passionate team of developers and designers dedicated to creating exceptional digital experiences. With years of expertise across the full stack, we transform ideas into powerful, scalable solutions.',
  photo: '/images/profile.jpg',
  resume: '/images/resume.pdf',
  email: 'uwiringiyimanamoise299@gmail.com',
  phone: '+250 795 552 517',
  location: 'Menge, Muhoza, Musanze, Rwanda',
  experience: 8,
  projectsCompleted: 150,
  happyClients: 120,
  technologies: 30,
};

export const defaultServices = [
  {
    id: 'web-dev',
    title: 'Website Development',
    description: 'Custom, responsive, and performant websites built with modern frameworks.',
    features: ['Responsive Design', 'SEO Optimization', 'Fast Loading', 'CMS Integration'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    icon: 'FaGlobe',
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Solutions',
    description: 'Full-featured online stores with secure payment gateways and inventory management.',
    features: ['Payment Integration', 'Inventory Management', 'Shopping Cart', 'Order Tracking'],
    image: 'https://images.unsplash.com/photo-1553729459-afe8f2e2c8a9?w=800&q=80',
    icon: 'FaShoppingCart',
  },
  {
    id: 'booking',
    title: 'Booking Systems',
    description: 'Intelligent booking and reservation systems for any industry.',
    features: ['Real-time Availability', 'Calendar Sync', 'Automated Reminders', 'Payment Processing'],
    image: 'https://images.unsplash.com/photo-1559526324-4bc8700d0e6e?w=800&q=80',
    icon: 'FaCalendarCheck',
  },
  {
    id: 'ai-apps',
    title: 'AI Applications',
    description: 'Intelligent solutions powered by machine learning and artificial intelligence.',
    features: ['ML Models', 'Natural Language Processing', 'Computer Vision', 'Predictive Analytics'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    icon: 'FaRobot',
  },
  {
    id: 'mobile',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications for iOS and Android.',
    features: ['Cross-platform', 'Push Notifications', 'Offline Support', 'App Store Deployment'],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    icon: 'FaMobileAlt',
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description: 'Beautiful, intuitive interfaces that delight users and drive engagement.',
    features: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    icon: 'FaPaintBrush',
  },
  {
    id: 'api',
    title: 'API Development',
    description: 'Robust and scalable RESTful and GraphQL APIs for any application.',
    features: ['REST & GraphQL', 'API Documentation', 'Authentication', 'Rate Limiting'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    icon: 'FaCode',
  },
  {
    id: 'database',
    title: 'Database Design',
    description: 'Efficient database architecture optimized for performance and scalability.',
    features: ['Schema Design', 'Query Optimization', 'Data Migration', 'Backup Solutions'],
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
    icon: 'FaDatabase',
  },
];

export const defaultSkills: Skill[] = [
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
