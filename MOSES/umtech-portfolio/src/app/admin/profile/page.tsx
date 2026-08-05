'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  FaCamera, FaPlus, FaTrash, FaGithub, FaLinkedin,
  FaTwitter, FaInstagram, FaDribbble, FaBehance,
  FaYoutube, FaGlobe, FaSave, FaCheckCircle, FaSpinner
} from 'react-icons/fa';

interface Skill { name: string; level: number }
interface Education { degree: string; institution: string; year: string; description: string }
interface Experience { title: string; company: string; period: string; description: string }

const socialPlatforms = [
  { key: 'github', label: 'GitHub', icon: FaGithub, placeholder: 'https://github.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter', label: 'Twitter', icon: FaTwitter, placeholder: 'https://twitter.com/username' },
  { key: 'instagram', label: 'Instagram', icon: FaInstagram, placeholder: 'https://instagram.com/username' },
  { key: 'dribbble', label: 'Dribbble', icon: FaDribbble, placeholder: 'https://dribbble.com/username' },
  { key: 'behance', label: 'Behance', icon: FaBehance, placeholder: 'https://behance.net/username' },
  { key: 'youtube', label: 'YouTube', icon: FaYoutube, placeholder: 'https://youtube.com/@username' },
  { key: 'website', label: 'Website', icon: FaGlobe, placeholder: 'https://yoursite.com' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'Uwiringiyimana Moise',
    position: 'Full-Stack Developer & UI/UX Designer',
    bio: '',
    email: user?.email || 'uwiringiyimanamoise299@gmail.com',
    phone: '',
    location: '',
    photo: '',
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);

  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    github: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    youtube: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/profile');
      if (res.ok) {
        const data = await res.json();
        const p = data.profile;
        if (p) {
          setProfile({
            name: p.name || profile.name,
            position: p.position || profile.position,
            bio: p.bio || '',
            email: p.email || profile.email,
            phone: p.phone || '',
            location: p.location || '',
            photo: p.photo || '',
          });
          setSkills(p.skills || []);
          setEducation(p.education || []);
          setExperience(p.experience || []);
          setSocialLinks((prev) => ({ ...prev, ...(p.socialLinks || {}) }));
        }
      }
    } catch {
      console.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const [editingEducation, setEditingEducation] = useState<Education>({ degree: '', institution: '', year: '', description: '' });
  const [editingExperience, setEditingExperience] = useState<Experience>({ title: '', company: '', period: '', description: '' });
  const [showEduForm, setShowEduForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          position: profile.position,
          bio: profile.bio,
          photo: profile.photo,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          skills,
          education,
          experience,
          socialLinks,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      console.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.find(s => s.name.toLowerCase() === newSkill.trim().toLowerCase())) {
      setSkills([...skills, { name: newSkill.trim(), level: 50 }]);
      setNewSkill('');
    }
  };

  const removeSkill = (name: string) => setSkills(skills.filter(s => s.name !== name));

  const updateSkillLevel = (name: string, level: number) =>
    setSkills(skills.map(s => s.name === name ? { ...s, level } : s));

  const addEducation = () => {
    if (editingEducation.degree && editingEducation.institution) {
      setEducation([...education, editingEducation]);
      setEditingEducation({ degree: '', institution: '', year: '', description: '' });
      setShowEduForm(false);
    }
  };

  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));

  const addExperience = () => {
    if (editingExperience.title && editingExperience.company) {
      setExperience([...experience, editingExperience]);
      setEditingExperience({ title: '', company: '', period: '', description: '' });
      setShowExpForm(false);
    }
  };

  const removeExperience = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your personal information</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {saved ? 'Saved!' : 'Save Changes'}</>}
        </button>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
        >
          <FaCheckCircle /> Profile updated successfully!
        </motion.div>
      )}

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Personal Information</h2>
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                {profile.photo ? (
                  <img src={profile.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <FaCamera className="text-white text-xl" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setProfile({ ...profile, photo: ev.target?.result as string });
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </div>
            <p className="text-xs text-gray-500">Click to upload photo</p>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Name', value: profile.name, key: 'name' },
              { label: 'Position', value: profile.position, key: 'position' },
              { label: 'Email', value: profile.email, key: 'email', type: 'email' },
              { label: 'Phone', value: profile.phone, key: 'phone' },
              { label: 'Location', value: profile.location, key: 'location' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-gray-500 mb-1.5">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  value={field.value}
                  onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1.5">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Skills</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          {skills.map((skill) => (
            <div key={skill.name} className="group relative px-4 py-2 rounded-xl bg-glass border border-glass-border">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">{skill.name}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.level}
                  onChange={(e) => updateSkillLevel(skill.name, Number(e.target.value))}
                  className="w-20 h-1 accent-primary"
                />
                <span className="text-[10px] text-primary font-mono">{skill.level}%</span>
                <button onClick={() => removeSkill(skill.name)} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <FaTrash size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
            placeholder="Add a skill..."
          />
          <button onClick={addSkill} className="btn-primary text-sm py-2.5">
            <FaPlus /> Add
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Social Media Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialPlatforms.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="relative">
              <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="url"
                value={socialLinks[key] || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Education</h2>
          <button onClick={() => setShowEduForm(true)} className="btn-secondary text-sm">
            <FaPlus /> Add Education
          </button>
        </div>
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-glass border border-glass-border">
              <div>
                <h3 className="text-sm font-medium text-white">{edu.degree}</h3>
                <p className="text-xs text-gray-400">{edu.institution} | {edu.year}</p>
                {edu.description && <p className="text-xs text-gray-500 mt-1">{edu.description}</p>}
              </div>
              <button onClick={() => removeEducation(i)} className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
        {showEduForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-xl bg-glass border border-glass-border space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Degree" value={editingEducation.degree} onChange={(e) => setEditingEducation({ ...editingEducation, degree: e.target.value })} className="px-4 py-2.5 rounded-xl bg-dark-bg border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50" />
              <input type="text" placeholder="Institution" value={editingEducation.institution} onChange={(e) => setEditingEducation({ ...editingEducation, institution: e.target.value })} className="px-4 py-2.5 rounded-xl bg-dark-bg border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50" />
              <input type="text" placeholder="Year" value={editingEducation.year} onChange={(e) => setEditingEducation({ ...editingEducation, year: e.target.value })} className="px-4 py-2.5 rounded-xl bg-dark-bg border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <textarea placeholder="Description" value={editingEducation.description} onChange={(e) => setEditingEducation({ ...editingEducation, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEduForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
              <button onClick={addEducation} className="btn-primary text-sm py-2">Save</button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Experience</h2>
          <button onClick={() => setShowExpForm(true)} className="btn-secondary text-sm">
            <FaPlus /> Add Experience
          </button>
        </div>
        <div className="space-y-3">
          {experience.map((exp, i) => (
            <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-glass border border-glass-border">
              <div>
                <h3 className="text-sm font-medium text-white">{exp.title}</h3>
                <p className="text-xs text-gray-400">{exp.company} | {exp.period}</p>
                {exp.description && <p className="text-xs text-gray-500 mt-1">{exp.description}</p>}
              </div>
              <button onClick={() => removeExperience(i)} className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
        {showExpForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-xl bg-glass border border-glass-border space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Title" value={editingExperience.title} onChange={(e) => setEditingExperience({ ...editingExperience, title: e.target.value })} className="px-4 py-2.5 rounded-xl bg-dark-bg border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50" />
              <input type="text" placeholder="Company" value={editingExperience.company} onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })} className="px-4 py-2.5 rounded-xl bg-dark-bg border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50" />
              <input type="text" placeholder="Period" value={editingExperience.period} onChange={(e) => setEditingExperience({ ...editingExperience, period: e.target.value })} className="px-4 py-2.5 rounded-xl bg-dark-bg border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <textarea placeholder="Description" value={editingExperience.description} onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowExpForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
              <button onClick={addExperience} className="btn-primary text-sm py-2">Save</button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
