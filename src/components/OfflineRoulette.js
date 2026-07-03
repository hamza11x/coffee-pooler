'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Target } from 'lucide-react'

export default function OfflineRoulette({ players, onSelect, isSpinning, onComplete }) {
  const [displayPlayers, setDisplayPlayers] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    // Large buffer for smooth spin without running out of names
    if (players.length > 0) {
      const repeated = Array(40).fill(players).flat()
      setDisplayPlayers(repeated)
    }
  }, [players])

  useEffect(() => {
    if (isSpinning) {
      // Pick a random target in the middle-end section of the buffer
      const randomOffset = Math.floor(Math.random() * players.length)
      const targetIndex = players.length * 25 + randomOffset

      setSelectedIndex(targetIndex)

      const timer = setTimeout(() => {
        onComplete(players[randomOffset])
      }, 7000) // Match the 7s heavy spin duration

      return () => clearTimeout(timer)
    } else {
      // Reset position when not spinning
      setSelectedIndex(0)
    }
  }, [isSpinning, players, onComplete])

  if (players.length === 0) return null

  return (
    <div className="relative w-full h-[400px] bg-black/40 border border-white/5 rounded-xl overflow-hidden glass-card">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      {/* Target Rect */}
      <div className="absolute top-1/2 left-0 w-full h-20 -translate-y-1/2 border-y border-[#D4AF37]/30 bg-[#D4AF37]/5 z-10 flex items-center justify-between px-10">
        <div className="flex items-center gap-4">
          <Target size={24} className="text-[#D4AF37] animate-pulse" />
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37]">Acquiring Target</div>
        </div>
        <div className="w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
      </div>

      {/* Scrolling List */}
      <div className="relative h-full overflow-hidden">
        <motion.div
          animate={{
            y: isSpinning ? -(selectedIndex * 80) + 160 : 160,
          }}
          initial={{ y: 160 }}
          transition={{
            duration: isSpinning ? 7 : 0.8, // 7 seconds for massive weight
            ease: isSpinning ? [0.15, 0, 0.15, 1] : "backOut" // Custom "Heavy Mechanical Friction" easing
          }}
          className="flex flex-col items-center"
        >
          {displayPlayers.map((name, i) => {
            const isWinner = !isSpinning && i === selectedIndex
            return (
              <div
                key={i}
                className={`h-20 flex items-center justify-center text-2xl md:text-4xl font-display font-black uppercase tracking-widest transition-all duration-700 ${isWinner ? 'text-[#D4AF37] scale-125 blur-none drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]' :
                    isSpinning && i === selectedIndex ? 'text-[#D4AF37] blur-none' : 'text-white/10 blur-[2px]'
                  }`}
              >
                {name}
                {isWinner && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 border-2 border-[#D4AF37] rounded-lg"
                  />
                )}
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Decorative Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute left-10 h-full w-[1px] bg-white/5" />
        <div className="absolute right-10 h-full w-[1px] bg-white/5" />
      </div>
    </div>
  )
}
