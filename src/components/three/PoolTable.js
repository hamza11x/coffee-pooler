'use client'

import { RigidBody, CuboidCollider } from '@react-three/rapier'

export function PoolTable() {
  const tableWidth = 2.54 // Regulation 9ft
  const tableLength = 1.27
  const railWidth = 0.15
  const railHeight = 0.1

  return (
    <group>
      {/* Table Surface (Felt) */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.05, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[tableWidth, 0.1, tableLength]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
        </mesh>
        <CuboidCollider args={[tableWidth / 2, 0.05, tableLength / 2]} />
      </RigidBody>

      {/* Rails (Gold) */}
      {/* Top Rail */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, railHeight / 2, -tableLength / 2 - railWidth / 2]}>
        <mesh castShadow>
          <boxGeometry args={[tableWidth + railWidth * 2, railHeight, railWidth]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Bottom Rail */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, railHeight / 2, tableLength / 2 + railWidth / 2]}>
        <mesh castShadow>
          <boxGeometry args={[tableWidth + railWidth * 2, railHeight, railWidth]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Left Rail */}
      <RigidBody type="fixed" colliders="cuboid" position={[-tableWidth / 2 - railWidth / 2, railHeight / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[railWidth, railHeight, tableLength]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Right Rail */}
      <RigidBody type="fixed" colliders="cuboid" position={[tableWidth / 2 + railWidth / 2, railHeight / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[railWidth, railHeight, tableLength]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Table Structure (Base) */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[tableWidth + 0.2, 1, tableLength + 0.2]} />
        <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}
