import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Halo sutil pulsante para indicar que un objeto es clickeable.
 * Combina: pointLight que pulsa + esfera con blending aditivo (aura).
 * Crece más fuerte cuando hovered.
 */
export default function ProjectAura({ color = '#00ffff', hovered = false, size = 0.5 }) {
  const lightRef = useRef()
  const haloRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const pulse = 0.5 + Math.sin(t * 1.8) * 0.5
    const intBase = hovered ? 1.4 : 0.4         // antes: 3.5 / 1.2
    const opacityBase = hovered ? 0.09 : 0.035   // antes: 0.18 / 0.08
    if (lightRef.current) {
      lightRef.current.intensity = intBase + pulse * 0.3
    }
    if (haloRef.current) {
      haloRef.current.material.opacity = opacityBase + pulse * 0.018
      const s = (hovered ? 1.08 : 1) + pulse * 0.025
      haloRef.current.scale.setScalar(s)
    }
  })

  return (
    <group>
      <pointLight ref={lightRef} color={color} intensity={0.6} distance={1.6} />
      <mesh ref={haloRef}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
