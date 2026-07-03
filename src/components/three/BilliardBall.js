'use client'

import { useRef } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useTexture } from '@react-three/drei'

export function BilliardBall({ position, color, number, isCue = false }) {
  const rbRef = useRef()

  return (
    <RigidBody
      ref={rbRef}
      colliders="ball"
      position={position}
      restitution={0.8}
      friction={0.2}
      angularDamping={0.5}
      linearDamping={0.5}
    >
      <mesh castShadow>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.5} 
        />
        {!isCue && (
          <mesh position={[0, 0, 0.048]}>
            <circleGeometry args={[0.02, 32]} />
            <meshBasicMaterial color="white" />
          </mesh>
        )}
      </mesh>
    </RigidBody>
  )
}
