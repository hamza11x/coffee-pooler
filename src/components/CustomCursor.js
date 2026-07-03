'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 12   // trail length
const COLORS = ['#D4AF37', '#c9a227', '#e8c84a', '#f0d060']

export default function CustomCursor() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -200, y: -200 })
  const particles = useRef([])
  const raf = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Size canvas to viewport
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Hide default cursor on desktop
    document.documentElement.style.cursor = 'none'

    // Track mouse
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }

      // Spawn a particle at cursor
      particles.current.push({
        x:     e.clientX,
        y:     e.clientY,
        vx:    (Math.random() - 0.5) * 1.2,
        vy:    (Math.random() - 0.5) * 1.2 - 0.5,
        size:  Math.random() * 3 + 1.5,
        alpha: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })

      // Keep trail bounded
      if (particles.current.length > 60) {
        particles.current.splice(0, particles.current.length - 60)
      }
    }
    window.addEventListener('mousemove', onMove)

    // Render loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update & draw particles
      particles.current = particles.current.filter((p) => p.alpha > 0.02)
      for (const p of particles.current) {
        p.x     += p.vx
        p.y     += p.vy
        p.vy    += 0.04   // slight gravity
        p.alpha *= 0.88   // fade
        p.size  *= 0.96   // shrink

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle   = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur  = 6
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(p.size, 0.3), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Draw tiny dot at exact cursor position
      const { x, y } = mouse.current
      ctx.save()
      ctx.globalAlpha = 1
      ctx.fillStyle   = '#D4AF37'
      ctx.shadowColor = '#D4AF37'
      ctx.shadowBlur  = 10
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      raf.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
      document.documentElement.style.cursor = ''
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
      aria-hidden="true"
    />
  )
}
