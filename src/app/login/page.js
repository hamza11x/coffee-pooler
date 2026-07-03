'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import TransitionLink from '@/components/TransitionLink'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Mail } from 'lucide-react'

export default function LoginPage() {
  const isPortalOpen = useStore((state) => state.isPortalOpen)
  const setTransitionPhase = useStore((state) => state.setTransitionPhase)
  const setIsPortalOpen = useStore((state) => state.setIsPortalOpen)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [unverified, setUnverified] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUnverified(false)

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    setLoading(false)

    if (result?.error === 'EMAIL_NOT_VERIFIED') {
      setUnverified(true)
    } else if (result?.error === 'TOO_MANY_ATTEMPTS') {
      setError('Too many login attempts. Please wait 10 minutes and try again.')
    } else if (result?.error) {
      setError('Invalid email or password.')
    } else {
      setIsPortalOpen(false)
      setTimeout(() => {
        setTransitionPhase('closing')
        setTimeout(() => {
          router.push('/')
          router.refresh()
          setTimeout(() => setTransitionPhase('opening'), 1050)
        }, 1200)
      }, 800)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-6 pt-24 md:pt-32 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-[#D4AF37]/4 blur-[120px]" />
      </div>

      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isPortalOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-card p-6 md:p-10 border-t-2 border-[#D4AF37]">

          {/* Logo */}
          <div className="text-center mb-8 md:mb-10">
            <div className="font-display text-[#D4AF37] text-xl md:text-2xl tracking-[0.3em] mb-1">ARNADA</div>
            <div className="text-white/20 text-[9px] md:text-[10px] uppercase tracking-[0.4em]">Pool Cafe</div>
          </div>

          <h1 className="font-display text-lg text-white text-center mb-8 tracking-widest">
            Sign In
          </h1>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 mb-6 text-xs text-center bg-red-500/8 border border-red-500/20 px-4 py-3 rounded-sm"
            >
              {error}
            </motion.p>
          )}

          {unverified && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-orange-500/10 border border-orange-500/20 p-4 rounded-sm flex items-start gap-3"
            >
              <Mail className="text-orange-400 shrink-0 mt-0.5" size={16} />
              <div className="text-left">
                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">Email Not Verified</p>
                <p className="text-orange-400/80 text-[10px] leading-relaxed">Please check your inbox and verify your email before logging in.</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/30 text-[10px] uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="contact-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-white/30 text-[10px] uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="contact-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden inline-block disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative w-full py-5 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 group-hover:bg-white transition-all duration-500">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                  animate={{ x: ['-100%', '220%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                />
                <span className="relative uppercase">{loading ? 'AUTHENTICATING...' : 'ENTER LOUNGE'}</span>
                <motion.span className="relative" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
              </div>
            </button>
          </form>

          {status !== 'authenticated' && (
            <p className="mt-8 text-center text-white/30 text-xs">
              New here?{' '}
              <TransitionLink href="/register" className="text-[#D4AF37] hover:text-white transition-colors">
                Create an account
              </TransitionLink>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
