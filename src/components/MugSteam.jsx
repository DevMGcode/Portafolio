import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Efectos para una taza GLB:
 *  - Vapor (4 sprites animados subiendo)
 *  - Disco de café dentro (visible desde arriba — taza llena)
 *  - Coaster luminoso debajo (efecto "smart coaster")
 *
 * Se posiciona en la base de la taza. Los parámetros ajustan la altura/ancho
 * según el tamaño del modelo GLB.
 */
export default function MugSteam({
  position = [0, 0, 0],
  mugHeight = 0.18,      // altura aprox. de la taza
  rimRadius = 0.06,      // radio del borde superior
  baseRadius = 0.05,     // radio de la base
  coasterColor = '#ff66cc',
}) {
  const steamRefs = useRef([])
  const coffeeRef = useRef()

  // Textura suave del vapor
  const steamTexture = useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(255,255,255,0.7)')
    grad.addColorStop(0.4, 'rgba(255,255,255,0.25)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Partículas
  const particles = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      offsetX: (Math.random() - 0.5) * 0.025,
      offsetZ: (Math.random() - 0.5) * 0.025,
      speed: 0.35 + Math.random() * 0.25,
      phase: (i / 5) * 2,
      maxScale: 0.08 + Math.random() * 0.04,
    }))
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Animar vapor (sube y se desvanece)
    particles.forEach((p, i) => {
      const ref = steamRefs.current[i]
      if (!ref) return
      const progress = ((t * p.speed + p.phase) % 2) / 2
      const yOff = progress * 0.28
      const fade = Math.sin(progress * Math.PI)
      ref.position.x = p.offsetX + Math.sin(t * 1.3 + i) * 0.018
      ref.position.y = mugHeight + 0.005 + yOff
      ref.position.z = p.offsetZ + Math.cos(t * 1.1 + i) * 0.015
      const s = p.maxScale * fade
      ref.scale.set(s, s, s)
      if (ref.material) ref.material.opacity = 0.45 * fade
    })

    // Café líquido oscilando muy suave
    if (coffeeRef.current) {
      coffeeRef.current.position.y = mugHeight + 0.002 + Math.sin(t * 1.2) * 0.0008
    }
  })

  return (
    <group position={position}>
      {/* === CAFÉ DENTRO (lleno hasta el borde) === */}
      <mesh ref={coffeeRef} position={[0, mugHeight + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[rimRadius * 1.05, 48]} />
        <meshStandardMaterial
          color="#3a1a08"
          metalness={0.65}
          roughness={0.18}
          emissive="#5a2a14"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Reflejo crema más visible */}
      <mesh
        position={[-rimRadius * 0.25, mugHeight + 0.003, rimRadius * 0.3]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[rimRadius * 0.32, 24]} />
        <meshBasicMaterial color="#9a5a30" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      {/* Reflejo "espuma" pequeño */}
      <mesh
        position={[rimRadius * 0.35, mugHeight + 0.004, -rimRadius * 0.15]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[rimRadius * 0.18, 16]} />
        <meshBasicMaterial color="#c89060" transparent opacity={0.5} toneMapped={false} />
      </mesh>

      {/* === VAPOR === */}
      {particles.map((p, i) => (
        <sprite
          key={i}
          ref={(el) => (steamRefs.current[i] = el)}
          position={[0, mugHeight + 0.005, 0]}
          scale={[0.0001, 0.0001, 0.0001]}
        >
          <spriteMaterial
            map={steamTexture}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.NormalBlending}
            toneMapped={false}
            color="#e8f4ff"
          />
        </sprite>
      ))}
    </group>
  )
}
