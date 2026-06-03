import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Ecualizador musical visualizer: barras verticales que bailan en sine wave.
 * Cada barra tiene su propia frecuencia/fase para crear ritmo orgánico.
 */
export default function MusicEqualizer({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  bars = 10,
  width = 1.6,
  height = 0.6,
  colorLow = '#00ffff',
  colorHigh = '#ff00ff',
  speed = 2.5,
}) {
  const refs = useRef([])

  // Frecuencias y fases random por barra (estables en re-renders)
  const params = useMemo(() => (
    Array.from({ length: bars }, (_, i) => ({
      freq: 1 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      offsetX: (i / (bars - 1) - 0.5) * width,
    }))
  ), [bars, width])

  // Color interpolado por barra
  const colors = useMemo(() => {
    const a = new THREE.Color(colorLow)
    const b = new THREE.Color(colorHigh)
    return params.map((_, i) => {
      const t = i / (bars - 1)
      return new THREE.Color().lerpColors(a, b, t)
    })
  }, [bars, colorLow, colorHigh, params])

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    params.forEach((p, i) => {
      const ref = refs.current[i]
      if (!ref) return
      // Onda 0..1 con multiplicador random para variar amplitud
      const amplitude = (Math.sin(t * p.freq + p.phase) + 1) / 2
      const h = 0.05 + amplitude * height
      ref.scale.y = h
      ref.position.y = h / 2  // ancla la barra al piso (Y=0 de su grupo padre)
    })
  })

  const barWidth = (width / bars) * 0.6

  return (
    <group position={position} rotation={rotation}>
      {params.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={[p.offsetX, 0, 0]}
        >
          <boxGeometry args={[barWidth, 1, barWidth]} />
          <meshStandardMaterial
            color={colors[i]}
            emissive={colors[i]}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
