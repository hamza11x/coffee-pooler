'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'

function VerifiedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const success = searchParams.get('success') === 'true'
  const already = searchParams.get('already') === 'true'
  const error = searchParams.get('error')

  const isSuccess = success || already

  const config = {
    success: {
      icon: <CheckCircle2 size={56} className="text-[#D4AF37]" />,
      title: 'Account Verified',
      subtitle: 'Your email has been confirmed.',
      message: 'You are now cleared to enter the lounge. Welcome to ARNADA POOL.',
      btnLabel: 'Continue to Login',
    },
    already: {
      icon: <CheckCircle2 size={56} className="text-[#D4AF37]" />,
      title: 'Already Verified',
      subtitle: 'This account is already active.',
      message: 'Your email was previously confirmed. Proceed to login.',
      btnLabel: 'Go to Login',
    },
    expired_token: {
      icon: <Clock size={56} className="text-orange-400" />,
      title: 'Link Expired',
      subtitle: 'This verification link has expired.',
      message: 'Verification links are valid for 24 hours. Please register again to receive a new link.',
      btnLabel: 'Back to Register',
      btnHref: '/register',
    },
    invalid_token: {
      icon: <XCircle size={56} className="text-red-500" />,
      title: 'Invalid Link',
      subtitle: 'This verification link is not valid.',
      message: 'The link may have already been used or is incorrect. Please register again.',
      btnLabel: 'Back to Register',
      btnHref: '/register',
    },
    missing_token: {
      icon: <XCircle size={56} className="text-red-500" />,
      title: 'Invalid Link',
      subtitle: 'Missing verification data.',
      message: 'This link appears to be malformed. Please check your email and try again.',
      btnLabel: 'Back to Register',
      btnHref: '/register',
    },
    server_error: {
      icon: <XCircle size={56} className="text-red-500" />,
      title: 'Server Error',
      subtitle: 'Something went wrong on our end.',
      message: 'Please try clicking the link again or contact support.',
      btnLabel: 'Try Again',
      btnHref: '/register',
    },
  }

  const key = success ? 'success' : already ? 'already' : (error || 'invalid_token')
  const cfg = config[key] || config['invalid_token']
  const btnHref = cfg.btnHref || '/login'

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: isSuccess ? 'rgba(212,175,55,0.06)' : 'rgba(239,68,68,0.06)' }}
        />
      </div>

      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 glass-card p-8 md:p-14 w-full max-w-md border-t-2"
        style={{ borderColor: isSuccess ? '#D4AF37' : '#ef4444' }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-display text-[#D4AF37] text-2xl tracking-[0.3em] mb-1">ARNADA</div>
          <div className="text-white/20 text-[10px] uppercase tracking-[0.4em]">Pool Cafe</div>
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          {cfg.icon}
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-2xl md:text-3xl text-white uppercase tracking-tight font-black mb-2">
            {cfg.title}
          </h1>
          <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-6">
            {cfg.subtitle}
          </p>
          <p className="text-white/40 text-sm leading-relaxed">
            {cfg.message}
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push(btnHref)}
          className="group relative w-full overflow-hidden inline-block"
        >
          <div className="relative w-full py-5 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 group-hover:bg-white transition-all duration-500">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
              animate={{ x: ['-100%', '220%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            />
            <span className="relative">{cfg.btnLabel}</span>
            <ArrowRight size={14} className="relative" />
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}

export default function VerifiedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[#D4AF37] font-bold tracking-[0.5em] animate-pulse">VERIFYING...</div>
      </div>
    }>
      <VerifiedContent />
    </Suspense>
  )
}
