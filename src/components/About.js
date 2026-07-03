'use client'

import { motion } from 'framer-motion'
import { Shield, Target, Star } from 'lucide-react'

export default function About() {
  return (
    <section id="about" className="relative py-20 md:py-40 bg-[#050505] overflow-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* IMAGE BLOCK */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            <div className="absolute -inset-4 border border-[#D4AF37]/10 translate-x-8 translate-y-8 pointer-events-none group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700" />
            <div className="relative overflow-hidden aspect-[4/5] shadow-2xl">
               <img 
                 src="/about-bg.png" 
                 alt="Arnada Luxury Interior"
                 className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* TEXT BLOCK */}
          <div className="space-y-12">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="w-12 h-[1px] bg-[#D4AF37]" />
                <span className="text-[#D4AF37] font-display text-[11px] tracking-[0.5em] uppercase font-black">
                  Our Philosophy
                </span>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-tight uppercase tracking-tighter mb-8"
              >
                THE ELITE <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(212,175,55,1)' }}>STANDARD</span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-white/40 text-sm leading-loose uppercase tracking-[0.2em] font-light max-w-xl"
              >
                At Arnada Pool, we don't just host games; we curate battlegrounds. 
                Our arena is built for the strategically obsessed — combining the 
                tactical precision of professional billiards with a dark, luxurious 
                atmosphere for those who demand excellence in every shot.
              </motion.p>
            </div>

            {/* PILLARS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
              {[
                { icon: <Target size={18} />, label: 'Precision', desc: 'Tour-grade equipment for pinpoint accuracy.' },
                { icon: <Shield size={18} />, label: 'Privacy', desc: 'Exclusive VIP arenas for the elite.' },
                { icon: <Star size={18} />, label: 'Prestige', desc: 'A legacy built on tournament dominance.' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="space-y-4"
                >
                  <div className="w-10 h-10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    {item.icon}
                  </div>
                  <h4 className="text-white font-black text-[10px] uppercase tracking-widest">{item.label}</h4>
                  <p className="text-white/20 text-[9px] leading-relaxed uppercase tracking-wider">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
