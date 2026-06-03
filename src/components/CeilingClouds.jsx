import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Humo cyberpunk MUY sutil flotando en el techo.
 * Pocos sprites grandes, baja opacidad, colores tenues.
 */
export default function CeilingClouds({
  count = 6,
  ceilingY = 5.6,
  roomSize = 11,
}) {
  const texture = useMemo(() => makeSoftCloudTexture(), [])

  const clouds = useMemo(() => {
    // Tonos pastel oscuros — muy sutiles
    const tints = ['#5a4080', '#4a5a90', '#403060', '#3a4870', '#502a60']
    return Array.from({ length: count }, (_, i) => ({
      basePos: [
        (Math.random() - 0.5) * (roomSize - 1),
        ceilingY + (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * (roomSize - 1),
      ],
      scale: 4 + Math.random() * 2.5,
      speed: 0.03 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
      tint: tints[i % tints.length],
      opacity: 0.08 + Math.random() * 0.07,    // 8-15% muy bajo
    }))
  }, [count, ceilingY, roomSize])

  const refs = useRef([])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    clouds.forEach((c, i) => {
      const ref = refs.current[i]
      if (!ref) return
      // Drift muy lento
      ref.position.x = c.basePos[0] + Math.sin(t * c.speed + c.phase) * 0.8
      ref.position.z = c.basePos[2] + Math.cos(t * c.speed * 0.7 + c.phase) * 0.6
      if (ref.material) ref.material.rotation = t * 0.02 + c.phase
    })
  })

  return (
    <group>
      {clouds.map((c, i) => (
        <sprite
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={c.basePos}
          scale={c.scale}
        >
          <spriteMaterial
            map={texture}
            color={c.tint}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            blending={THREE.NormalBlending}    // ya no additive — más sutil
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  )
}

/**
 * Textura de nube MUY suave — gradiente radial sin noise para look limpio.
 */
function makeSoftCloudTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Solo un gradiente radial súper suave (sin noise para evitar look "estático TV")
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0,    'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,255,255,0.7)')
  grad.addColorStop(0.5,  'rgba(255,255,255,0.3)')
  grad.addColorStop(0.75, 'rgba(255,255,255,0.08)')
  grad.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  // Una pizca de irregularidad para que no sea perfectamente circular (forma de nube)
  // pero SUAVE: pocas "burbujas" grandes
  ctx.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 20 + Math.random() * 40
    const g2 = ctx.createRadialGradient(x, y, 0, x, y, r)
    g2.addColorStop(0, 'rgba(0,0,0,0.15)')
    g2.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g2
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  ctx.globalCompositeOperation = 'source-over'

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
