import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Ondas sonoras visuales saliendo de un punto: anillos concéntricos que crecen
 * y se desvanecen, simulando emisión de sonido. Estilo cyberpunk visualizer.
 *
 * Props:
 *  - position: [x, y, z] punto de origen
 *  - count: cantidad de anillos en escalonado
 *  - colorA / colorB: dos colores que se alternan
 *  - maxRadius: radio máximo del anillo antes de resetear
 *  - speed: velocidad de expansión
 *  - emitTowards: 'horizontal' (rings parados, anillo vertical) | 'floor' (acostados)
 */
export default function SoundWaves({
  position = [0, 0, 0],
  count = 4,
  colorA = '#00ffff',
  colorB = '#ff00ff',
  maxRadius = 3,
  speed = 1.2,
  emitTowards = 'horizontal',
}) {
  const ringsRef = useRef([])
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return
      // progreso 0..1 con offset escalonado
      const p = ((t * speed + offsets[i]) % 1)
      const radius = 0.15 + p * maxRadius
      const opacity = (1 - p) * 0.7   // fade out
      ring.scale.set(radius, radius, radius)
      ring.material.opacity = opacity
    })
  })

  const rotation = emitTowards === 'floor' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]

  return (
    <group position={position} rotation={rotation}>
      {offsets.map((_, i) => (
        <mesh key={i} ref={(el) => (ringsRef.current[i] = el)}>
          <ringGeometry args={[0.95, 1, 64]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? colorA : colorB}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
