import { create } from 'zustand'

export const useStore = create((set) => ({
  isLoading: true,
  loadingProgress: 0,
  isBroken: false,
  scrollProgress: 0,
  language: 'ENG',
  // Navigation Transitions
  transitionPhase: 'idle', // 'idle', 'closing', 'opening'
  isPortalOpen: false, // True when the portal finishes expanding
  
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setBroken: (broken) => set({ isBroken: broken }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setLanguage: (lang) => set({ language: lang }),
  
  setTransitionPhase: (phase) => set({ transitionPhase: phase }),
  setIsPortalOpen: (isOpen) => set({ isPortalOpen: isOpen }),
}))
