'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, Swords, Clock, Target, Shield, CheckCircle2 } from 'lucide-react'
import Footer from '@/components/Footer'


export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    fetchTournaments()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center pt-24">
        <div className="w-12 h-12 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-16 relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-[#00f3ff]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-[#D4AF37] font-display text-[10px] tracking-[0.5em] uppercase">Global Arena</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-white leading-tight uppercase tracking-tighter">
            Tournament <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-white/40">Intel</span>
          </h1>
          <p className="text-white/40 mt-6 max-w-2xl text-sm leading-relaxed tracking-wider">
            Monitor real-time battleground status. Track ongoing proxy wars, completed matchups, and upcoming clashes across all active and scheduled tournaments.
          </p>
        </motion.div>

        <div className="space-y-12">
          {tournaments.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed">
              <Shield className="mx-auto text-white/10 mb-4" size={48} />
              <h3 className="text-2xl font-display text-white/30 uppercase tracking-widest">No Tournaments Found</h3>
            </div>
          ) : (
            tournaments.map((t, idx) => (
              <TournamentCard key={t.id} tournament={t} index={idx} />
            ))
          )}
        </div>
      </div>
      
      <div className="mt-32">
        <Footer />
      </div>
    </main>
  )
}

function TournamentCard({ tournament, index }) {
  const isFinished = tournament.status === 'FINISHED'
  const isPlaying = tournament.status === 'PLAYING'
  const isOpen = tournament.status === 'OPEN'

  const allMatches = tournament.matches || []
  
  // Completed matches (have a winner)
  const completedMatches = allMatches.filter(m => m.winnerId).sort((a, b) => b.round - a.round)
  
  // Next round / upcoming matches (no winner yet, but players assigned)
  const upcomingMatches = allMatches.filter(m => !m.winnerId && m.player1 && m.player2).sort((a, b) => a.round - b.round)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`glass-card p-6 md:p-10 relative overflow-hidden group ${isPlaying ? 'border-[#00f3ff]/20 bg-gradient-to-br from-[#00f3ff]/5 to-transparent' : isFinished ? 'border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/5 to-transparent' : 'border-white/5'}`}
    >
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Info */}
        <div className="lg:w-1/3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] inline-block ${isPlaying ? 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20' : isFinished ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 'bg-white/5 text-white/50 border border-white/10'}`}>
                {tournament.status}
              </div>
              <div className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
                ID: {tournament.id.split('-')[0]}
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-5xl font-display font-black text-white mb-6 uppercase tracking-tight leading-none group-hover:text-[#D4AF37] transition-colors">
              {tournament.name}
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-white/40 text-xs font-mono uppercase tracking-widest">
                <Trophy size={16} className="text-[#D4AF37]" /> {tournament.prize}
              </div>
              <div className="flex items-center gap-4 text-white/40 text-xs font-mono uppercase tracking-widest">
                <Calendar size={16} className="text-[#D4AF37]" /> {new Date(tournament.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-4 text-white/40 text-xs font-mono uppercase tracking-widest">
                <Users size={16} className="text-[#D4AF37]" /> {tournament.participants?.length || 0} / {tournament.maxPlayers} Agents
              </div>
            </div>
          </div>


        </div>

        {/* Right Side: Matches Tracker */}
        <div className="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-12 flex flex-col gap-8">
          
          {/* Upcoming Matches (Next Round) */}
          {(isPlaying || isOpen) && (
            <div>
              <h4 className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">
                <Swords size={14} className="text-[#00f3ff]" /> Scheduled Encounters
                <div className="flex-1 h-[1px] bg-white/5 ml-2" />
              </h4>
              
              {upcomingMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingMatches.map(match => (
                    <div key={match.id} className="bg-black/40 border border-[#00f3ff]/20 hover:border-[#00f3ff]/50 transition-colors p-4 flex flex-col gap-2 relative overflow-hidden group/match">
                      <div className="absolute top-0 right-0 p-2 opacity-50 group-hover/match:opacity-100 transition-opacity">
                        <Clock size={12} className="text-[#00f3ff] animate-pulse" />
                      </div>
                      <div className="text-[9px] text-[#00f3ff]/80 font-black uppercase tracking-widest mb-1">
                        Round {match.round}
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-bold text-white truncate max-w-[40%]">{match.player1?.username || 'TBD'}</span>
                        <span className="text-[10px] font-black text-white/30">VS</span>
                        <span className="text-xs font-bold text-white truncate max-w-[40%] text-right">{match.player2?.username || 'TBD'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-mono py-6 border border-white/5 border-dashed text-center">
                  Matchups configuring...
                </div>
              )}
            </div>
          )}

          {/* Completed Matches (Last Matches) */}
          {(isPlaying || isFinished) && (
            <div>
              <h4 className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">
                <CheckCircle2 size={14} className="text-[#D4AF37]" /> Casualty Reports
                <div className="flex-1 h-[1px] bg-white/5 ml-2" />
              </h4>
              
              {completedMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedMatches.slice(0, 6).map(match => (
                    <div key={match.id} className="bg-black/60 border border-white/5 p-4 flex flex-col gap-2">
                      <div className="text-[9px] text-[#D4AF37]/80 font-black uppercase tracking-widest mb-1">
                        Round {match.round}
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <span className={`text-xs font-bold truncate max-w-[40%] ${match.winnerId === match.player1Id ? 'text-[#D4AF37]' : 'text-white/30 line-through'}`}>
                          {match.player1?.username}
                        </span>
                        <span className="text-[10px] font-black text-white/10 px-2">-</span>
                        <span className={`text-xs font-bold truncate max-w-[40%] text-right ${match.winnerId === match.player2Id ? 'text-[#D4AF37]' : 'text-white/30 line-through'}`}>
                          {match.player2?.username}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-mono py-6 border border-white/5 border-dashed text-center">
                  No casualties recorded yet.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </motion.div>
  )
}
