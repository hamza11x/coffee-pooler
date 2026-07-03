'use client'

import { motion } from 'framer-motion'

export default function Hamburger({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center focus:outline-none z-[200]"
      aria-label="Toggle Menu"
    >
      <div className="flex flex-col gap-1.5 w-6">
        <motion.span
          animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: 'linear' }}
          className="h-[2px] w-full bg-[#D4AF37] rounded-full origin-center"
        />
        <motion.span
          animate={isOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="h-[2px] w-full bg-[#D4AF37] rounded-full"
        />
        <motion.span
          animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: 'linear' }}
          className="h-[2px] w-full bg-[#D4AF37] rounded-full origin-center"
        />
      </div>
      
      {/* Tactical Glow */}
      <motion.div 
        animate={isOpen ? { opacity: 1, scale: 1.2 } : { opacity: 0, scale: 1 }}
        className="absolute inset-0 bg-[#D4AF37]/10 rounded-full blur-md -z-10"
      />
    </button>
  )
}
