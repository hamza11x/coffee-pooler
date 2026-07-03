'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Trophy, History, User, Award, Shield, ChevronRight, Edit3, X, Mail, Lock, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchStats = async () => {
    if (status !== 'authenticated') return
    try {
      const res = await fetch('/api/profile/stats')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Error fetching profile stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [status])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setMessage('')
    const formData = new FormData(e.target)
    const payload = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password') || undefined
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setMessage('Profile updated successfully! Some changes may require re-login.')
        // Optionally update session client-side if NextAuth supports it
        setTimeout(() => {
           setIsEditing(false)
           fetchStats()
        }, 2000)
      } else {
        const err = await res.json()
        setMessage(err.message || 'Failed to update profile')
      }
    } catch (err) {
      setMessage('An error occurred during sync.')
    } finally {
      setFormLoading(false)
    }
  }

  if (status === 'loading' || loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
       <div className="text-[#D4AF37] font-bold tracking-[0.5em] animate-pulse">SYNCHRONIZING PROFILE...</div>
    </div>
  )
  
  if (!session) return null

  const stats = [
    { label: 'Matches', value: data?.stats?.matches || '0', icon: <History size={20} /> },
    { label: 'Wins', value: data?.stats?.wins || '0', icon: <Trophy size={20} /> },
    { label: 'Rank', value: data?.stats?.rank || 'N/A', icon: <Award size={20} /> },
    { label: 'Level', value: data?.stats?.level || '1', icon: <Shield size={20} /> }
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 pt-24 md:pt-40 relative">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row items-center gap-8 mb-16 border-b border-white/5 pb-12 relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-[#D4AF37] p-1 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#D4AF37] to-[#00f3ff] flex items-center justify-center">
              <User size={48} className="text-black md:hidden" />
              <User size={64} className="text-black hidden md:block" />
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 uppercase tracking-widest font-display text-white">{session.user.username}</h1>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-[#D4AF37]"
              >
                <Edit3 size={16} />
              </button>
            </div>
            <p className="text-[#D4AF37] font-mono text-sm opacity-80">{session.user.email}</p>
            <div className="mt-4 flex gap-4 justify-center md:justify-start">
              <span className="px-5 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black tracking-[0.2em] text-white/40 uppercase items-center flex gap-2">
                <Shield size={10} className="text-[#D4AF37]" /> {session.user.role} CLUB
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 md:p-8 text-center group hover:bg-[#D4AF37]/5 transition-all border border-white/5 relative overflow-hidden"
            >
              <div className="text-[#D4AF37]/40 flex justify-center mb-4 transition-all group-hover:text-[#D4AF37] group-hover:scale-110">{stat.icon}</div>
              <h3 className="text-xl md:text-3xl font-black mb-1 font-display tracking-tight text-white">{stat.value}</h3>
              <p className="text-white/20 text-[8px] uppercase tracking-[0.3em] font-black">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="glass p-6 md:p-10 border border-white/5">
            <h2 className="text-base font-black mb-10 flex items-center gap-4 uppercase tracking-[0.3em] text-white/40">
              <History className="text-[#D4AF37]" size={20} /> Arena History
            </h2>
            <div className="space-y-8">
              {data?.matchHistory?.length === 0 ? (
                <p className="text-white/10 text-xs italic uppercase tracking-widest">Awaiting first combat...</p>
              ) : (
                data?.matchHistory?.map((match, i) => {
                  const isPlayer1 = match.player1Id === session.user.id
                  const result = match.winnerId ? (match.winnerId === session.user.id ? 'VICTORY' : 'DEFEAT') : 'PENDING'
                  const opponent = isPlayer1 ? match.player2?.username : match.player1?.username
 
                  return (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-6 last:border-0 last:pb-0 group">
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">{opponent || 'Anonymous'}</h4>
                        <p className="text-white/20 text-[8px] uppercase tracking-[0.2em] font-mono">{new Date(match.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-[10px] tracking-[0.2em] ${result === 'VICTORY' ? 'text-green-500' : result === 'DEFEAT' ? 'text-red-500' : 'text-white/40'}`}>
                          {result}
                        </div>
                        <p className="text-white/30 font-mono text-xs">{match.score1} - {match.score2}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="glass p-6 md:p-10 border border-white/5">
            <h2 className="text-base font-black mb-10 flex items-center gap-4 uppercase tracking-[0.3em] text-white/40">
              <Award className="text-[#D4AF37]" size={20} /> Active Orders
            </h2>
            {data?.upcomingTournaments?.length === 0 ? (
               <p className="text-white/10 text-xs italic uppercase tracking-widest">No active deployments.</p>
            ) : (
              data?.upcomingTournaments?.map((tourney, i) => (
                <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded relative overflow-hidden group mb-6 last:mb-0">
                  <div className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 bg-[#D4AF37]/5 rotate-45" />
                  <h3 className="text-[#D4AF37] font-black text-sm uppercase tracking-[0.2em] mb-2">{tourney.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">ENLISTED</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-bold items-center text-white/40 uppercase tracking-widest">
                    <span>LAUNCH DATE:</span>
                    <span className="text-white font-mono">{new Date(tourney.date).toLocaleDateString()}</span>
                  </div>
                  <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 text-white/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all text-[9px] tracking-[0.3em] font-black uppercase">
                    VIEW MISSION DATA
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="glass-card w-full max-w-xl p-6 md:p-12 border-t-2 border-[#D4AF37]"
             >
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tighter">Edit Identity</h2>
                      <p className="text-white/20 text-[9px] uppercase tracking-[0.3em] mt-1">Sync your operational credentials.</p>
                   </div>
                   <button onClick={() => setIsEditing(false)} className="p-2 text-white/20 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Designation (Username)</label>
                      <div className="relative">
                         <input name="username" defaultValue={session.user.username} required className="contact-input pl-12" />
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Encrypted Signal (Email)</label>
                      <div className="relative">
                         <input name="email" type="email" defaultValue={session.user.email} required className="contact-input pl-12" />
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">New Security Code (Password)</label>
                      <div className="relative">
                         <input name="password" type="password" className="contact-input pl-12" placeholder="••••••••" />
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      </div>
                      <p className="text-[8px] text-white/10 uppercase tracking-widest italic pt-1">Leave empty to keep current code.</p>
                   </div>

                   {message && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${message.includes('success') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {message.includes('success') ? <CheckCircle2 size={14} /> : <X size={14} />}
                        {message}
                     </motion.div>
                   )}

                   <div className="pt-8 flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-4 border border-white/5 text-white/20 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/5 transition-all text-center"
                      >
                        Abort
                      </button>
                      <button 
                        type="submit" 
                        disabled={formLoading}
                        className="flex-1 py-4 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-[#D4AF37]/10"
                      >
                        {formLoading ? 'Synchronizing...' : 'Update Credentials'}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
