'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert, Terminal } from 'lucide-react'

const ToastContext = createContext(null)

export const useNotify = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useNotify must be used within ToastProvider')
  return context.notify
}

export const useConfirm = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useConfirm must be used within ToastProvider')
  return context.confirm
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  const playSound = useCallback((type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      if (type === 'confirm') {
        oscillator.type = 'square'
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
      } else {
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
      }

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.3)
    } catch (e) {
      console.warn('Audio playback inhibited by browser policy or missing context.')
    }
  }, [])

  const notify = useCallback(({ message, type = 'info', duration = 5000 }) => {
    const id = Date.now()
    playSound('notify')
    setToasts(prev => [...prev, { id, message, type }])
    
    if (duration !== Infinity) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [playSound])

  const confirm = useCallback((message) => {
    playSound('confirm')
    return new Promise((resolve) => {
      setConfirmState({ message, resolve })
    })
  }, [playSound])

  const closeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const handleConfirmAction = (choice) => {
    if (confirmState) {
      confirmState.resolve(choice)
      setConfirmState(null)
    }
  }

  return (
    <ToastContext.Provider value={{ notify, confirm }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div className={`
                min-w-[320px] max-w-[400px] glass-card p-4 flex items-start gap-4 
                border-l-2 relative overflow-hidden group
                ${toast.type === 'success' ? 'border-l-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.1)]' : ''}
                ${toast.type === 'error' ? 'border-l-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''}
                ${toast.type === 'info' ? 'border-l-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.1)]' : ''}
              `}>
                <div className="shrink-0 mt-1">
                  {toast.type === 'success' && <CheckCircle2 size={18} className="text-[#D4AF37]" />}
                  {toast.type === 'error' && <AlertCircle size={18} className="text-red-500" />}
                  {toast.type === 'info' && <Info size={18} className="text-blue-400" />}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
                    {toast.type === 'success' ? 'Operation Success' : toast.type === 'error' ? 'System Failure' : 'Mission Update'}
                  </div>
                  <div className="text-xs font-medium text-white/90 leading-relaxed uppercase tracking-tight">
                    {toast.message}
                  </div>
                </div>
                <button 
                  onClick={() => closeToast(toast.id)}
                  className="shrink-0 p-1 text-white/10 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
                
                {/* Visual Glitch/Progress Bar */}
                <motion.div 
                   initial={{ scaleX: 1 }}
                   animate={{ scaleX: 0 }}
                   transition={{ duration: 5, ease: 'linear' }}
                   className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20 origin-left"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md p-8 md:p-10 border-t-2 border-[#D4AF37]"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[#D4AF37]/10 rounded-sm border border-[#D4AF37]/20">
                  <ShieldAlert size={24} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-black uppercase text-white tracking-tighter">Authorization Required</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Tactical Confirmation // Clearance Level 02</p>
                </div>
              </div>

              <div className="text-sm text-white/60 mb-10 leading-relaxed uppercase tracking-widest font-bold">
                {confirmState.message}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleConfirmAction(false)}
                  className="py-4 border border-white/10 text-white/30 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
                >
                  Abort Mission
                </button>
                <button 
                  onClick={() => handleConfirmAction(true)}
                  className="py-4 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all"
                >
                  Authorize Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}
