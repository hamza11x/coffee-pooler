'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TransitionLink from '@/components/TransitionLink'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'

export default function RegisterPage() {
  const isPortalOpen = useStore((state) => state.isPortalOpen)
  const setTransitionPhase = useStore((state) => state.setTransitionPhase)
  const setIsPortalOpen = useStore((state) => state.setIsPortalOpen)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })

      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        setSuccessMsg(data.message)
        setUsername('')
        setEmail('')
        setPassword('')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      setLoading(false)
      setError('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-6 pt-24 md:pt-32 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isPortalOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="glass-card p-6 md:p-12 w-full max-w-md border-t-2 border-[#D4AF37]"
      >
        <div className="text-center mb-10">
          <div className="font-display text-[#D4AF37] text-2xl tracking-[0.3em] mb-1">ARNADA</div>
          <div className="text-white/20 text-[10px] uppercase tracking-[0.4em]">Pool Cafe</div>
        </div>
        
        <h1 className="text-xl md:text-3xl text-white mb-8 text-center font-display font-black tracking-tight uppercase">Join the Elite</h1>
        
        {error && <p className="text-red-500 mb-6 text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}
        {successMsg && <p className="text-[#D4AF37] mb-6 text-sm text-center bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-4 rounded font-bold">{successMsg}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/40 text-xs mb-2 uppercase tracking-widest font-bold">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-white/5 border border-white/10 p-4 focus:border-[#D4AF37] outline-none text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs mb-2 uppercase tracking-widest font-bold">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-white/5 border border-white/10 p-4 focus:border-[#D4AF37] outline-none text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs mb-2 uppercase tracking-widest font-bold">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-white/5 border border-white/10 p-4 focus:border-[#D4AF37] outline-none text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="group relative w-full overflow-hidden inline-block"
          >
            <div className="relative w-full py-6 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 group-hover:bg-white transition-all duration-500">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '220%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative">CREATE ACCOUNT</span>
              <motion.span className="relative" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </div>
          </button>
        </form>

        <p className="mt-8 text-center text-white/40 text-sm">
          Already a member? <TransitionLink href="/login" className="text-[#D4AF37] hover:underline">Login</TransitionLink>
        </p>
      </motion.div>
    </div>
  )
}
