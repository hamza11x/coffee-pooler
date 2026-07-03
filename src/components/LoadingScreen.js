'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'

export default function LoadingScreen({ children }) {
  const [phase, setPhase] = useState('spinning') // spinning, expanding, closing, done
  const transitionPhase = useStore((state) => state.transitionPhase)
  const setIsPortalOpen = useStore((state) => state.setIsPortalOpen)

  // Global transition tracking
  useEffect(() => {
    if (transitionPhase === 'closing') {
      setPhase('closing')
      document.body.style.overflow = 'hidden'
      setIsPortalOpen(false)
    } else if (transitionPhase === 'opening') {
      setPhase('expanding')
      document.body.style.overflow = 'hidden'
      
      // Delay the "Ready" state by 1s as requested for high-end cinematic timing
      const timer = setTimeout(() => {
        setPhase('done')
        setIsPortalOpen(true)
        document.body.style.overflow = '';
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [transitionPhase, setIsPortalOpen])

  // Initial load tracking
  useEffect(() => {
    if (phase === 'spinning') {
      document.body.style.overflow = 'hidden'
      const timer = setTimeout(() => {
        if (transitionPhase === 'idle') setPhase('expanding')
      }, 2000)
      return () => clearTimeout(timer)
    } else if (phase === 'expanding' && transitionPhase === 'idle') {
      const timer = setTimeout(() => {
        setPhase('done')
        setIsPortalOpen(true)
        document.body.style.overflow = '';
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [phase, transitionPhase, setIsPortalOpen])

  return (
    <>
      {/* 
        The Website Content
        Now wrapped in an AnimatePresence container that keeps it HIDDEN
        until the portal is fully expanded (phase === 'done').
      */}
      <div className="relative z-0 min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'done' ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      </div>

      {/* 
        The Portal Overlay 
      */}
      <div 
        className={`fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${phase === 'done' ? 'opacity-0' : 'opacity-100'}`}
      >
          
          {/* Hardware-Accelerated Portal Mask */}
          <motion.div
            className="absolute rounded-full border-[1.5px] border-[#D4AF37]/60"
            style={{ width: 120, height: 120, boxShadow: '0 0 20px rgba(212,175,55,0.4), 0 0 0 300vw black' }}
            initial={{ scale: 1 }}
            animate={{ scale: phase === 'expanding' || phase === 'done' ? 60 : 1 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* The 8-Ball Icon */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ 
              rotate: phase === 'spinning' ? 360 : phase === 'closing' ? 0 : 360,
              opacity: phase === 'expanding' || phase === 'done' ? 0 : 1,
              scale: phase === 'expanding' || phase === 'done' ? 0 : 1
            }}
            transition={{
              rotate: { duration: 2, ease: "linear", repeat: phase === 'spinning' ? Infinity : 0 },
              opacity: { duration: 0.6, ease: "easeInOut" },
              scale: { duration: 0.8, ease: "backIn" }
            }}
            className="pointer-events-none absolute w-[120px] h-[120px] flex items-center justify-center rounded-full border border-white/10"
          >
            <div className="relative w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shadow-[inset_0_-3px_5px_rgba(0,0,0,0.3)]">
              <span className="text-black font-black text-3xl font-sans absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                8
              </span>
            </div>
          </motion.div>
        </div>
    </>
  )
}
