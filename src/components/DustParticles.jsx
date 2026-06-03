import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Partículas de polvo cinemáticas flotando en el cuarto.
 *  - Motas pequeñas con glow tinte cyan/magenta/violeta
 *  - Drift muy lento con noise procedural por partícula
 *  - Vida cíclica (fade in / out al loop)
 *  - Distribución volumétrica en el cuarto
 */
export default function DustParticles({
  count = 90,
  roomSize = 11,        // ancho/largo del volumen
  roomHeight = 5.5,     // alto del volumen
}) {
  const meshRef = useRef()

  // Textura suave del punto (gradiente radial)
  const texture = useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0,    'rgba(255,255,255,1)')
    grad.addColorStop(0.4,  'rgba(255,255,255,0.5)')
    grad.addColorStop(1,    'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Partículas (posición base + speed individual)
  const particles = useMemo(() => {
    const tints = [
      new THREE.Color('#00ddff'),     // cyan
      new THREE.Color('#ff66cc'),     // magenta
      new THREE.Color('#a78bfa'),     // violeta
      new THREE.Color('#e8f4ff'),     // blanco azulado
    ]
    return Array.from({ length: count }, () => ({
      basePos: new THREE.Vector3(
        (Math.random() - 0.5) * (roomSize - 1),
        1.8 + Math.random() * (roomHeight - 1.8),     // mínimo 1.8m (arriba de cabezas)
        (Math.random() - 0.5) * (roomSize - 1),
      ),
      driftSpeedX: 0.04 + Math.random() * 0.08,
      driftSpeedY: 0.02 + Math.random() * 0.04,
      driftSpeedZ: 0.04 + Math.random() * 0.08,
      driftAmpX: 0.15 + Math.random() * 0.25,
      driftAmpY: 0.08 + Math.random() * 0.15,
      driftAmpZ: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      tint: tints[Math.floor(Math.random() * tints.length)],
      sizeBase: 0.04 + Math.random() * 0.05,
    }))
  }, [count, roomSize, roomHeight])

  // BufferGeometry: positions + colors + sizes
  const { geometry, positionsAttr, colorsAttr } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    particles.forEach((p, i) => {
      positions[i * 3]     = p.basePos.x
      positions[i * 3 + 1] = p.basePos.y
      positions[i * 3 + 2] = p.basePos.z
      colors[i * 3]     = p.tint.r
      colors[i * 3 + 1] = p.tint.g
      colors[i * 3 + 2] = p.tint.b
      sizes[i] = p.sizeBase
    })
    const geo = new THREE.BufferGeometry()
    const positionsAttr = new THREE.BufferAttribute(positions, 3)
    const colorsAttr = new THREE.BufferAttribute(colors, 3)
    const sizesAttr = new THREE.BufferAttribute(sizes, 1)
    geo.setAttribute('position', positionsAttr)
    geo.setAttribute('color', colorsAttr)
    geo.setAttribute('size', sizesAttr)
    return { geometry: geo, positionsAttr, colorsAttr }
  }, [count, particles])

  // Animar drift sutil de cada partícula
  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    const positions = positionsAttr.array
    particles.forEach((p, i) => {
      positions[i * 3]     = p.basePos.x + Math.sin(t * p.driftSpeedX + p.phase) * p.driftAmpX
      positions[i * 3 + 1] = p.basePos.y + Math.sin(t * p.driftSpeedY + p.phase * 1.3) * p.driftAmpY
      positions[i * 3 + 2] = p.basePos.z + Math.cos(t * p.driftSpeedZ + p.phase) * p.driftAmpZ
    })
    positionsAttr.needsUpdate = true
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        map={texture}
        vertexColors
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
