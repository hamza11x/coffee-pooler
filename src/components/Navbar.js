'use client'

import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu as MenuIcon, X as XIcon, Shield, Trophy, LayoutDashboard, LogOut, User, Target, Zap } from 'lucide-react'
import Hamburger from '@/components/Hamburger'
import { useState } from 'react'
import TransitionLink from '@/components/TransitionLink'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/#about', label: 'The Arena' },
  { href: '/#tournaments', label: 'Tactical Ops' },
  { href: '/#features', label: 'Elite Hardware' },
  { href: '/#contact', label: 'Support' },
]

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const pathname = usePathname()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }

    if (latest > 50) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  })

  // Hide the global website navbar on Admin routes to prevent UI overlap
  if (pathname?.startsWith('/admin')) return null

  const isElite = session?.user?.role && ['DEV', 'OWNER', 'STAFF'].includes(session.user.role)

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-[210] flex justify-center pt-6 px-6 pointer-events-none">
        <motion.nav
          variants={{
            visible: { y: 0, opacity: 1 },
            hidden: { y: -100, opacity: 0 },
          }}
          animate={hidden ? "hidden" : "visible"}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`
            pointer-events-auto
            flex items-center justify-between
            px-4 md:px-10 py-4
            transition-all duration-500 ease-in-out
            ${scrolled 
              ? 'w-full md:w-[90%] max-w-7xl glass-pill bg-black/40 backdrop-blur-xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
              : 'w-full bg-transparent border-transparent'
            }
          `}
        >
          {/* Logo */}
          <TransitionLink href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-black border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-white group-hover:border-[#D4AF37] transition-colors">
                8
              </div>
              <div className="absolute -inset-1 bg-[#D4AF37]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-white font-bold text-sm md:text-lg tracking-[0.3em] font-display group-hover:text-[#D4AF37] transition-colors uppercase">
              ARNADA
            </div>
          </TransitionLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 lg:gap-12 text-white/50 uppercase text-[9px] tracking-[0.3em] font-black">
            {NAV_LINKS.map((item) => (
              <TransitionLink 
                key={item.label} 
                href={item.href} 
                className="hover:text-white transition-all duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
              </TransitionLink>
            ))}
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            {/* Auth Actions */}
            <div className="flex items-center gap-3 md:gap-6">
              {status === 'authenticated' ? (
                <div className="flex items-center gap-4 md:gap-6">
                  {isElite && (
                    <TransitionLink 
                      href="/admin/dashboard" 
                      className="hidden sm:flex items-center gap-2 text-[#D4AF37] hover:text-white transition-all text-[9px] font-bold tracking-widest uppercase"
                    >
                      <LayoutDashboard size={14} />
                      <span className="hidden xl:inline">Dashboard</span>
                    </TransitionLink>
                  )}
                  <TransitionLink 
                    href="/profile" 
                    className="flex items-center gap-2 text-white hover:text-[#D4AF37] transition-all text-[9px] font-bold tracking-widest uppercase group"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                      <User size={12} />
                    </div>
                    <span className="hidden md:inline">{session?.user?.username}</span>
                  </TransitionLink>
                  <button 
                    onClick={() => signOut()}
                    className="p-2 text-white/30 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <TransitionLink 
                  href="/login" 
                  className="btn-primary text-[9px] px-6 py-2.5 rounded-full"
                >
                  <span>Sign In</span>
                </TransitionLink>
              )}

              {/* Mobile Menu Toggle */}
              <div className="md:hidden flex items-center">
                <Hamburger 
                  isOpen={isMobileMenuOpen} 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                />
              </div>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 overflow-hidden"
          >
            {/* Background HUD decorations */}
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent shadow-[0_0_20px_#D4AF37]" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent shadow-[0_0_20px_#D4AF37]" />
            
            <motion.div 
              variants={{
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
                hide: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
              }}
              initial="hide"
              animate="show"
              exit="hide"
              className="flex flex-col items-center gap-8 md:gap-10 text-white text-xl md:text-3xl uppercase tracking-[0.4em] font-display mb-16 relative z-10"
            >
              {NAV_LINKS.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="w-full flex flex-col items-center"
                  variants={{
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                    hide: { opacity: 0, y: 20, transition: { duration: 0.3 } }
                  }}
                >
                  <TransitionLink 
                    href={item.href} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="hover:text-[#D4AF37] transition-all hover:scale-110 relative group py-2"
                  >
                    {item.label}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#D4AF37] group-hover:w-full transition-all duration-500" />
                  </TransitionLink>
                  {index < NAV_LINKS.length - 1 && (
                    <div className="w-12 h-[1px] bg-white/10 mt-6" />
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-xs flex flex-col gap-4"
            >
              {status === 'authenticated' ? (
                <>
                  {isElite && (
                    <TransitionLink href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary py-4 text-center text-[10px] uppercase tracking-widest font-black">Dashboard</TransitionLink>
                  )}
                  <TransitionLink href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-8 py-5 border border-white/10 text-white/60 text-center text-[10px] uppercase tracking-widest font-black transition-all hover:border-[#D4AF37]/40 hover:text-white">{session?.user?.username || 'Profile'}</TransitionLink>
                  <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="text-white/20 text-[10px] tracking-widest font-bold uppercase mt-6">Sign Out</button>
                </>
              ) : (
                <TransitionLink href="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary py-6 text-center text-lg font-black uppercase tracking-[0.3em]">Sign In</TransitionLink>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
