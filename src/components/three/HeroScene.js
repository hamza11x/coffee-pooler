'use client'

import { useRef, useEffect, Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, ContactShadows, useScroll } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useStore } from '@/lib/store'
import { PoolTable } from './PoolTable'
import { BilliardBall } from './BilliardBall'

gsap.registerPlugin(ScrollTrigger)

function BoxOfBalls() {
  const rack = []
  const spacing = 0.11 // slightly more than ball diameter (0.1)
  const rows = 5

  let count = 0
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i <= row; i++) {
      const x = row * (spacing * 0.866) + 0.5 // Triangle pointing towards negative X
      const z = (i - row / 2) * spacing
      count++
      rack.push(
        <BilliardBall
          key={count}
          position={[x, 0.06, z]}
          color={count === 8 ? "black" : (count % 2 === 0 ? "#D4AF37" : "#00f3ff")}
          number={count}
        />
      )
    }
  }
  return <>{rack}</>
}

function MainExperience() {
  const cueStickRef = useRef()
  const cueBallRef = useRef()
  const { setBroken, isBroken } = useStore()

  // Use GSAP to trigger the break shot on scroll
  useEffect(() => {
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "20% top",
      onEnter: () => {
        if (!isBroken && cueBallRef.current) {
          // Apply impulse to cue ball
          cueBallRef.current.applyImpulse({ x: 2, y: 0, z: 0 }, true)
          setBroken(true)

          // Animate cue stick away
          gsap.to(cueStickRef.current.position, {
            x: -2,
            duration: 0.5,
            ease: "power2.out"
          })
        }
      }
    })
  }, [isBroken, setBroken])

  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        <PoolTable />

        {/* Rack of balls */}
        <BoxOfBalls />

        {/* Cue Ball */}
        <RigidBody
          ref={cueBallRef}
          colliders="ball"
          position={[-0.8, 0.06, 0]}
          restitution={0.8}
          friction={0.2}
          linearDamping={0.4}
          angularDamping={0.4}
        >
          <mesh castShadow>
            <sphereGeometry args={[0.05, 32, 32]} />
            <meshStandardMaterial color="white" roughness={0.05} metalness={0.8} />
          </mesh>
        </RigidBody>

        {/* Cue Stick (Visual only for now) */}
        {!isBroken && (
          <group ref={cueStickRef} position={[-1.5, 0.1, 0]} rotation={[0, 0, -0.1]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.025, 1.5]} />
              <meshStandardMaterial color="#333" roughness={0.5} />
            </mesh>
            <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1]} />
              <meshStandardMaterial color="#D4AF37" metalness={1} />
            </mesh>
          </group>
        )}
      </Physics>

      <ambientLight intensity={0.2} />
      <spotLight
        position={[0, 5, 0]}
        intensity={2}
        angle={0.6}
        penumbra={0.5}
        castShadow
        color="#D4AF37"
      />
      <Environment preset="night" />
      <ContactShadows opacity={0.6} blur={2} />
    </>
  )
}

export default function HeroScene() {
  const { isLoading } = useStore()

  return (
    <div className={`hero-canvas transition-opacity duration-1000 ${isLoading ? 'opacity-20' : 'opacity-100'}`}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 2, 3]} fov={50} />
        <Suspense fallback={null}>
          <MainExperience />
        </Suspense>

        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 10, 0]} intensity={1.5} castShadow />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#D4AF37" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00f3ff" />
      </Canvas>
    </div>
  )
}
