'use client'

import { Trophy, Mail, Phone, MapPin, Globe, Shield, ExternalLink, Bookmark } from 'lucide-react'
import TransitionLink from './TransitionLink'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="relative bg-[#050505] border-t border-white/5 pt-16 md:pt-24 pb-10 md:pb-12 px-4 md:px-6 overflow-hidden">
      {/* Abstract background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <span className="font-display text-white text-2xl tracking-[0.3em] font-black">ARNADA</span>
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.5em] font-bold">Pool Cafe</span>
            </div>
            <p className="text-white/30 text-xs leading-relaxed max-w-[240px] font-light uppercase tracking-widest">
              The ultimate destination for elite billiard combat and luxury social gaming.
            </p>
            <div className="flex gap-4">
               <a href="https://www.instagram.com/arnada.pool/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/5 flex items-center justify-center text-white/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all rounded-full bg-white/[0.02]">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
               </a>
               <a href="#" className="w-10 h-10 border border-white/5 flex items-center justify-center text-white/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all rounded-full bg-white/[0.02]"><Globe size={18} /></a>
               <a href="#" className="w-10 h-10 border border-white/5 flex items-center justify-center text-white/20 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all rounded-full bg-white/[0.02]"><Bookmark size={18} /></a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-10">Navigation</h4>
            <ul className="flex flex-col gap-5 text-[10px] font-bold uppercase tracking-[0.2em]">
               <li><TransitionLink href="/" className="text-white/30 hover:text-[#D4AF37] transition-colors">Combat Arena</TransitionLink></li>
               <li><TransitionLink href="/tournaments" className="text-white/30 hover:text-[#D4AF37] transition-colors">Schedule</TransitionLink></li>
               <li><TransitionLink href="/profile" className="text-white/30 hover:text-[#D4AF37] transition-colors">Profile</TransitionLink></li>
            </ul>
          </div>

          {/* Operational */}
          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-10">Operational</h4>
            <ul className="flex flex-col gap-5 text-[10px] font-bold uppercase tracking-[0.2em]">
               <li><a href="#" className="text-white/30 hover:text-[#D4AF37] transition-colors">Privacy</a></li>
               <li><a href="#" className="text-white/30 hover:text-[#D4AF37] transition-colors">Terms</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-10">Signal Receiver</h4>
            <ul className="flex flex-col gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
               <li className="flex items-start gap-4 text-[9px]">
                 <MapPin size={14} className="text-[#D4AF37] shrink-0 mt-0.5" /> 
                 <span>Arnada pool, 1st Floor, Marjane Ben Guerir, Morocco</span>
               </li>
               <li className="flex items-center gap-4 text-[9px]">
                 <Phone size={14} className="text-[#D4AF37]" /> 
                 <a href="tel:+212644729929" className="hover:text-white transition-colors">+212 644-729929</a>
               </li>
               <li className="flex items-center gap-4 text-[9px]">
                 <Mail size={14} className="text-[#D4AF37]" /> 
                 <a href="mailto:contact@arnada.ma" className="hover:text-white transition-colors">contact@arnada.ma</a>
               </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
             <Shield size={14} className="text-[#D4AF37]/40" />
             © {currentYear} ARNADA POOL. SECURED.
          </div>

          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-green-500/40">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Minimalist Signature */}
        <div className="mt-8 flex justify-center">
          <a 
            href="https://hvmzaa.web1337.net/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10 hover:text-[#D4AF37] transition-all duration-500"
          >
            Built by HVMZAA
          </a>
        </div>
      </div>
    </footer>
  )
}
