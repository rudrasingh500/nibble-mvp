import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search vendors or cuisine..."
        className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/80 backdrop-blur-lg
                 border border-white/20 shadow-lg
                 text-gray-800 placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-orange-300
                 transition-all duration-300"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
    </motion.div>
  );
}