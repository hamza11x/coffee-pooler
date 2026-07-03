'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function TransitionLink({ href, children, className, onClick }) {
  const router = useRouter()
  const pathname = usePathname()
  const setTransitionPhase = useStore((state) => state.setTransitionPhase)
  const setIsPortalOpen = useStore((state) => state.setIsPortalOpen)

  const handleClick = (e) => {
    // Check if the link is a hash link for the current page
    const isHash = href.startsWith('#') || (href.startsWith('/#') && pathname === '/')
    
    if (isHash) {
      // Allow default smooth scrolling for same-page anchors
      if (onClick) onClick(e)
      return
    }

    e.preventDefault()
    if (onClick) onClick(e)

    // If we're already on the target page, do nothing
    if (pathname === href) return

    // 1. Snappier disappearance
    setIsPortalOpen(false)

    // 2. Faster exit
    setTimeout(() => {
      // 3. Close the 8-ball portal
      setTransitionPhase('closing')

      // 4. Portal takes 800ms
      setTimeout(() => {
        // 5. Navigate
        router.push(href)

        // 6. Minimal pause
        setTimeout(() => {
          setTransitionPhase('opening')
          setIsPortalOpen(true)
        }, 400)
      }, 800)

    }, 400)
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
