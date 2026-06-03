import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Luz puntual que pulsa con el ritmo (sine wave doble para sentir el "beat").
 * Visual: simula que un subwoofer está latiendo con la música.
 */
export default function PulsingLight({
  position = [0, 0, 0],
  color = '#ff00ff',
  baseIntensity = 1.5,
  pulseIntensity = 6,
  distance = 4,
  bpm = 95,
}) {
  const ref = useRef()
  const freq = bpm / 60

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    // Doble onda: una "kick" rápida + una sostenida
    const kick = Math.max(0, Math.sin(t * freq * Math.PI * 2))
    const sustain = (Math.sin(t * 1.5) + 1) / 2
    ref.current.intensity = baseIntensity + (kick * 0.7 + sustain * 0.3) * pulseIntensity
  })

  return <pointLight ref={ref} position={position} color={color} distance={distance} />
}
