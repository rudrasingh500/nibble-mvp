import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        "backdrop-blur-lg bg-white/80 rounded-2xl shadow-lg",
        "border border-white/20",
        "transition-all duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
}