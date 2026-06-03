import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Luces LED RGB que salen de la lámpara del techo.
 * Combina varias point lights de colores + un glow sprite + spotlight cenital.
 */
export default function LampLight({ position }) {
  const sp1 = useRef()
  const sp2 = useRef()
  const sp3 = useRef()
  const glowRef = useRef()
  const haloRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Variación sutil de intensidad por luz (efecto LED RGB respirando)
    if (sp1.current) sp1.current.intensity = 8 + Math.sin(t * 1.2) * 2
    if (sp2.current) sp2.current.intensity = 6 + Math.sin(t * 1.5 + 1) * 2
    if (sp3.current) sp3.current.intensity = 14 + Math.sin(t * 0.8 + 2) * 3
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.08
      glowRef.current.scale.set(s, s, s)
    }
    if (haloRef.current) {
      const s = 1 + Math.sin(t * 0.9 + 1) * 0.1
      haloRef.current.scale.set(s, s, s)
    }
  })

  const [x, y, z] = position

  return (
    <group>
      {/* Spotlight cenital potente hacia abajo (luz principal de la lámpara) */}
      <spotLight
        ref={sp3}
        position={[x, y - 0.2, z]}
        target-position={[x, 0, z]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={14}
        color="#ffeecc"
        distance={10}
        castShadow={false}
      />

      {/* 3 luces RGB pulsantes alrededor del centro */}
      <pointLight ref={sp1} position={[x - 0.5, y - 0.6, z]} color="#ff66cc" intensity={8} distance={4.5} />
      <pointLight ref={sp2} position={[x + 0.5, y - 0.6, z]} color="#66ccff" intensity={6} distance={4.5} />
      <pointLight position={[x, y - 0.6, z - 0.4]} color="#cc66ff" intensity={5} distance={4} />

      {/* Glow sprite — disco luminoso que se ve debajo de la lámpara */}
      <sprite ref={glowRef} position={[x, y - 0.5, z]} scale={2}>
        <spriteMaterial
          color="#ffe6cc"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          map={useGlowTexture()}
        />
      </sprite>

      {/* Halo RGB más grande y suave */}
      <sprite ref={haloRef} position={[x, y - 0.7, z]} scale={4.5}>
        <spriteMaterial
          color="#ff80cc"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          map={useGlowTexture()}
        />
      </sprite>
    </group>
  )
}

// Textura de halo glow generada una sola vez (gradiente radial blanco → transparente)
let _glowTexture = null
function useGlowTexture() {
  if (_glowTexture) return _glowTexture
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0,    'rgba(255,255,255,1)')
  grad.addColorStop(0.2,  'rgba(255,255,255,0.7)')
  grad.addColorStop(0.5,  'rgba(255,255,255,0.25)')
  grad.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  _glowTexture = new THREE.CanvasTexture(canvas)
  _glowTexture.colorSpace = THREE.SRGBColorSpace
  return _glowTexture
}
