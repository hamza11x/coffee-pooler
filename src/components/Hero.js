'use client'

import { motion } from 'framer-motion'
import TransitionLink from './TransitionLink'
import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

export default function Hero() {
  const { status } = useSession()
  const bgRef = useRef(null)

  useEffect(() => {
    const handleMove = (e) => {
      if (!bgRef.current) return
      const x = (e.clientX / window.innerWidth - 0.5) * 15
      const y = (e.clientY / window.innerHeight - 0.5) * 15
      bgRef.current.style.transform = `translate(${x * -0.4}px, ${y * -0.4}px) scale(1.08)`
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]">

      {/* BACKGROUND */}
      <div ref={bgRef} className="absolute inset-[-8%] z-0 transition-transform duration-1000 ease-out">
        <img src="/hero-bg.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* DARKNESS LAYERS */}
      <div className="absolute inset-0 z-10 bg-black/72" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      {/* Gold center glow */}
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[700px] h-[300px] bg-[#D4AF37]/10 blur-[80px] rounded-full pointer-events-none" />

      {/* ═══════════════ HUD ELEMENTS (MINIMALIST GOLD LINES ONLY) ═══════════════ */}

      {/* TOP LEFT - TACTICAL LINES */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-28 left-8 z-30 space-y-3 opacity-60 hidden md:block"
      >
        <div className="w-1.5 h-1.5 bg-[#D4AF37] mb-4" />
        <div className="w-12 h-[1px] bg-[#D4AF37]" />
        <div className="w-6 h-[1px] bg-[#D4AF37]/40 translate-x-2" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
      </motion.div>

      {/* TOP RIGHT - METRIC LINES */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute top-28 right-8 z-30 flex flex-col items-end gap-3 opacity-60 hidden md:flex"
      >
        <div className="w-1.5 h-1.5 bg-[#D4AF37] mb-2" />
        <div className="h-[1px] w-24 bg-gradient-to-l from-[#D4AF37] to-transparent" />
        <div className="h-[1px] w-16 bg-gradient-to-l from-[#D4AF37]/40 to-transparent" />
      </motion.div>

      {/* LEFT CENTER - Vertical gold rule */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 0.6 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute left-10 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 origin-center opacity-60 hidden md:flex"
      >
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent" />
        <motion.div
          animate={{ rotate: 45 }}
          className="w-4 h-4 border border-[#D4AF37] rotate-45 shadow-[0_0_10px_rgba(212,175,55,0.2)]"
        />
        <div className="w-[1px] h-24 bg-gradient-to-t from-transparent via-[#D4AF37] to-transparent" />
      </motion.div>

      {/* RIGHT CENTER - SCANNER ELEMENT */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 opacity-60 hidden md:flex">
         <motion.div 
           animate={{ height: [0, 150, 0] }}
           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
           className="w-[1px] bg-gradient-to-b from-[#D4AF37] to-[#D4AF37]/20" 
         />
         <div className="w-1 h-1 bg-[#D4AF37]" />
      </div>

      {/* BOTTOM LEFT - ANCHOR LINES */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-20 left-10 z-30 opacity-60 hidden md:block"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 border border-[#D4AF37]" />
          <div className="w-16 h-[1px] bg-[#D4AF37]/40" />
        </div>
      </motion.div>

      {/* BOTTOM RIGHT - TARGETING RETICLE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="absolute bottom-16 right-10 z-30 opacity-60 hidden md:block"
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border border-[#D4AF37] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.1)]" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-[1px] h-full bg-[#D4AF37]/20" />
             <div className="h-[1px] w-full bg-[#D4AF37]/20 absolute" />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[6px] border border-dashed border-[#D4AF37]/20 rounded-full" 
          />
        </div>
      </motion.div>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div className="relative z-30 flex flex-col items-center text-center px-6">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex items-center gap-6 mb-10"
        >
          <div className="w-12 h-[1px] bg-[#D4AF37]/30" />
          <span className="text-[#D4AF37]/70 text-[10px] font-mono tracking-[0.6em] uppercase">
            Elite Arena · Luxury Gaming
          </span>
          <div className="w-12 h-[1px] bg-[#D4AF37]/30" />
        </motion.div>

        {/* BIG TITLE */}
        <div className="overflow-hidden mb-8">
          <motion.h1
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black uppercase tracking-tight leading-none text-white"
            style={{ fontSize: 'clamp(2.5rem, 12vw, 8.5rem)' }}
          >
            ARNADA
            <span className="text-transparent ml-5" style={{ WebkitTextStroke: '2px rgba(212,175,55,0.6)' }}>
              POOL
            </span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="text-white/30 text-[11px] tracking-[0.4em] uppercase font-light mb-16 max-w-lg leading-relaxed"
        >
          Master the rack · Rule the arena · Claim your legacy
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="flex flex-wrap justify-center gap-6"
        >
          <TransitionLink href="/tournaments" className="group relative overflow-hidden inline-block">
            <div className="relative px-14 py-6 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 group-hover:bg-white transition-all duration-500">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '220%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative">Enter Arena</span>
              <motion.span className="relative" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </div>
          </TransitionLink>

          {status !== 'authenticated' && (
            <TransitionLink href="/register" className="inline-block group">
              <div className="px-14 py-6 border border-white/10 bg-white/[0.03] backdrop-blur-md text-white/50 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 transition-all duration-500 hover:border-[#D4AF37]/50 hover:text-white hover:bg-[#D4AF37]/10">
                <span>Register Agent</span>
              </div>
            </TransitionLink>
          )}
        </motion.div>
      </div>

      {/* SCAN LINE SWEEP */}
      <motion.div
        className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent z-20 pointer-events-none"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-20 bg-gradient-to-t from-[#050505] to-transparent" />
    </section>
  )
}
