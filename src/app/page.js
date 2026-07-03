'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import TransitionLink from '@/components/TransitionLink'
import { motion } from 'framer-motion'
import { useNotify, useConfirm } from '@/components/ToastProvider'
import { useTranslation } from '@/lib/useTranslation'
import Hero from '@/components/Hero'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import About from '@/components/About'
import { useEffect, useState } from 'react'
import { Trophy, Users, Calendar, ArrowRight, Clock, Star, LayoutDashboard, Play, Shield } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function Home() {
  const { t, language } = useTranslation()
  const { data: session } = useSession()
  const notify = useNotify()
  const confirm = useConfirm()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState(null)

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments')
      if (res.ok) {
        const data = await res.json()
        setTournaments(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetching tournaments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTournaments()
  }, [])

  const handleJoin = async (id) => {
    if (!session) {
      router.push('/login')
      return
    }
    setJoiningId(id)
    try {
      const res = await fetch('/api/tournaments/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: id })
      })
      const data = await res.json()
      if (res.ok) fetchTournaments()
      notify({ message: data.message, type: res.ok ? 'success' : 'error' })
    } catch (err) {
      notify({ message: 'Failed to join', type: 'error' })
    } finally {
      setJoiningId(null)
    }
  }

  const handleLeave = async (id) => {
    if (!session) return
    if (!await confirm('Are you sure you want to leave this tournament?')) return
    setJoiningId(id)
    try {
      const res = await fetch(`/api/tournaments/join?tournamentId=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (res.ok) fetchTournaments()
      notify({ message: data.message, type: res.ok ? 'success' : 'error' })
    } catch (err) {
      notify({ message: 'Failed to leave', type: 'error' })
    } finally {
      setJoiningId(null)
    }
  }

  const activeTournament = tournaments.find(t => t.status === 'PLAYING')
  const upcomingTournaments = tournaments.filter(t => t.status === 'OPEN').slice(0, 4)

  return (
    <main dir={language === 'AR' ? 'rtl' : 'ltr'} className="relative bg-[#050505] min-h-screen">
      <Hero />
      <About />

      {/* Arena Highlights Section */}
      <section id="tournaments" className="relative py-20 lg:py-32 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-[#D4AF37]" />
                <span className="text-[#D4AF37] font-display text-[10px] tracking-[0.5em] uppercase">Battleground Live</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-white leading-tight uppercase tracking-tighter">
                Current <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-white/40">Warfare</span>
              </h2>
            </div>
            <TransitionLink
              href="/tournaments"
              className="group flex items-center gap-4 text-white/40 hover:text-white transition-all text-[10px] font-bold tracking-[0.3em] uppercase border-b border-white/5 pb-2"
            >
              View Full Schedule <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </TransitionLink>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Tournament Card */}
            <div className="lg:col-span-2 relative group">
              <div className="absolute inset-0 bg-[#D4AF37]/5 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-all duration-1000" />
              <div className="glass-card p-6 md:p-12 relative overflow-hidden h-full flex flex-col min-h-[500px]">
                {activeTournament ? (
                  <>
                    <div className="flex justify-between items-start mb-12">
                      <div className="flex items-center gap-3 px-5 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full">
                        <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
                        <span className="text-[#D4AF37] text-[9px] font-black tracking-widest uppercase">Live Arena</span>
                      </div>
                      <div className="text-white/20 text-[10px] uppercase tracking-widest font-mono">ID: {activeTournament.id.slice(0, 8)}</div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-4">Current Global Operation</h3>
                      <h3 className="text-4xl md:text-6xl lg:text-8xl font-display font-black text-white mb-6 uppercase tracking-tighter leading-none">
                        {activeTournament.name}
                      </h3>

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                        <div className="flex items-center gap-6 text-white/30 text-xs font-bold uppercase tracking-widest font-mono">
                          <span className="flex items-center gap-2"><Trophy size={14} className="text-[#D4AF37]" /> {activeTournament.prize}</span>
                          <span className="flex items-center gap-2"><Clock size={14} className="text-[#D4AF37]" /> {new Date(activeTournament.date).toLocaleDateString()} @ {activeTournament.startTime || 'TBD'}</span>
                          <span className="text-[#00f3ff]">BEST OF {activeTournament.roundsPerMatch || 1}</span>
                        </div>
                        <div className="flex flex-col items-end gap-6 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-white/20 text-[9px] uppercase tracking-[0.3em] mb-2">Deployed Agents</span>
                            <span className="text-4xl font-display font-black text-[#D4AF37] tracking-tight">
                              {activeTournament.participants?.length || 0}/{activeTournament.maxPlayers || '--'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {activeTournament.matches?.filter(m => !m.winnerId && m.player1?.username && m.player2?.username).length > 0 && (
                        <div className="border-t border-white/5 pt-8 mb-8">
                          <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">Live Matchups</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {activeTournament.matches.filter(m => !m.winnerId && m.player1?.username && m.player2?.username).map(match => (
                              <div key={match.id} className="bg-black/40 border-l-2 border-[#00f3ff]/50 p-4 flex justify-between items-center relative overflow-hidden group">
                                <span className="text-xs font-black uppercase tracking-widest text-white/70 truncate z-10">{match.player1.username}</span>
                                <span className="text-[8px] font-black text-[#D4AF37] px-3 z-10">VS</span>
                                <span className="text-xs font-black uppercase tracking-widest text-white/70 truncate z-10">{match.player2.username}</span>
                                <div className="absolute inset-0 bg-[#00f3ff]/5 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 items-center">
                        <TransitionLink href={`/tournaments/${activeTournament.id}`} className="btn-primary px-12 py-6 text-xs inline-flex items-center gap-4">
                          Enter Arena <Target size={18} />
                        </TransitionLink>
                        {(activeTournament.participants?.length || 0) >= (activeTournament.maxPlayers || Infinity) && (
                          <div className="px-6 py-2 border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            Max Capacity
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 border border-white/5 flex items-center justify-center rounded-full mb-8">
                      <Clock className="text-white/10" size={32} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white/20 uppercase tracking-[0.3em]">No Live Battles</h3>
                    <p className="text-white/10 text-xs mt-4 uppercase tracking-widest">Awaiting the next deployment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming List */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-4 flex items-center gap-3">
                Upcoming Deployments <div className="flex-1 h-[1px] bg-white/5" />
              </h4>

              {upcomingTournaments.length === 0 ? (
                <div className="glass-card p-8 md:p-12 text-center text-white/10 border-dashed">
                  No open registrations
                </div>
              ) : (
                upcomingTournaments.map((t) => {
                  const isJoined = session && t.participants?.some(p => p.userId === session.user.id)

                  return (
                    <div key={t.id} className="glass-card p-8 group hover:bg-[#D4AF37]/5 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 border border-white/5 flex items-center justify-center text-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-all">
                          <Star size={18} />
                        </div>
                        <div className="text-right">
                          <div className="text-white font-mono text-sm tracking-tighter">{t.prize}</div>
                          <div className="text-white/20 text-[8px] uppercase tracking-widest font-bold">Prize Pool</div>
                        </div>
                        <div className="text-right ml-4 border-l border-white/5 pl-4">
                          <div className="text-[#D4AF37] font-mono text-sm tracking-tighter">
                            {t.participants?.length || 0}/{t.maxPlayers || '--'}
                          </div>
                          <div className="text-white/20 text-[8px] uppercase tracking-widest font-bold">Agents Enlisted</div>
                        </div>
                      </div>
                      <h5 className="text-lg font-bold text-white mb-4 uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">{t.name}</h5>

                      <div className="flex items-center gap-4 text-white/20 text-[10px] font-bold uppercase tracking-widest mb-8">
                        <Calendar size={12} className="text-[#D4AF37]/40" /> {new Date(t.date).toLocaleDateString()}
                      </div>

                      {isJoined ? (
                        <button
                          onClick={() => handleLeave(t.id)}
                          disabled={joiningId === t.id}
                          className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.3em] disabled:opacity-50"
                        >
                          {joiningId === t.id ? 'Processing...' : 'Leave Tournament'}
                        </button>
                      ) : ((t.participants?.length || 0) >= (t.maxPlayers || Infinity)) ? (
                        <div className="w-full py-4 bg-black border border-white/5 text-white/30 text-center text-[9px] font-black uppercase tracking-[0.3em]">
                          Registry Full
                        </div>
                      ) : (
                        <button
                          onClick={() => handleJoin(t.id)}
                          disabled={joiningId === t.id}
                          className="w-full btn-primary py-4 text-[9px] font-black uppercase tracking-[0.3em] disabled:opacity-50"
                        >
                          {joiningId === t.id ? 'Processing...' : 'Join Tournament'}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Features */}
      <section id="features" className="relative py-20 lg:py-32 px-4 md:px-6 bg-gradient-to-b from-[#050505] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[1px] bg-[#D4AF37]" />
              <span className="text-[#D4AF37] font-display text-[10px] tracking-[0.5em] uppercase">Tactical Advantage</span>
              <div className="w-12 h-[1px] bg-[#D4AF37]" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-white leading-tight uppercase tracking-tighter">
              Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-white/40">Hardware</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Global Rankings', desc: 'Climb the elite hierarchy of Arnada.', icon: <Award className="text-[#D4AF37]" size={28} /> },
              { title: 'Cinematic Arena', desc: 'Experience matches with high-end visuals.', icon: <Play className="text-[#D4AF37]" size={28} /> },
              { title: 'Exclusive Rewards', desc: 'Tiered prizes for the victors.', icon: <Zap className="text-[#D4AF37]" size={28} /> },
              { title: 'Verified Profiles', desc: 'Secure blockchain-ready statistics.', icon: <UserCheck className="text-[#D4AF37]" size={28} /> }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-10 group hover:border-[#D4AF37]/30 transition-all flex flex-col items-center text-center">
                <div className="mb-6 transform group-hover:-translate-y-2 transition-transform duration-500">{feature.icon}</div>
                <h4 className="text-white font-bold mb-3 uppercase tracking-widest font-display">{feature.title}</h4>
                <p className="text-white/30 text-xs leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <CustomCursor />
    </main>
  )
}

function Award(props) { return <Trophy {...props} /> }
function Zap(props) { return <Trophy {...props} /> }
function UserCheck(props) { return <Shield {...props} /> }
