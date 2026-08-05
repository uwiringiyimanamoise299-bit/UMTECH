'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-full glass text-foreground cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 180, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="flex items-center justify-center"
      >
        {theme === 'dark' ? (
          <FiSun className="h-5 w-5 text-yellow-400" />
        ) : (
          <FiMoon className="h-5 w-5 text-indigo-400" />
        )}
      </motion.div>
      <span className="absolute inset-0 rounded-full bg-primary/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
    </motion.button>
  );
}
