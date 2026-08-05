export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  coverImage: string;
  screenshots: string[];
  technologies: string[];
  category: string;
  status: 'completed' | 'in-progress' | 'coming-soon';
  featured: boolean;
  pinned: boolean;
  likes: number;
  shares: number;
  comments: Comment[];
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  date: string;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  images: string[];
  videoUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
  likes: number;
  shares: number;
  comments: Comment[];
  createdAt: string;
  scheduledAt?: string;
  pinned: boolean;
}

export interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  country: string;
  photo: string;
  rating: number;
  comment: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  icon: string;
}

export interface Skill {
  name: string;
  level: number;
  icon: string;
  category: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface SiteSettings {
  siteName: string;
  logo: string;
  favicon: string;
  theme: 'light' | 'dark' | 'system';
  seoTitle: string;
  seoDescription: string;
  googleAnalyticsId: string;
  metaTags: string;
  emailSettings: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  maintenanceMode: boolean;
}

export interface Profile {
  name: string;
  position: string;
  bio: string;
  photo: string;
  resume: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  projectsCompleted: number;
  happyClients: number;
  technologies: number;
  education: Education[];
  experienceList: Experience[];
  missions: string[];
  visions: string[];
  skills: Skill[];
  socialLinks: SocialLink[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  description: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface DashboardStats {
  visitors: number;
  projects: number;
  posts: number;
  messages: number;
  users: number;
  views: number;
  likes: number;
  shares: number;
  downloads: number;
}

export interface ServiceRequest {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  serviceTitle: string;
  description: string;
  amount: number;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  adminResponse: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin' | 'user';
  photoURL: string;
  createdAt: string;
}
