import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Taza de café cyberpunk — proporciones de mug real.
 *  - Cuerpo cerámico ancho y bajo
 *  - Asa lateral notoria (semitoro grande)
 *  - Plato/coaster RGB debajo
 *  - Café líquido oscuro con reflejo
 *  - Vapor sutil (sprites que inician invisibles y se desvanecen al subir)
 *  - Logo "</>" en el cuerpo
 */
export default function CoffeeMug({
  color = '#1a1a2e',
  accentColor = '#ff66cc',
}) {
  const steamRefs = useRef([])
  const coffeeRef = useRef()

  // === PROPORCIONES de taza real (en metros) ===
  // Mug estándar: ~8cm diámetro × 9cm alto
  const RADIUS_TOP = 0.045
  const RADIUS_BOT = 0.04
  const HEIGHT = 0.09
  const COFFEE_Y = HEIGHT - 0.012

  // Textura del logo "</>"
  const logoTexture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, size, size)
    ctx.shadowColor = accentColor
    ctx.shadowBlur = 20
    ctx.fillStyle = accentColor
    ctx.font = 'bold 110px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('</>', size / 2, size / 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [accentColor])

  // Textura del vapor (gradiente radial muy suave)
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

  // Vapor: 4 sprites con noise individual (escala reducida para mug pequeño)
  const steamParticles = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      offsetX: (Math.random() - 0.5) * 0.02,
      offsetZ: (Math.random() - 0.5) * 0.02,
      speed: 0.35 + Math.random() * 0.25,
      phase: (i / 4) * 2,
      maxScale: 0.07 + Math.random() * 0.03,
    }))
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Animar vapor (recorrido vertical proporcional al tamaño del mug)
    steamParticles.forEach((p, i) => {
      const ref = steamRefs.current[i]
      if (!ref) return
      const progress = ((t * p.speed + p.phase) % 2) / 2     // 0..1 cíclico
      const yOff = progress * 0.22                            // sube 22cm
      const fade = Math.sin(progress * Math.PI)
      ref.position.x = p.offsetX + Math.sin(t * 1.3 + i) * 0.018
      ref.position.y = HEIGHT + 0.005 + yOff
      ref.position.z = p.offsetZ + Math.cos(t * 1.1 + i) * 0.015
      const s = p.maxScale * fade
      ref.scale.set(s, s, s)
      if (ref.material) ref.material.opacity = 0.45 * fade
    })

    // Café líquido oscilando muy suave
    if (coffeeRef.current) {
      coffeeRef.current.position.y = COFFEE_Y + Math.sin(t * 1.2) * 0.001
    }
  })

  return (
    <group>
      {/* Cuerpo cerámico (cono truncado — más realista) */}
      <mesh position={[0, HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[RADIUS_TOP, RADIUS_BOT, HEIGHT, 32, 1, false]} />
        <meshStandardMaterial
          color={color}
          metalness={0.05}
          roughness={0.45}
          emissive="#0a0a16"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Cara interior (oscura, vista desde arriba) */}
      <mesh position={[0, HEIGHT - 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.025, RADIUS_TOP - 0.003, 32]} />
        <meshStandardMaterial color="#0a0a14" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Logo "</>" en el frente */}
      <mesh position={[0, HEIGHT * 0.55, RADIUS_TOP - 0.002]}>
        <planeGeometry args={[0.055, 0.055]} />
        <meshBasicMaterial
          map={logoTexture}
          transparent
          opacity={0.95}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Asa lateral (semitoro a escala) */}
      <mesh position={[RADIUS_TOP + 0.003, HEIGHT * 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.028, 0.008, 12, 24, Math.PI]} />
        <meshStandardMaterial
          color={color}
          metalness={0.05}
          roughness={0.45}
        />
      </mesh>

      {/* Borde superior brillante */}
      <mesh position={[0, HEIGHT, 0]}>
        <torusGeometry args={[RADIUS_TOP - 0.001, 0.003, 8, 32]} />
        <meshStandardMaterial color="#2a2f48" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Café dentro */}
      <mesh ref={coffeeRef} position={[0, COFFEE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[RADIUS_TOP - 0.004, 32]} />
        <meshStandardMaterial
          color="#2b1408"
          metalness={0.7}
          roughness={0.15}
          emissive="#3a1f10"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Reflejo "crema" en el café */}
      <mesh position={[-0.008, COFFEE_Y + 0.001, 0.012]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.012, 16]} />
        <meshBasicMaterial color="#5a3018" transparent opacity={0.5} toneMapped={false} />
      </mesh>

      {/* Base de la taza — disco discreto */}
      <mesh position={[0, 0.002, 0]} receiveShadow>
        <cylinderGeometry args={[RADIUS_BOT, RADIUS_BOT, 0.004, 32]} />
        <meshStandardMaterial color={color} metalness={0.05} roughness={0.5} />
      </mesh>

      {/* Vapor — 4 sprites animados, parten invisibles */}
      {steamParticles.map((p, i) => (
        <sprite
          key={i}
          ref={(el) => (steamRefs.current[i] = el)}
          position={[0, HEIGHT + 0.005, 0]}
          scale={[0.0001, 0.0001, 0.0001]}    // CLAVE: arrancan invisibles
        >
          <spriteMaterial
            map={steamTexture}
            transparent
            opacity={0}                     // CLAVE: opacity 0 hasta que useFrame lo levante
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
