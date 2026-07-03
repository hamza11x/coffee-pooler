'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Trophy, Users, BarChart, Settings, Plus, Trash2, Edit, ChevronRight, UserPlus, Shield, X, CheckCircle2, Clock, Globe, Calendar, DollarSign, Target, Play, Terminal, Save, Menu as MenuIcon, Dna, RotateCcw, MonitorPlay, ChevronLeft, PanelsTopLeft } from 'lucide-react'
import Hamburger from '@/components/Hamburger'
import OfflineRoulette from '@/components/OfflineRoulette'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/useTranslation'
import { useNotify, useConfirm } from '@/components/ToastProvider'

function MatchCard({ match, users, isPvp, onUpdate }) {
  const [scheduledTime, setScheduledTime] = useState(match.scheduledTime || '')
  const [score1, setScore1] = useState(match.score1 || 0)
  const [score2, setScore2] = useState(match.score2 || 0)
  const [p1, setP1] = useState(match.player1Id || '')
  const [p2, setP2] = useState(match.player2Id || '')

  const showDrafting = isPvp && !match.winnerId

  const notify = useNotify()

  const syncMatch = (winnerId) => {
    const finalP1 = p1 || match.player1Id
    const finalP2 = p2 || match.player2Id

    if (winnerId && (!finalP1 || !finalP2)) {
      notify({ message: "Both agents must be deployed before picking a winner.", type: 'error' })
      return
    }

    onUpdate({
      matchId: match.id,
      winnerId,
      score1: parseInt(score1) || 0,
      score2: parseInt(score2) || 0,
      scheduledTime,
      player1Id: isPvp ? p1 : undefined,
      player2Id: isPvp ? p2 : undefined
    })
  }

  return (
    <div className={`p-5 glass-card min-w-[280px] border-l-4 overflow-visible ${match.winnerId ? 'border-green-500' : 'border-[#00f3ff]/50'}`}>

      {/* Time Setting */}
      <div className="mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
        <Clock size={12} className="text-[#D4AF37]" />
        <input
          type="time"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          className="bg-transparent text-[10px] text-[#D4AF37] font-black uppercase outline-none"
        />
        <button onClick={() => syncMatch()} className="ml-auto text-[8px] px-2 py-1 bg-white/5 hover:bg-[#D4AF37] hover:text-black transition-colors uppercase font-bold tracking-widest flex items-center gap-1"><Save size={10} /> Sync</button>
      </div>

      {/* Players & Scores */}
      <div className="space-y-4">
        {/* Player 1 */}
        <div className="flex justify-between items-center bg-black/40 p-2 border border-white/5">
          {showDrafting ? (
            <select value={p1} onChange={(e) => setP1(e.target.value)} className="bg-transparent text-xs uppercase font-bold text-white/60 outline-none w-2/3">
              <option value="">Select Agent...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          ) : (
            <span className="text-xs uppercase font-bold text-white/80">{match.player1?.username || 'TBD'}</span>
          )}
          {!match.winnerId ? (
            <input type="number" min="0" value={score1} onChange={(e) => setScore1(e.target.value)} placeholder="0" className="w-10 bg-white/10 text-center text-xs font-black text-white outline-none h-6" />
          ) : (
            <span className="text-xs font-black text-[#D4AF37] pr-2">{match.score1 || 0}</span>
          )}
        </div>

        {/* Player 2 */}
        <div className="flex justify-between items-center bg-black/40 p-2 border border-white/5">
          {showDrafting ? (
            <select value={p2} onChange={(e) => setP2(e.target.value)} className="bg-transparent text-xs uppercase font-bold text-white/60 outline-none w-2/3">
              <option value="">Select Agent...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          ) : (
            <span className="text-xs uppercase font-bold text-white/80">{match.player2?.username || 'TBD'}</span>
          )}
          {!match.winnerId ? (
            <input type="number" min="0" value={score2} onChange={(e) => setScore2(e.target.value)} placeholder="0" className="w-10 bg-white/10 text-center text-xs font-black text-white outline-none h-6" />
          ) : (
            <span className="text-xs font-black text-[#D4AF37] pr-2">{match.score2 || 0}</span>
          )}
        </div>
      </div>

      {/* Winning Actions */}
      {!match.winnerId && (
        <div className="mt-5 space-y-2">
          <div className="text-[8px] text-white/30 tracking-widest uppercase font-black text-center mb-2">Declare Victor</div>
          <div className="flex gap-2">
            <button onClick={() => syncMatch(p1 || match.player1Id)} className="flex-1 py-3 text-[9px] font-black bg-white/5 hover:bg-[#D4AF37] hover:text-black uppercase tracking-[0.2em] border border-white/10 transition-colors truncate px-2">
              🏆 {match.player1?.username || 'Player 1'}
            </button>
            <button onClick={() => syncMatch(p2 || match.player2Id)} className="flex-1 py-3 text-[9px] font-black bg-white/5 hover:bg-[#D4AF37] hover:text-black uppercase tracking-[0.2em] border border-white/10 transition-colors truncate px-2">
              🏆 {match.player2?.username || 'Player 2'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const notify = useNotify()
  const confirm = useConfirm()
  const [activeTab, setActiveTab] = useState('tournaments')
  const [tournaments, setTournaments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(null) // 'tournament', 'user', 'arena', 'edit-user'
  const [selectedItem, setSelectedItem] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [arenaMatches, setArenaMatches] = useState([])
  const [participants, setParticipants] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Offline Tournament State
  const [offlinePlayers, setOfflinePlayers] = useState([])
  const [offlineMatches, setOfflineMatches] = useState([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinTarget, setSpinTarget] = useState(null)
  const [lastWinner, setLastWinner] = useState(null)
  const [offlineRound, setOfflineRound] = useState(1)
  const [offlineInput, setOfflineInput] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showNavSidebar, setShowNavSidebar] = useState(true)
  const [matchupPopup, setMatchupPopup] = useState(null) // { p1, p2 }
  const [showPodium, setShowPodium] = useState(false)

  // Sync Offline Data to Cloud
  const syncOfflineState = async (players, matches, round) => {
    try {
      await fetch('/api/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players, matches, round })
      })
    } catch (err) {
      console.error('Failed to sync offline state:', err)
    }
  }

  // Load Offline Data from Cloud
  useEffect(() => {
    const loadState = async () => {
      try {
        const res = await fetch('/api/offline')
        if (res.ok) {
          const data = await res.json()
          setOfflinePlayers(data.players || [])
          setOfflineMatches(data.matches || [])
          setOfflineRound(data.round || 1)
        }
      } catch (err) {
        console.error('Failed to load global offline state:', err)
      }
    }
    loadState()
  }, [])

  const addOfflinePlayer = async (e) => {
    e.preventDefault()
    if (!offlineInput.trim()) return
    const newPlayers = [...offlinePlayers, offlineInput.trim()]
    setOfflinePlayers(newPlayers)
    setOfflineInput('')
    await syncOfflineState(newPlayers, offlineMatches, offlineRound)
  }

  const handleRouletteComplete = async (selected) => {
    // Stage 1: Stop the spinning state immediately
    setIsSpinning(false)
    setSpinTarget(null)

    // Stage 2: Wait for the user to "process" the visual stop before showing the modal
    setTimeout(async () => {
      setLastWinner(selected)

      const nextMatches = (() => {
        const lastMatch = offlineMatches[offlineMatches.length - 1]
        if (lastMatch && !lastMatch.player2 && !lastMatch.winner) {
          // This is the 2nd spin — a pair is now complete!
          const completed = { ...lastMatch, player2: selected }
          // Trigger the match announcement popup
          setTimeout(() => setMatchupPopup({ p1: completed.player1, p2: selected }), 600)
          return offlineMatches.map((m, i) => i === offlineMatches.length - 1 ? completed : m)
        } else {
          return [...offlineMatches, { id: Date.now(), player1: selected, player2: null, winner: null, round: offlineRound }]
        }
      })()

      setOfflineMatches(nextMatches)
      await syncOfflineState(offlinePlayers, nextMatches, offlineRound)
    }, 1200)
  }

  const handleNextRound = async () => {
    const currentRoundMatches = offlineMatches.filter(m => m.round === offlineRound)
    const winners = currentRoundMatches.filter(m => m.winner).map(m => m.winner)
    const losers = currentRoundMatches.filter(m => m.winner).map(m => m.winner === m.player1 ? m.player2 : m.player1)

    if (winners.length < 1) {
      notify({ message: "No victors found. Resolve matches to advance.", type: 'error' })
      return
    }

    // SPECIAL CASE: Semi-Finals (2 matches in round) -> Prepare Championship Phase
    if (currentRoundMatches.length === 2 && winners.length === 2) {
      const nextR = offlineRound + 1
      const finals = { id: Date.now(), player1: winners[0], player2: winners[1], winner: null, round: nextR, type: 'FINALS' }
      const bronze = { id: Date.now() + 1, player1: losers[0], player2: losers[1], winner: null, round: nextR, type: 'BRONZE' }

      const nextMatches = [...offlineMatches, finals, bronze]
      const nextPlayers = [...winners, ...losers]
      setOfflineMatches(nextMatches)
      setOfflinePlayers(nextPlayers)
      setOfflineRound(nextR)
      await syncOfflineState(nextPlayers, nextMatches, nextR)
      notify({ message: "SEMI-FINALS COMPLETE. Grand Finals & 3rd Place matches initialized.", type: 'success' })

      // Show Grand Finals announcement popup
      setTimeout(() => {
        setMatchupPopup({ p1: winners[0], p2: winners[1], type: 'FINALS' })
      }, 600)

      return
    }

    // Standard Progression: Promo winners to next round pool
    if (winners.length < 2) {
      notify({ message: "Not enough victors to form a next round. Add more players or resolve all matches.", type: 'warning' })
      return
    }

    const nextR = offlineRound + 1
    setOfflinePlayers(winners)
    setOfflineRound(nextR)
    await syncOfflineState(winners, offlineMatches, nextR)
    notify({ message: `Phase ${offlineRound} complete. Transitioning to Phase ${nextR}.`, type: 'success' })
  }

  const handleResetTournament = async () => {
    if (await confirm('CRITICAL ACTION: This will permanently wipe all players, match history, and tournament rounds. Proceed?')) {
      setOfflinePlayers([])
      setOfflineMatches([])
      setOfflineRound(1)
      await syncOfflineState([], [], 1)
      notify({ message: 'Tournament data purged.', type: 'success' })
    }
  }

  const isMaster = session?.user?.role === 'DEV' || session?.user?.role === 'OWNER'
  const isEligible = isMaster || session?.user?.role === 'STAFF'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && !isEligible) {
      router.push('/')
    }
  }, [status, session, router, isEligible])

  const fetchData = async () => {
    setLoading(true)
    try {
      const tRes = await fetch('/api/admin/tournaments')
      if (tRes.ok) {
        const tData = await tRes.json()
        setTournaments(Array.isArray(tData) ? tData : [])
      }

      if (isMaster) {
        const uRes = await fetch('/api/admin/users')
        if (uRes.ok) {
          const uData = await uRes.json()
          setUsers(Array.isArray(uData) ? uData : [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchArenaData = async (tournamentId) => {
    try {
      const res = await fetch(`/api/admin/matches?tournamentId=${tournamentId}`)
      if (res.ok) {
        const data = await res.json()
        setArenaMatches(data.matches || [])
        setParticipants(data.participants || [])
      }
    } catch (err) {
      console.error('Failed to fetch arena data:', err)
    }
  }

  const handleStartArena = async (tournament) => {
    if (!await confirm('Shuffle all participants and deploy initial bracket?')) return
    setFormLoading(true)
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament.id}/start`, { method: 'POST' })
      if (res.ok) {
        fetchData()
        openArena(tournament)
        notify({ message: 'Arena bracket deployed successfully.', type: 'success' })
      } else {
        const err = await res.json()
        notify({ message: `${err.message}${err.details ? `: ${err.details}` : ''}` || 'Failed to start arena', type: 'error' })
      }
    } catch (err) {
      console.error('Error starting arena:', err)
      notify({ message: 'System error during deployment.', type: 'error' })
    } finally {
      setFormLoading(false)
    }
  }

  const openArena = (tournament) => {
    setSelectedItem(tournament)
    setModalOpen('arena')
    fetchArenaData(tournament.id)
  }
  const handleUpdateMatch = async (payload) => {
    setFormLoading(true)
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        fetchArenaData(selectedItem.id)
        notify({ message: 'Match data synchronized.', type: 'success' })
      } else {
        const err = await res.json()
        notify({ message: err.message + (err.details ? ': ' + err.details : ''), type: 'error' })
      }
    } catch (err) {
      console.error('Error updating match:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleSaveTournament = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      date: formData.get('date'),
      maxPlayers: parseInt(formData.get('maxPlayers')),
      prize: formData.get('prize'),
      gameplayMode: formData.get('gameplayMode'),
      roundsPerMatch: parseInt(formData.get('roundsPerMatch')) || 1,
      startTime: formData.get('startTime') || undefined
    }

    try {
      const url = '/api/admin/tournaments'
      const method = selectedItem?.id ? 'PATCH' : 'POST'
      if (selectedItem?.id) data.id = selectedItem.id

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setModalOpen(null)
        setSelectedItem(null)
        fetchData()
        notify({ message: 'Tournament log updated.', type: 'success' })
      } else {
        const error = await res.json()
        notify({ message: error.message || 'Failed to save tournament', type: 'error' })
      }
    } catch (err) {
      console.error('Error saving tournament:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.target)
    const data = {
      id: selectedItem.id,
      username: formData.get('username'),
      email: formData.get('email'),
      role: formData.get('role'),
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setModalOpen(null)
        setSelectedItem(null)
        fetchData()
        notify({ message: 'Agent profile updated.', type: 'success' })
      } else {
        const error = await res.json()
        notify({ message: error.message || 'Failed to update agent', type: 'error' })
      }
    } catch (err) {
      console.error('Error updating agent:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/admin/tournaments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      if (res.ok) fetchData()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleDeleteTournament = async (id) => {
    if (!await confirm('Are you sure you want to delete this tournament?')) return
    try {
      const res = await fetch(`/api/admin/tournaments?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (err) {
      console.error('Failed to delete tournament:', err)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!await confirm('Are you sure you want to delete this agent?')) return
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  const handleUpdateUserRole = async (id, newRole) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole })
      })
      if (res.ok) fetchData()
    } catch (err) {
      console.error('Failed to update role:', err)
    }
  }

  const handleKickParticipant = async (tournamentId, userId) => {
    if (!await confirm("CRITICAL ACTION: Terminate this agent's contract for this tournament?")) return
    try {
      const res = await fetch(`/api/admin/tournaments/roster?tournamentId=${tournamentId}&userId=${userId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        notify({ message: 'Agent removed from roster.', type: 'success' })
        fetchData()
        // Update selected item to refresh roster modal if open
        const updatedT = tournaments.find(t => t.id === tournamentId)
        if (updatedT) {
          setSelectedItem({
            ...updatedT,
            participants: updatedT.participants.filter(p => p.userId !== userId)
          })
        }
      } else {
        const data = await res.json()
        notify({ message: data.message || 'Kick failed', type: 'error' })
      }
    } catch (err) {
      notify({ message: 'Operational failure during termination.', type: 'error' })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[#D4AF37] font-display text-sm tracking-widest animate-pulse uppercase">Syncing Clearance Levels...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar - Desktop */}
      <motion.aside
        animate={{ width: showNavSidebar ? 288 : 72 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="hidden lg:flex flex-shrink-0 border-r border-white/5 p-4 flex-col gap-6 bg-[#050505] sticky top-0 h-screen overflow-hidden"
      >
        {/* Toggle Button */}
        <div className="flex items-center justify-between">
          {showNavSidebar && (
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-black border border-[#D4AF37]/30 flex items-center justify-center rounded-sm">
                  {isMaster ? <Terminal size={24} className="text-[#D4AF37]" /> : <Shield size={24} className="text-[#D4AF37]/50" />}
                </div>
                {isMaster && <div className="absolute -inset-1 bg-[#D4AF37]/20 blur-xl rounded-full" />}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold tracking-[0.2em] uppercase text-[#D4AF37] font-display leading-tight whitespace-nowrap">
                  {session?.user?.role === 'DEV' ? 'System Terminal' : 'Elite Control'}
                </div>
                <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] whitespace-nowrap">{session?.user?.role} ACCESS</div>
              </div>
            </div>
          )}
          {!showNavSidebar && (
            <div className="w-10 h-10 bg-black border border-[#D4AF37]/30 flex items-center justify-center rounded-sm mx-auto">
              {isMaster ? <Terminal size={18} className="text-[#D4AF37]" /> : <Shield size={18} className="text-[#D4AF37]/50" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showNavSidebar && <div className="h-[1px] flex-1 bg-white/5" />}
          <button
            onClick={() => setShowNavSidebar(!showNavSidebar)}
            className="flex-shrink-0 p-2.5 bg-white/5 border border-white/10 rounded-sm hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/30 transition-all text-[#D4AF37]"
            title={showNavSidebar ? 'Collapse Nav' : 'Expand Nav'}
          >
            <motion.div animate={{ rotate: showNavSidebar ? 0 : 180 }} transition={{ duration: 0.3 }}>
              <ChevronLeft size={16} />
            </motion.div>
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`flex items-center gap-4 px-3 py-4 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all group ${activeTab === 'tournaments' ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'text-white/40 hover:bg-white/5'}`}
            title="Tournaments"
          >
            <Trophy size={16} className="flex-shrink-0" />
            {showNavSidebar && <span className="whitespace-nowrap">Tournaments</span>}
          </button>

          {isMaster && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-4 px-3 py-4 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all group ${activeTab === 'users' ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'text-white/40 hover:bg-white/5'}`}
              title="User Control"
            >
              <Users size={16} className="flex-shrink-0" />
              {showNavSidebar && <span className="whitespace-nowrap">User Control</span>}
            </button>
          )}

          <button
            onClick={() => setActiveTab('offline')}
            className={`flex items-center gap-4 px-3 py-4 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all group ${activeTab === 'offline' ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'text-white/40 hover:bg-white/5'}`}
            title="Offline Mode"
          >
            <Dna size={16} className="flex-shrink-0" />
            {showNavSidebar && <span className="whitespace-nowrap">Offline Mode</span>}
          </button>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-1">
            <a
              href="/"
              className="flex items-center gap-4 px-3 py-4 rounded text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all border border-[#D4AF37]/10"
              title="Public Interface"
            >
              <Globe size={14} className="flex-shrink-0" />
              {showNavSidebar && <span className="whitespace-nowrap">Public Interface</span>}
            </a>
          </div>
        </nav>

        <div className="mt-auto border-t border-white/5 pt-8">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 flex-shrink-0 rounded-full ${isMaster ? 'bg-gradient-to-br from-[#D4AF37] to-[#00f3ff]' : 'bg-white/10'} flex items-center justify-center text-[10px] font-bold text-[#D4AF37]`}>
              {session?.user?.username?.[0]?.toUpperCase()}
            </div>
            {showNavSidebar && (
              <div className="overflow-hidden">
                <div className="text-[10px] font-bold truncate text-white uppercase tracking-widest">{session?.user?.username}</div>
                <div className="text-[8px] text-white/30 uppercase tracking-[0.1em]">{session?.user?.role}</div>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#050505] border-r border-white/10 p-8 flex flex-col gap-10 z-[120] lg:hidden"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black border border-[#D4AF37]/30 flex items-center justify-center rounded-sm">
                    {isMaster ? <Terminal size={20} className="text-[#D4AF37]" /> : <Shield size={20} className="text-[#D4AF37]/50" />}
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37] font-display">System</div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-white/20 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => { setActiveTab('tournaments'); setIsSidebarOpen(false); }}
                  className={`flex items-center gap-4 px-5 py-4 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'tournaments' ? 'bg-[#D4AF37] text-black' : 'text-white/40'}`}
                >
                  <Trophy size={16} /> Tournaments
                </button>
                {isMaster && (
                  <button
                    onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-4 px-5 py-4 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'users' ? 'bg-[#D4AF37] text-black' : 'text-white/40'}`}
                  >
                    <Users size={16} /> User Control
                  </button>
                )}
                <button
                  onClick={() => { setActiveTab('offline'); setIsSidebarOpen(false); }}
                  className={`flex items-center gap-4 px-5 py-4 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'offline' ? 'bg-[#D4AF37] text-black' : 'text-white/40'}`}
                >
                  <Dna size={16} /> Offline Mode
                </button>
                <div className="mt-8 pt-8 border-t border-white/5">
                  <a href="/" className="flex items-center gap-4 px-5 py-4 rounded text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/10">
                    <Globe size={14} /> Public Interface
                  </a>
                </div>
              </nav>

              <div className="mt-auto flex items-center gap-3 border-t border-white/5 pt-8">
                <div className={`w-8 h-8 rounded-full ${isMaster ? 'bg-gradient-to-br from-[#D4AF37] to-[#00f3ff]' : 'bg-white/10'} flex items-center justify-center text-[10px] font-bold text-black`}>
                  {session?.user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white uppercase tracking-widest">{session?.user?.username}</div>
                  <div className="text-[8px] text-white/30 uppercase tracking-[0.1em]">{session?.user?.role}</div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#050505] z-[100]">
          <Hamburger
            isOpen={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="text-[10px] font-display font-black tracking-[0.3em] text-[#D4AF37]">
            ADMIN<span className="text-white/20">CTRL</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 p-4 md:p-12 lg:p-16 pt-10 lg:pt-32 overflow-y-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6">
            <div>
              <div className={`w-16 h-[2px] ${isMaster ? 'bg-[#D4AF37]' : 'bg-white/20'} mb-4 md:mb-6`} />
              <h1 className="text-4xl md:text-6xl font-display font-black mb-3 uppercase tracking-tighter text-white">
                {activeTab === 'tournaments' ? 'Registry' : activeTab === 'users' ? 'Hierarchy' : 'Local Ops'}
              </h1>
              <p className="text-white/40 text-[10px] md:text-sm font-light max-w-lg leading-relaxed uppercase tracking-widest">
                {activeTab === 'tournaments'
                  ? 'Central database for all competitive missions. Deployment and real-time result oversight.'
                  : activeTab === 'users' ? 'Centralized authority for agent enlisted status and operational clearances.'
                    : 'Local combat operations. Spin the wheel to deploy agents and manage offline brackets.'}
              </p>
            </div>
            {activeTab === 'offline' && (
              <form onSubmit={addOfflinePlayer} className="flex w-full md:w-auto gap-2">
                <input
                  value={offlineInput}
                  onChange={(e) => setOfflineInput(e.target.value)}
                  placeholder="Agent Name..."
                  className="contact-input py-4 px-6 text-[10px] w-full md:w-64"
                />
                <button
                  type="submit"
                  className="btn-primary py-4 px-8 text-[10px] font-black uppercase whitespace-nowrap"
                >
                  Enlist
                </button>
              </form>
            )}
            {activeTab === 'tournaments' && (
              <button
                onClick={() => { setSelectedItem(null); setModalOpen('tournament'); }}
                className="btn-primary flex items-center gap-3 px-6 md:px-10 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] w-full md:w-auto justify-center"
              >
                <Plus size={16} /> New Deployment
              </button>
            )}
          </header>

          {activeTab === 'tournaments' ? (
            <div className="grid grid-cols-1 gap-4">
              {tournaments.map((t) => (
                /* existing tournament cards */
                <div key={t.id} className="glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-6 md:gap-10 items-start sm:items-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-black border border-white/5 flex items-center justify-center rounded transition-all group-hover:border-[#D4AF37]/30">
                      <Trophy className={t.status === 'PLAYING' ? "text-[#00f3ff] animate-pulse" : "text-[#D4AF37]/30"} size={32} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 md:gap-5 mb-3">
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight font-display">{t.name}</h3>
                        <span className="text-[8px] px-3 py-1 font-black uppercase tracking-[0.2em] border border-white/10 bg-white/5 text-white/40">{t.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 md:gap-8 text-white/20 text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase">
                        <span className="flex items-center gap-2 font-mono">{t.gameplayMode}</span>
                        <span className="flex items-center gap-2">{new Date(t.date).toLocaleDateString()}</span>
                        <span className="text-[#D4AF37]/60">{t.prize}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedItem(t); setModalOpen('roster'); }}
                          className="flex items-center gap-2 text-[#00f3ff]/60 hover:text-[#00f3ff] transition-colors border-l border-white/10 pl-4"
                        >
                          <Users size={12} /> {t.participants?.length || 0}/{t.maxPlayers} DEP
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => t.status === 'OPEN' ? handleStartArena(t) : openArena(t)}
                      className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm flex items-center gap-2 ${t.status === 'OPEN' ? 'bg-[#D4AF37] text-black' : 'bg-[#00f3ff] text-black'}`}
                    >
                      {t.status === 'OPEN' ? 'Start Battle' : 'Enter Arena'}
                    </button>
                    <div className="flex gap-1 ml-4 grayscale group-hover:grayscale-0 opacity-20 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setSelectedItem(t); setModalOpen('roster'); }} title="View Roster" className="p-3 hover:text-[#00f3ff]"><Users size={18} /></button>
                      <button onClick={() => { setSelectedItem(t); setModalOpen('tournament'); }} title="Edit Intel" className="p-3 hover:text-white"><Edit size={18} /></button>
                      <button onClick={() => handleDeleteTournament(t.id)} title="Terminate Deployment" className="p-3 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'users' ? (
            /* Agent hierarchy Management (isMaster only) */
            <div className="glass-card shadow-2xl overflow-hidden overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                {/* ... existing table code ... */}
                <thead>
                  <tr className="bg-white/2 text-[9px] font-black uppercase tracking-[0.4em] text-white/20 border-b border-white/5">
                    <th className="px-12 py-8">Agent Identity</th>
                    <th className="px-12 py-8">Clearance</th>
                    <th className="px-12 py-8">Enlistment</th>
                    <th className="px-12 py-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-all group">
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-8">
                          <div className={`w-14 h-14 bg-black border ${u.role === 'DEV' || u.role === 'OWNER' ? 'border-[#D4AF37]/30' : 'border-white/5'} flex items-center justify-center text-[#D4AF37] font-display text-xl font-black`}>
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-lg tracking-tighter mb-1 uppercase text-white/80">{u.username}</p>
                            <p className="text-white/20 text-[10px] uppercase tracking-widest font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          disabled={session?.user?.id === u.id}
                          className="bg-black border border-white/10 text-[10px] px-4 py-2 uppercase font-black tracking-[0.2em] text-[#D4AF37] disabled:opacity-50"
                        >
                          <option value="PLAYER">PLAYER</option>
                          <option value="STAFF">STAFF</option>
                          <option value="OWNER">OWNER</option>
                          <option value="DEV">DEV</option>
                        </select>
                      </td>
                      <td className="px-12 py-10 text-white/20 text-[10px] font-mono tracking-widest uppercase">
                        {new Date(u.createdAt).toISOString().split('T')[0]}
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => { setSelectedItem(u); setModalOpen('edit-user'); }}
                            className="p-3 text-white/10 hover:text-white transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            disabled={session?.user?.id === u.id}
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-3 text-white/10 hover:text-red-500 transition-colors disabled:opacity-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Offline Mode View */
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/30 transition-all text-[#D4AF37] group shadow-lg"
                  title={showSidebar ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  <motion.div
                    animate={{ rotate: showSidebar ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronLeft size={20} />
                  </motion.div>
                </button>
                <div className="h-[1px] flex-1 bg-white/5" />
                {!showSidebar && (
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Arena Focus Mode</span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Player Management */}
                <AnimatePresence mode="popLayout">
                  {showSidebar && (
                    <motion.div
                      initial={{ opacity: 0, x: -50, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "circOut" }}
                      className="lg:col-span-4 glass-card p-8 flex flex-col gap-6 relative"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Active Roster</h3>
                        <button
                          onClick={handleResetTournament}
                          className="text-[8px] font-bold text-red-500/30 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 group/reset transition-all"
                        >
                          <Trash2 size={12} className="group-hover/reset:animate-bounce" /> Reset Tournament
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {offlinePlayers.length === 0 ? (
                          <div className="text-center py-10 border border-dashed border-white/5 rounded text-white/10 text-[10px] uppercase font-bold tracking-widest">No agents enlisted</div>
                        ) : (
                          offlinePlayers.map((p, i) => {
                            const isLocked = offlineMatches.some(m => !m.winner && (m.player1 === p || m.player2 === p))
                            return (
                              <div key={i} className={`flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-sm transition-all group ${isLocked ? 'opacity-40 border-white/5' : 'hover:border-[#D4AF37]/30'}`}>
                                <div className="flex items-center gap-3">
                                  {isLocked && <Shield size={12} className="text-[#D4AF37]" />}
                                  <span className={`text-xs font-black uppercase tracking-tight ${isLocked ? 'text-white/40' : 'text-white/80'}`}>{p}</span>
                                </div>
                                {!isLocked && (
                                  <button
                                    onClick={() => setOfflinePlayers(offlinePlayers.filter((_, idx) => idx !== i))}
                                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Right Column: Tournament Deployment */}
                <motion.div
                  layout
                  className={`${showSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-8`}
                >
                  {/* Add Player Form (only visible when sidebar is hidden) */}
                  {!showSidebar && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={addOfflinePlayer}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={offlineInput}
                        onChange={(e) => setOfflineInput(e.target.value)}
                        placeholder="AGENT_NAME"
                        className="flex-1 bg-black/40 border border-white/5 p-4 text-xs font-bold uppercase tracking-widest text-white focus:border-[#D4AF37] outline-none transition-all placeholder:text-white/10"
                      />
                      <button type="submit" className="p-4 bg-[#D4AF37] text-black hover:scale-105 transition-all">
                        <Plus size={20} />
                      </button>
                    </motion.form>
                  )}

                  {/* Roulette */}
                  {(() => {
                    const availablePlayers = offlinePlayers.filter(p =>
                      !offlineMatches.some(m => !m.winner && (m.player1 === p || m.player2 === p))
                    )

                    if (offlinePlayers.length < 2) {
                      return (
                        <div className="h-[400px] glass-card flex flex-col items-center justify-center text-center p-12">
                          <Dna size={40} className="text-white/5 mb-6" />
                          <p className="text-white/20 text-xs uppercase font-bold tracking-widest max-w-[200px]">Enlist at least 2 agents to initialize roulette</p>
                        </div>
                      )
                    }

                    if (availablePlayers.length === 0) {
                      return (
                        <div className="h-[400px] glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-[#D4AF37]/20 bg-[#D4AF37]/5">
                          <Shield size={40} className="text-[#D4AF37]/20 mb-6" />
                          <h3 className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] mb-2">Operational Limit</h3>
                          <p className="text-white/40 text-[9px] uppercase font-bold tracking-widest max-w-[240px] leading-relaxed">All enlisted agents are currently deployed in active matches. Resolve a mission or enlist new agents to continue.</p>
                        </div>
                      )
                    }

                    return (
                      <div className="relative">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-gold)]/40">Randomized Deployment // Phase {offlineRound}</h3>
                          {offlineMatches.length > 0 && !offlineMatches[offlineMatches.length - 1].player2 && (
                            <div className="text-[10px] font-black uppercase text-[var(--color-gold)] animate-pulse">Select Opponent for {offlineMatches[offlineMatches.length - 1].player1}</div>
                          )}
                        </div>
                        <OfflineRoulette
                          players={availablePlayers}
                          isSpinning={isSpinning}
                          onComplete={handleRouletteComplete}
                        />
                        {isSpinning || lastWinner ? (
                          <AnimatePresence>
                            {lastWinner && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 m-auto w-full h-full bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-10 border border-[#D4AF37]/20 rounded-xl"
                              >
                                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-6 animate-pulse">Agent Selected</div>
                                <div className="text-4xl md:text-6xl font-display font-black uppercase text-white tracking-tighter mb-10">{lastWinner}</div>
                                <button
                                  onClick={() => setLastWinner(null)}
                                  className="px-12 py-5 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                  Acknowledge &amp; Continue
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        ) : (
                          <button
                            onClick={() => setIsSpinning(true)}
                            className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-[#D4AF37] text-black flex flex-col items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-[0_0_50px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform z-20"
                          >
                            <RotateCcw size={20} className="animate-spin-slow" />
                            Deploy
                          </button>
                        )}
                      </div>
                    )
                  })()}
                </motion.div>
              </div>

              {/* Bottom Row: Match Results */}
              <div className="glass-card p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-1">Active Missions</h3>
                    <p className="text-[9px] text-white/10 uppercase font-black tracking-widest">Ongoing combat operations for Phase {offlineRound}</p>
                  </div>

                  {(() => {
                    const currentMatches = offlineMatches.filter(m => m.round === offlineRound);
                    const allDone = currentMatches.length > 0 && currentMatches.every(m => m.winner);
                    const isChampionship = currentMatches.some(m => m.type === 'FINALS');

                    if (allDone) {
                      if (isChampionship) {
                        return (
                          <button
                            onClick={() => setShowPodium(true)}
                            className="px-8 py-3 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all flex items-center gap-3 animate-pulse"
                          >
                            <Trophy size={14} /> View Victory Ceremony
                          </button>
                        )
                      }

                      return (
                        <button
                          onClick={handleNextRound}
                          className="px-8 py-3 bg-[var(--color-gold)] text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all flex items-center gap-3"
                        >
                          <RotateCcw size={14} /> Initialize Phase {offlineRound + 1}
                        </button>
                      )
                    }
                    return null;
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {offlineMatches.filter(m => m.round === offlineRound).length === 0 ? (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded">
                      <p className="text-white/10 text-[10px] uppercase font-black tracking-widest">Awaiting deployment initialization...</p>
                    </div>
                  ) : (
                    offlineMatches.filter(m => m.round === offlineRound).map((m) => (
                      <div key={m.id} className={`p-6 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-6 relative overflow-hidden ${m.winner ? 'border-green-500/50' : m.type === 'FINALS' ? 'border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : m.type === 'BRONZE' ? 'border-orange-500/30' : 'border-[#00f3ff]/30'}`}>
                        <div className="flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">
                          <span className={m.type === 'FINALS' ? 'text-[#D4AF37]' : m.type === 'BRONZE' ? 'text-orange-500/60' : ''}>
                            {m.type === 'FINALS' ? 'GRAND FINALS' : m.type === 'BRONZE' ? 'BRONZE MATCH' : 'Local Match'}
                          </span>
                          <span>Phase {m.round}</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className={`flex justify-between items-center p-3 border rounded ${m.winner === m.player1 ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/5'}`}>
                            <span className={`text-xs font-black uppercase ${m.winner === m.player1 ? 'text-green-500' : 'text-white/60'}`}>{m.player1}</span>
                            {m.winner === m.player1 && <CheckCircle2 size={12} className="text-green-500" />}
                          </div>
                          <div className="text-center text-[10px] font-black text-white/20">VS</div>
                          <div className={`flex justify-between items-center p-3 border rounded ${m.winner === m.player2 ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/5'}`}>
                            <span className={`text-xs font-black uppercase ${m.winner === m.player2 ? 'text-green-500' : 'text-white/60'}`}>{m.player2 || 'Awaiting Opponent...'}</span>
                            {m.winner === m.player2 && <CheckCircle2 size={12} className="text-green-500" />}
                          </div>
                        </div>

                        {!m.winner && m.player2 && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => setOfflineMatches(prev => prev.map(match => match.id === m.id ? { ...match, winner: m.player1 } : match))}
                              className="flex-1 py-3 bg-white/5 hover:bg-green-500 hover:text-black transition-all text-[8px] font-black uppercase tracking-widest rounded"
                            >
                              Winner P1
                            </button>
                            <button
                              onClick={() => setOfflineMatches(prev => prev.map(match => match.id === m.id ? { ...match, winner: m.player2 } : match))}
                              className="flex-1 py-3 bg-white/5 hover:bg-green-500 hover:text-black transition-all text-[8px] font-black uppercase tracking-widest rounded"
                            >
                              Winner P2
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => setOfflineMatches(prev => prev.filter(match => match.id !== m.id))}
                          className="absolute top-2 right-2 text-white/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>


                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Match Announcement Popup */}
              <AnimatePresence>
                {matchupPopup && (() => {
                  const isFinals = matchupPopup.type === 'FINALS'
                  const isBronze = matchupPopup.type === 'BRONZE'
                  const accentColor = isBronze ? '#f97316' : '#D4AF37'
                  const p2Color = isBronze ? 'text-orange-400 drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'text-[#00f3ff] drop-shadow-[0_0_30px_rgba(0,243,255,0.3)]'
                  const glowBg = isBronze ? 'bg-orange-500/5' : 'bg-[#D4AF37]/5'
                  const borderColor = isBronze ? 'border-orange-500/10' : 'border-[#D4AF37]/10'
                  const vsGlow = isBronze ? 'rgba(249,115,22,0.8)' : 'rgba(212,175,55,0.8)'
                  const btnShadow = isBronze ? 'shadow-[0_0_40px_rgba(249,115,22,0.3)]' : 'shadow-[0_0_40px_rgba(212,175,55,0.3)]'
                  const btnBg = isBronze ? 'bg-orange-500 hover:bg-orange-400' : 'bg-[#D4AF37]'

                  const label = isFinals
                    ? '🏆 GRAND FINALS // Championship'
                    : isBronze
                      ? '🥉 3RD PLACE MATCH // Bronze Battle'
                      : `Match Confirmed // Phase ${offlineRound}`

                  return (
                    <motion.div
                      key={matchupPopup.type || 'match'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
                      onClick={() => setMatchupPopup(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.8, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-2xl text-center"
                      >
                        {/* Glow rings */}
                        <div className={`absolute inset-0 ${glowBg} blur-[80px] rounded-full pointer-events-none`} />
                        {isFinals && <div className="absolute inset-0 bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />}
                        <div className={`absolute -inset-4 border ${borderColor} rounded-2xl pointer-events-none`} />

                        {/* Label */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className={`text-[10px] font-black uppercase tracking-[0.6em] mb-8 ${isFinals ? 'text-[#D4AF37] animate-pulse' : isBronze ? 'text-orange-400/80' : 'text-[#D4AF37]/60'}`}
                        >
                          {label}
                        </motion.div>

                        {isFinals && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                            className="text-5xl mb-6"
                          >
                            🏆
                          </motion.div>
                        )}

                        {/* Names */}
                        <div className="flex items-center justify-center gap-6 md:gap-12">
                          <motion.div
                            initial={{ opacity: 0, x: -60 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="flex-1 text-right"
                          >
                            <div className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 mb-3">
                              {isFinals ? 'Finalist' : isBronze ? 'Contender' : 'Player 1'}
                            </div>
                            <div className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                              {matchupPopup.p1}
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
                            className="flex flex-col items-center gap-2 flex-shrink-0"
                          >
                            <div className="w-[2px] h-8 bg-gradient-to-b from-transparent" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)` }} />
                            <div className="text-2xl md:text-4xl font-display font-black" style={{ color: accentColor, filter: `drop-shadow(0 0 20px ${vsGlow})` }}>VS</div>
                            <div className="w-[2px] h-8" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)` }} />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="flex-1 text-left"
                          >
                            <div className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 mb-3">
                              {isFinals ? 'Finalist' : isBronze ? 'Contender' : 'Player 2'}
                            </div>
                            <div className={`text-3xl md:text-5xl font-display font-black uppercase tracking-tighter ${p2Color}`}>
                              {matchupPopup.p2}
                            </div>
                          </motion.div>
                        </div>

                        {/* Divider */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                          className="w-full h-[1px] my-10"
                          style={{ background: `linear-gradient(to right, transparent, ${accentColor}66, transparent)` }}
                        />

                        {/* Actions */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                          {isFinals && (
                            <button
                              onClick={() => {
                                const losers = offlineMatches
                                  .filter(m => m.round === offlineRound - 1 && m.winner)
                                  .map(m => m.winner === m.player1 ? m.player2 : m.player1)
                                setMatchupPopup({ p1: losers[0] || '?', p2: losers[1] || '?', type: 'BRONZE' })
                              }}
                              className="px-10 py-4 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-500/40 transition-all"
                            >
                              🥉 View Bronze Match
                            </button>
                          )}
                          <button
                            onClick={() => setMatchupPopup(null)}
                            className={`px-16 py-5 ${btnBg} text-black text-[10px] font-black uppercase tracking-[0.4em] hover:scale-105 transition-all ${btnShadow}`}
                          >
                            {isFinals ? 'Begin Finals' : isBronze ? 'Begin Bronze' : 'Begin Match'}
                          </button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )
                })()}
              </AnimatePresence>

              {/* Victory Podium Overlay */}
              <AnimatePresence>
                {showPodium && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-start overflow-y-auto pt-10 pb-20 px-6"
                  >
                    <div className="w-full max-w-4xl flex flex-col items-center">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-10 md:mb-12"
                      >
                        <Trophy size={48} className="text-[#D4AF37] mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
                        <h2 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tighter mb-2">Tournament Result</h2>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] animate-pulse">Phase Complete // Podium Locked</p>
                      </motion.div>

                      <div className="flex flex-col md:flex-row items-end justify-center gap-2 md:gap-0 w-full mb-10">
                        {/* 2nd Place */}
                        {(() => {
                          const finals = offlineMatches.find(m => m.type === 'FINALS' && m.winner);
                          const second = finals ? (finals.winner === finals.player1 ? finals.player2 : finals.player1) : 'Unknown';
                          return (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="flex-1 w-full md:w-auto flex flex-col items-center order-2 md:order-1"
                            >
                              <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Runner Up</div>
                              <div className="w-full bg-white/5 border border-white/5 rounded-t-xl p-6 md:p-8 flex flex-col items-center min-h-[120px] md:min-h-[150px] justify-center relative group">
                                <span className="text-md md:text-lg font-black uppercase text-white/80">{second}</span>
                                <div className="absolute -bottom-6 left-0 right-0 text-center text-3xl font-display font-black text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all">#2</div>
                              </div>
                            </motion.div>
                          )
                        })()}

                        {/* 1st Place */}
                        {(() => {
                          const finals = offlineMatches.find(m => m.type === 'FINALS' && m.winner);
                          const first = finals?.winner || 'Unknown';
                          return (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1.1, opacity: 1 }}
                              transition={{ delay: 0.7, type: 'spring' }}
                              className="flex-1 w-full md:w-auto flex flex-col items-center z-10 order-1 md:order-2"
                            >
                              <Trophy size={32} className="text-[#D4AF37] mb-2 animate-bounce" />
                              <div className="w-full bg-[#D4AF37] border border-white/20 rounded-t-xl p-8 md:p-10 flex flex-col items-center min-h-[160px] md:min-h-[200px] justify-center relative shadow-[0_0_80px_rgba(212,175,55,0.6)]">
                                <span className="text-xl md:text-3xl font-black uppercase text-black tracking-tighter text-center">{first}</span>
                                <div className="absolute -bottom-8 left-0 right-0 text-center text-7xl font-display font-black text-black drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">#1</div>
                              </div>
                            </motion.div>
                          )
                        })()}

                        {/* 3rd Place */}
                        {(() => {
                          const bronze = offlineMatches.find(m => m.type === 'BRONZE' && m.winner);
                          const third = bronze?.winner || 'Unknown';
                          return (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.9 }}
                              className="flex-1 w-full md:w-auto flex flex-col items-center order-3 md:order-3"
                            >
                              <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Bronze Medal</div>
                              <div className="w-full bg-orange-900/10 border border-orange-500/20 rounded-t-xl p-6 md:p-8 flex flex-col items-center min-h-[100px] md:min-h-[130px] justify-center relative group">
                                <span className="text-md md:text-lg font-black uppercase text-orange-500/60">{third}</span>
                                <div className="absolute -bottom-6 left-0 right-0 text-center text-3xl font-display font-black text-red-600 group-hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.3)] transition-all">#3</div>
                              </div>
                            </motion.div>
                          )
                        })()}
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-10 w-full md:w-auto">
                        <button
                          onClick={() => setShowPodium(false)}
                          className="px-8 py-4 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                        >
                          Dismiss Ceremony
                        </button>
                        <button
                          onClick={() => { setShowPodium(false); handleResetTournament(); }}
                          className="px-10 py-4 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 transition-all"
                        >
                          Initialize New Tournament
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Historical Archive: Mission Logs */}
              {offlineRound > 1 && (
                <div className="glass-card p-10 mt-10">
                  <div className="flex items-center gap-4 mb-8">
                    <Play size={16} className="text-white/20 rotate-90" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Mission Archives // History</h3>
                  </div>

                  <div className="space-y-10">
                    {Array.from({ length: offlineRound - 1 }, (_, i) => i + 1).reverse().map(roundNum => (
                      <div key={roundNum} className="border-l border-white/5 pl-8 py-2">
                        <div className="mb-6">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-gold)]/60">Phase {roundNum} Log</span>
                          <div className="text-[8px] text-white/10 uppercase font-black tracking-widest mt-1">Status: Completed</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                          {offlineMatches.filter(m => m.round === roundNum).map(m => (
                            <div key={m.id} className="p-4 bg-white/5 border border-white/5 rounded flex justify-between items-center gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-tighter truncate max-w-[80px] ${m.winner === m.player1 ? 'text-[var(--color-gold)] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'text-white/40'}`}>
                                {m.player1}
                              </span>
                              <span className="text-[8px] text-white/10 shrink-0">VS</span>
                              <span className={`text-[10px] font-black uppercase tracking-tighter truncate max-w-[80px] text-right ${m.winner === m.player2 ? 'text-[var(--color-gold)] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'text-white/40'}`}>
                                {m.player2}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Edit User Modal */}
        <AnimatePresence>
          {modalOpen === 'edit-user' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-xl p-6 md:p-12 border-t-2 border-[#D4AF37]">
                <div className="flex justify-between items-center mb-8 md:mb-10">
                  <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tighter">Edit Agent Profile</h2>
                  <button onClick={() => setModalOpen(null)}><X size={24} className="text-white/20 hover:text-white" /></button>
                </div>
                <form onSubmit={handleUpdateUser} className="space-y-6 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Username</label>
                    <input name="username" defaultValue={selectedItem?.username} required className="contact-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Email Address</label>
                    <input name="email" defaultValue={selectedItem?.email} required className="contact-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Access Role</label>
                    <select name="role" defaultValue={selectedItem?.role} className="contact-input bg-black">
                      <option value="PLAYER">PLAYER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="OWNER">OWNER</option>
                      <option value="DEV">DEV</option>
                    </select>
                  </div>
                  <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setModalOpen(null)} className="flex-1 py-4 border border-white/10 text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Cancel</button>
                    <button type="submit" disabled={formLoading} className="flex-1 py-4 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.4em]">Save Changes</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Arena Modal */}
        <AnimatePresence>
          {modalOpen === 'arena' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 border-b border-white/5 pb-6 md:pb-8 gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tighter">{selectedItem?.name}</h2>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                        {selectedItem?.gameplayMode} • WIN {Math.ceil((selectedItem?.roundsPerMatch || 1) / 2)} OF {selectedItem?.roundsPerMatch || 1}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/50">
                        {new Date(selectedItem?.date).toLocaleDateString()} @ {selectedItem?.startTime || 'TBD'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setModalOpen(null)} className="p-3 md:p-4 bg-white/5 rounded-full hover:bg-white/10 self-end md:self-auto"><X size={28} /></button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar p-0 md:p-10 bg-transparent md:bg-black/40 md:border border-white/5 rounded-xl flex flex-col relative">
                  {arenaMatches.length === 0 ? (
                    <div className="m-auto text-center">
                      <p className="text-white/30 text-sm tracking-widest uppercase mb-6 font-bold">No Match Data Found</p>
                      <button onClick={() => handleStartArena(selectedItem)} className="btn-primary px-8 py-4 text-[10px] tracking-widest uppercase">
                        Execute Match Generation
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-20 justify-center h-full items-center">
                      {[1, 2, 3].map((round) => (
                        <div key={round} className="flex flex-col gap-12 min-h-full">
                          <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] text-center">Round {round}</div>
                          <div className="flex flex-col gap-4">
                            {arenaMatches.filter(m => parseInt(m.round) === round).map((match) => (
                              <MatchCard
                                key={match.id}
                                match={match}
                                users={users}
                                isPvp={selectedItem?.gameplayMode === 'PVP'}
                                onUpdate={handleUpdateMatch}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <footer className="mt-10 flex justify-end">
                  <button onClick={() => handleUpdateStatus(selectedItem.id, 'FINISHED')} className="px-12 py-5 bg-white text-black font-black uppercase text-xs tracking-[0.4em]">Archive Arena</button>
                </footer>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Tournament Form Modal */}
        <AnimatePresence>
          {modalOpen === 'tournament' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-6 overflow-y-auto">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-2xl p-6 md:p-12 border-t-2 border-[#D4AF37] my-auto">
                <div className="flex justify-between items-center mb-8 md:mb-10">
                  <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tighter">{selectedItem ? 'Modify Registry' : 'Initialize Mission'}</h2>
                  <button onClick={() => setModalOpen(null)}><X size={24} className="text-white/20 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSaveTournament} className="space-y-8">
                  <input name="name" defaultValue={selectedItem?.name} required className="contact-input" placeholder="Tournament Name" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input name="date" type="date" defaultValue={selectedItem?.date ? new Date(selectedItem.date).toISOString().split('T')[0] : ''} required className="contact-input" />
                    <input name="startTime" type="time" defaultValue={selectedItem?.startTime || ''} className="contact-input uppercase" />
                    <select name="gameplayMode" defaultValue={selectedItem?.gameplayMode || 'TOURNAMENT'} className="contact-input bg-black"><option value="TOURNAMENT">TOURNAMENT</option><option value="PVP">PVP</option></select>
                    <select name="roundsPerMatch" defaultValue={selectedItem?.roundsPerMatch || 1} className="contact-input bg-black uppercase font-bold text-[#D4AF37]">
                      <option value="1">1 Game (Sudden Death)</option>
                      <option value="3">Best of 3</option>
                      <option value="5">Best of 5</option>
                      <option value="7">Best of 7</option>
                      <option value="9">Best of 9</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-white/30 ml-2">Limit Agents</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[2, 4, 8, 16, 32].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('maxPlayersInput');
                              input.value = num;
                              const btns = input.parentElement.querySelectorAll('button');
                              btns.forEach(b => b.classList.remove('bg-[#D4AF37]', 'text-black', 'border-[#D4AF37]'));
                              btns.forEach(b => b.classList.add('bg-white/5', 'text-white/40', 'border-white/10'));
                              const currentBtn = Array.from(btns).find(b => b.textContent === num.toString());
                              currentBtn.classList.remove('bg-white/5', 'text-white/40', 'border-white/10');
                              currentBtn.classList.add('bg-[#D4AF37]', 'text-black', 'border-[#D4AF37]');
                            }}
                            className={`py-3 text-[10px] font-black border transition-all ${(selectedItem?.maxPlayers === num || (!selectedItem && num === 8))
                              ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                              : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                              }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <input id="maxPlayersInput" name="maxPlayers" type="hidden" defaultValue={selectedItem?.maxPlayers || 8} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-white/30 ml-2">Tactical Prize</label>
                      <input name="prize" defaultValue={selectedItem?.prize} required className="contact-input" placeholder="Prize Pool" />
                    </div>
                  </div>
                  <div className="pt-8 flex gap-4">
                    <button type="button" onClick={() => setModalOpen(null)} className="flex-1 py-5 border border-white/5 text-white/20 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/5 transition-all">Cancel Mission</button>
                    <button type="submit" disabled={formLoading} className="flex-1 py-5 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-4">
                      {formLoading ? 'Synchronizing...' : (selectedItem ? 'Update Intel' : 'Deploy Mission')}
                      <Target size={18} />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Roster Management Modal */}
        <AnimatePresence>
          {modalOpen === 'roster' && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-2xl border-t-2 border-[#00f3ff]">
                <div className="p-8 md:p-12">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-[#00f3ff] font-display text-[9px] tracking-[0.4em] uppercase">Recruitment Dossier</span>
                        <div className="h-[1px] w-12 bg-[#00f3ff]/30" />
                      </div>
                      <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter text-white">
                        {selectedItem?.name}
                      </h2>
                      <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-mono mt-2">
                        Target Capacity: {selectedItem?.participants?.length || 0} / {selectedItem?.maxPlayers} Deployed Agents
                      </p>
                    </div>
                    <button onClick={() => setModalOpen(null)} className="p-3 text-white/20 hover:text-white transition-colors">
                      <X size={28} />
                    </button>
                  </div>

                  <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
                    {(!selectedItem?.participants || selectedItem.participants.length === 0) ? (
                      <div className="py-20 text-center border border-dashed border-white/5 rounded">
                        <Users className="mx-auto text-white/10 mb-4" size={48} />
                        <p className="text-white/20 text-xs font-black uppercase tracking-widest">No agents have enlisted for this operation yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {selectedItem.participants.map((p, idx) => (
                          <div key={p.id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                            <div className="flex items-center gap-6">
                              <span className="text-[10px] font-mono text-white/10">{String(idx + 1).padStart(2, '0')}</span>
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#00f3ff]/10 flex items-center justify-center text-[#00f3ff] text-[10px] font-black">
                                  {p.user?.username?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                                  {p.user?.username}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleKickParticipant(selectedItem.id, p.userId)}
                              className="text-[9px] font-black text-white/10 hover:text-red-500 hover:bg-red-500/10 px-4 py-2 border border-transparent hover:border-red-500/20 transition-all uppercase tracking-widest flex items-center gap-2"
                            >
                              <Trash2 size={12} /> Terminate Contract
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => setModalOpen(null)}
                      className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all"
                    >
                      Close Dossier
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
