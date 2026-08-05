import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ========== Types ==========

export interface UserRecord {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user';
  createdAt: string;
}

export interface AdminRecord {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export interface StoredMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  reply?: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
}

export interface LikesData {
  [itemId: string]: number;
}

export interface SharesData {
  [itemId: string]: number;
}

export interface StoredProject {
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
  comments: number;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  date: string;
  createdAt: string;
}

export interface StoredPost {
  id: string;
  content: string;
  images: string[];
  videoUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
  likes: number;
  shares: number;
  comments: number;
  createdAt: string;
  scheduledAt?: string;
  pinned: boolean;
}

export interface StoredProfile {
  name: string;
  position: string;
  bio: string;
  photo: string;
  email: string;
  phone: string;
  location: string;
  skills: Array<{ name: string; level: number }>;
  education: Array<{ degree: string; institution: string; year: string; description: string }>;
  experience: Array<{ title: string; company: string; period: string; description: string }>;
  socialLinks: Record<string, string>;
}

export interface StoredSettings {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  theme: 'dark' | 'light';
  seoTitle: string;
  seoDescription: string;
  metaTags: string;
  googleAnalyticsId: string;
  emailHost: string;
  emailPort: string;
  emailUser: string;
  emailPass: string;
  maintenanceMode: boolean;
}

export interface VisitorData {
  totalVisits: number;
  uniqueVisitors: string[];
  dailyVisits: Record<string, number>;
  lastVisit: string;
  monthlyVisits: Record<string, number>;
}

export interface StoredServiceRequest {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  serviceTitle: string;
  description: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'reviewing';
  adminResponse: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========== Helpers ==========

function colRef(name: string) {
  return collection(db, name);
}

function docRef(colName: string, id: string) {
  return doc(db, colName, id);
}

async function getAllDocs<T>(colName: string): Promise<T[]> {
  const snap = await getDocs(colRef(colName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

// ========== Users ==========

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const all = await getAllDocs<UserRecord>('users');
  return all.find((u) => u.email === email) || null;
}

export async function registerUser(data: { name: string; email: string; passwordHash: string; uid?: string }): Promise<UserRecord> {
  const existing = await getUserByEmail(data.email);
  if (existing) throw new Error('A user with this email already exists');
  const user: UserRecord = {
    uid: data.uid || crypto.randomUUID(),
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  await setDoc(docRef('users', user.uid), user);
  return user;
}

export async function getAllUsers(): Promise<UserRecord[]> {
  return getAllDocs<UserRecord>('users');
}

export async function deleteUser(uid: string): Promise<boolean> {
  const d = docRef('users', uid);
  const snap = await getDoc(d);
  if (!snap.exists()) return false;
  await deleteDoc(d);
  return true;
}

export async function updateUser(uid: string, data: { name?: string; email?: string }): Promise<UserRecord | null> {
  const d = docRef('users', uid);
  const snap = await getDoc(d);
  if (!snap.exists()) return null;
  await updateDoc(d, data as DocumentData);
  const updated = await getDoc(d);
  return { id: updated.id, ...updated.data() } as unknown as UserRecord;
}

// ========== Admins ==========

export async function getAdminByEmail(email: string): Promise<AdminRecord | null> {
  const all = await getAllDocs<AdminRecord>('admins');
  return all.find((a) => a.email === email) || null;
}

export async function getAdminByUid(uid: string): Promise<AdminRecord | null> {
  const snap = await getDoc(docRef('admins', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as AdminRecord;
}

export async function registerAdmin(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'superadmin';
}): Promise<AdminRecord> {
  const admin: AdminRecord = {
    uid: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role,
    createdAt: new Date().toISOString(),
  };
  await setDoc(docRef('admins', admin.uid), admin);
  return admin;
}

export async function getAllAdmins(): Promise<AdminRecord[]> {
  return getAllDocs<AdminRecord>('admins');
}

export async function upsertAdmin(admin: AdminRecord): Promise<void> {
  await setDoc(docRef('admins', admin.uid), admin, { merge: true });
}

// ========== Messages ==========

export async function saveMessage(data: Omit<StoredMessage, 'id' | 'read' | 'replied' | 'createdAt'>): Promise<StoredMessage> {
  const id = crypto.randomUUID();
  const message: StoredMessage = {
    id,
    ...data,
    read: false,
    replied: false,
    createdAt: new Date().toISOString(),
  };
  await setDoc(docRef('messages', id), message);
  return message;
}

export async function getAllMessages(): Promise<StoredMessage[]> {
  return getAllDocs<StoredMessage>('messages');
}

export async function updateMessage(id: string, data: Partial<StoredMessage>): Promise<StoredMessage | null> {
  const d = docRef('messages', id);
  const snap = await getDoc(d);
  if (!snap.exists()) return null;
  await updateDoc(d, data as DocumentData);
  const updated = await getDoc(d);
  return { id: updated.id, ...updated.data() } as unknown as StoredMessage;
}

export async function deleteMessage(id: string): Promise<boolean> {
  const d = docRef('messages', id);
  const snap = await getDoc(d);
  if (!snap.exists()) return false;
  await deleteDoc(d);
  return true;
}

// ========== Posts ==========

export async function getPosts(): Promise<StoredPost[]> {
  return getAllDocs<StoredPost>('posts');
}

export async function getPost(id: string): Promise<StoredPost | null> {
  const snap = await getDoc(docRef('posts', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as StoredPost;
}

export async function createPost(data: Omit<StoredPost, 'id' | 'createdAt'>): Promise<StoredPost> {
  const id = crypto.randomUUID();
  const post: StoredPost = {
    id,
    ...data,
    createdAt: new Date().toISOString(),
  };
  await setDoc(docRef('posts', id), post);
  return post;
}

export async function updatePost(id: string, data: Partial<StoredPost>): Promise<StoredPost | null> {
  const d = docRef('posts', id);
  const snap = await getDoc(d);
  if (!snap.exists()) return null;
  await updateDoc(d, data as DocumentData);
  const updated = await getDoc(d);
  return { id: updated.id, ...updated.data() } as unknown as StoredPost;
}

export async function deletePost(id: string): Promise<boolean> {
  const d = docRef('posts', id);
  const snap = await getDoc(d);
  if (!snap.exists()) return false;
  await deleteDoc(d);
  return true;
}

// ========== Projects ==========

export async function getProjects(): Promise<StoredProject[]> {
  return getAllDocs<StoredProject>('projects');
}

export async function getProject(id: string): Promise<StoredProject | null> {
  const snap = await getDoc(docRef('projects', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as StoredProject;
}

export async function createProject(data: Omit<StoredProject, 'id' | 'createdAt'>): Promise<StoredProject> {
  const id = crypto.randomUUID();
  const project: StoredProject = {
    id,
    ...data,
    likes: data.likes ?? 0,
    shares: data.shares ?? 0,
    comments: data.comments ?? 0,
    createdAt: new Date().toISOString(),
  };
  await setDoc(docRef('projects', id), project);
  return project;
}

export async function updateProject(id: string, data: Partial<StoredProject>): Promise<StoredProject | null> {
  const d = docRef('projects', id);
  const snap = await getDoc(d);
  if (!snap.exists()) return null;
  await updateDoc(d, data as DocumentData);
  const updated = await getDoc(d);
  return { id: updated.id, ...updated.data() } as unknown as StoredProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  const d = docRef('projects', id);
  const snap = await getDoc(d);
  if (!snap.exists()) return false;
  await deleteDoc(d);
  return true;
}

// ========== Comments ==========

export async function getPostComments(postId: string): Promise<PostComment[]> {
  const all = await getAllDocs<PostComment>('post-comments');
  return all.filter((c) => c.postId === postId);
}

export async function addPostComment(data: Omit<PostComment, 'id' | 'createdAt'>): Promise<PostComment> {
  const id = crypto.randomUUID();
  const comment: PostComment = {
    id,
    ...data,
    createdAt: new Date().toISOString(),
  };
  await setDoc(docRef('post-comments', id), comment);
  return comment;
}

export async function getProjectComments(projectId: string): Promise<ProjectComment[]> {
  const all = await getAllDocs<ProjectComment>('project-comments');
  return all.filter((c) => c.projectId === projectId);
}

export async function addProjectComment(data: Omit<ProjectComment, 'id' | 'createdAt'>): Promise<ProjectComment> {
  const id = crypto.randomUUID();
  const comment: ProjectComment = {
    id,
    ...data,
    createdAt: new Date().toISOString(),
  };
  await setDoc(docRef('project-comments', id), comment);
  return comment;
}

// ========== Likes & Shares ==========

export async function getLikes(type: 'posts' | 'projects'): Promise<LikesData> {
  const colName = `${type}-likes`;
  const snap = await getDoc(docRef(colName, 'data'));
  if (!snap.exists()) return {};
  return snap.data() as LikesData;
}

export async function toggleLike(type: 'posts' | 'projects', itemId: string, increment: boolean): Promise<number> {
  const colName = `${type}-likes`;
  const d = docRef(colName, 'data');
  const snap = await getDoc(d);
  const likes: LikesData = snap.exists() ? (snap.data() as LikesData) : {};
  const current = likes[itemId] || 0;
  likes[itemId] = increment ? current + 1 : Math.max(0, current - 1);
  await setDoc(d, likes);
  return likes[itemId];
}

export async function getShares(type: 'posts' | 'projects'): Promise<SharesData> {
  const colName = `${type}-shares`;
  const snap = await getDoc(docRef(colName, 'data'));
  if (!snap.exists()) return {};
  return snap.data() as SharesData;
}

export async function incrementShare(type: 'posts' | 'projects', itemId: string): Promise<number> {
  const colName = `${type}-shares`;
  const d = docRef(colName, 'data');
  const snap = await getDoc(d);
  const shares: SharesData = snap.exists() ? (snap.data() as SharesData) : {};
  shares[itemId] = (shares[itemId] || 0) + 1;
  await setDoc(d, shares);
  return shares[itemId];
}

// ========== Profile ==========

const defaultProfile: StoredProfile = {
  name: 'Uwiringiyimana Moise',
  position: 'Full-Stack Developer & UI/UX Designer',
  bio: '',
  photo: '',
  email: 'uwiringiyimanamoise299@gmail.com',
  phone: '0795552517',
  location: 'Menge, Muhoza, Musanze, Rwanda',
  skills: [],
  education: [],
  experience: [],
  socialLinks: {},
};

export async function getProfile(): Promise<StoredProfile> {
  const snap = await getDoc(docRef('config', 'profile'));
  if (!snap.exists()) return defaultProfile;
  return snap.data() as StoredProfile;
}

export async function saveProfile(data: StoredProfile): Promise<void> {
  await setDoc(docRef('config', 'profile'), data);
}

// ========== Settings ==========

const defaultSettings: StoredSettings = {
  siteName: 'UMTECH',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  theme: 'dark',
  seoTitle: 'UMTECH - Full-Stack Developer & UI/UX Designer',
  seoDescription: '',
  metaTags: '',
  googleAnalyticsId: '',
  emailHost: 'smtp.gmail.com',
  emailPort: '587',
  emailUser: '',
  emailPass: '',
  maintenanceMode: false,
};

export async function getSettings(): Promise<StoredSettings> {
  const snap = await getDoc(docRef('config', 'settings'));
  if (!snap.exists()) return defaultSettings;
  return snap.data() as StoredSettings;
}

export async function saveSettings(data: StoredSettings): Promise<void> {
  await setDoc(docRef('config', 'settings'), data);
}

// ========== Visitors ==========

const defaultVisitorData: VisitorData = {
  totalVisits: 0,
  uniqueVisitors: [],
  dailyVisits: {},
  lastVisit: '',
  monthlyVisits: {},
};

export async function getVisitorData(): Promise<VisitorData> {
  const snap = await getDoc(docRef('config', 'visitors'));
  if (!snap.exists()) return defaultVisitorData;
  return snap.data() as VisitorData;
}

export async function recordVisit(ip: string): Promise<VisitorData> {
  const data = await getVisitorData();
  data.totalVisits += 1;
  data.lastVisit = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  data.dailyVisits[today] = (data.dailyVisits[today] || 0) + 1;
  const month = today.substring(0, 7);
  data.monthlyVisits[month] = (data.monthlyVisits[month] || 0) + 1;
  if (!data.uniqueVisitors.includes(ip)) {
    data.uniqueVisitors.push(ip);
  }
  await setDoc(docRef('config', 'visitors'), data);
  return data;
}

// ========== Service Requests ==========

export async function getServiceRequests(): Promise<StoredServiceRequest[]> {
  return getAllDocs<StoredServiceRequest>('service-requests');
}

export async function getServiceRequest(id: string): Promise<StoredServiceRequest | null> {
  const snap = await getDoc(docRef('service-requests', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as StoredServiceRequest;
}

export async function getServiceRequestsByUser(uid: string): Promise<StoredServiceRequest[]> {
  const all = await getServiceRequests();
  return all.filter((r) => r.uid === uid);
}

export async function createServiceRequest(
  data: Omit<StoredServiceRequest, 'id' | 'status' | 'adminResponse' | 'read' | 'createdAt' | 'updatedAt'>
): Promise<StoredServiceRequest> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const request: StoredServiceRequest = {
    id,
    ...data,
    status: 'pending',
    adminResponse: '',
    read: false,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(docRef('service-requests', id), request);
  return request;
}

export async function updateServiceRequest(id: string, data: Partial<StoredServiceRequest>): Promise<StoredServiceRequest | null> {
  const d = docRef('service-requests', id);
  const snap = await getDoc(d);
  if (!snap.exists()) return null;
  const updated = { ...data, updatedAt: new Date().toISOString() };
  await updateDoc(d, updated as DocumentData);
  const result = await getDoc(d);
  return { id: result.id, ...result.data() } as unknown as StoredServiceRequest;
}

export async function deleteServiceRequest(id: string): Promise<boolean> {
  const d = docRef('service-requests', id);
  const snap = await getDoc(d);
  if (!snap.exists()) return false;
  await deleteDoc(d);
  return true;
}

// ========== Admin Stats ==========

export async function getAdminStats() {
  const [messages, projects, posts, visitors, users, serviceRequests] = await Promise.all([
    getAllMessages(),
    getProjects(),
    getPosts(),
    getVisitorData(),
    getAllUsers(),
    getServiceRequests(),
  ]);

  return {
    totalVisitors: visitors.totalVisits,
    uniqueVisitors: visitors.uniqueVisitors.length,
    totalProjects: projects.length,
    featuredProjects: projects.filter((p) => p.featured).length,
    totalPosts: posts.length,
    totalMessages: messages.length,
    unreadMessages: messages.filter((m) => !m.read).length,
    totalUsers: users.length,
    totalServiceRequests: serviceRequests.length,
    pendingServiceRequests: serviceRequests.filter((r) => r.status === 'pending').length,
    completedServiceRequests: serviceRequests.filter((r) => r.status === 'completed').length,
    totalRevenue: serviceRequests.filter((r) => r.status === 'accepted').reduce((sum, r) => sum + r.amount, 0),
    dailyVisits: visitors.dailyVisits,
    monthlyVisits: visitors.monthlyVisits,
    recentMessages: messages.slice(-5).reverse(),
    recentProjects: projects.slice(-5).reverse(),
    recentServiceRequests: serviceRequests.slice(-5).reverse(),
  };
}
