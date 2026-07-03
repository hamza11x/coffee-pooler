'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, useProgress, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { useEffect } from 'react'

function Ball8() {
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={1}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial 
          color="#050505" 
          roughness={0.05} 
          metalness={0.9} 
          emissive="#000"
        />
        {/* The '8' circle */}
        <mesh position={[0, 0, 1.4]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.5, 64]} />
          <meshBasicMaterial color="#fff" />
          <Html position={[0, 0, 0.01]} center transform>
            <div className="text-black font-bold text-2xl select-none">8</div>
          </Html>
        </mesh>
      </mesh>
    </Float>
  )
}

export default function LoadingScreen() {
  const { progress } = useProgress()
  const { isLoading, setLoading, setLoadingProgress } = useStore()

  useEffect(() => {
    setLoadingProgress(progress)
    if (progress === 100) {
      setTimeout(() => setLoading(false), 2000)
    }
  }, [progress, setLoading, setLoadingProgress])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center"
        >
          <div className="w-full h-1/2">
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1.5} color="#D4AF37" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f3ff" />
              <Ball8 />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <motion.h2 
              initial={{ letterSpacing: "0.5em", opacity: 0 }}
              animate={{ letterSpacing: "0.1em", opacity: 1 }}
              className="text-[#D4AF37] text-3xl font-bold mb-4"
            >
              ARNADA POOL
            </motion.h2>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-[#D4AF37]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                style={{ boxShadow: "0 0 10px #D4AF37" }}
              />
            </div>
            <p className="text-white/40 mt-2 font-mono">{Math.round(progress)}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
