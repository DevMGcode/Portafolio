import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeWallTexture } from './textures'
import CyberCityWindow from './CyberCityWindow'

const ROOM_SIZE = 14
const ROOM_HEIGHT = 6
const WALL_Z = -6        // pared trasera
const WALL_X_L = -6      // pared izquierda
const WALL_X_R = 6       // pared derecha
const WALL_Z_F = 6       // pared frontal

// Color del trim del cuarto (LEDs, esquinas, zócalos): tono que combina con las paredes
const WALL_TRIM_COLOR = '#4a7099'        // steel blue tech

export default function Room() {
  // Textura procedural para las paredes (paneles tech con tornillos)
  const wallTexture = useMemo(() => makeWallTexture(), [])
  const ceilingRef = useRef()
  const currentOpacity = useRef(1)

  // Fade dinámico del techo según la altura de la cámara.
  // Cuando la cámara sube cerca o por encima del techo → se vuelve transparente
  // para no tapar la vista. Cuando baja, vuelve a aparecer suavemente.
  useFrame((state) => {
    if (!ceilingRef.current) return
    const camY = state.camera.position.y
    // Umbral: empieza a desvanecer 1 unidad antes del techo, totalmente invisible al llegar
    const fadeStart = ROOM_HEIGHT - 1.2
    const fadeEnd = ROOM_HEIGHT + 0.2
    let targetOpacity = 1
    if (camY >= fadeEnd) targetOpacity = 0
    else if (camY > fadeStart) {
      targetOpacity = 1 - (camY - fadeStart) / (fadeEnd - fadeStart)
    }
    // Lerp para suavizar
    currentOpacity.current += (targetOpacity - currentOpacity.current) * 0.12
    const op = currentOpacity.current
    ceilingRef.current.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material.transparent = true
        node.material.opacity = op
        node.material.depthWrite = op > 0.95
        node.visible = op > 0.01
      }
    })
  })

  return (
    <group>
      {/* ───── 4 PAREDES con textura tech ───── */}

      {/* Pared trasera */}
      <mesh position={[0, ROOM_HEIGHT / 2, WALL_Z]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" emissive="#1a2540" emissiveIntensity={0.4} metalness={0.3} roughness={0.7} side={THREE.FrontSide} />
      </mesh>

      {/* Pared izquierda */}
      <mesh position={[WALL_X_L, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" emissive="#1a2540" emissiveIntensity={0.4} metalness={0.3} roughness={0.7} side={THREE.FrontSide} />
      </mesh>

      {/* Pared derecha */}
      <mesh position={[WALL_X_R, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" emissive="#1a2540" emissiveIntensity={0.4} metalness={0.3} roughness={0.7} side={THREE.FrontSide} />
      </mesh>

      {/* Pared frontal */}
      <mesh position={[0, ROOM_HEIGHT / 2, WALL_Z_F]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" emissive="#1a2540" emissiveIntensity={0.4} metalness={0.3} roughness={0.7} side={THREE.FrontSide} />
      </mesh>

      {/* Techo con paneles suaves y núcleo luminoso para acompañar la lámpara */}
      <group ref={ceilingRef} position={[0, ROOM_HEIGHT, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
          <meshStandardMaterial
            color="#08131f"
            emissive="#0b1730"
            emissiveIntensity={0.45}
            metalness={0.3}
            roughness={0.9}
            side={THREE.FrontSide}
          />
        </mesh>

        <mesh position={[0, -0.028, 0]}>
          <boxGeometry args={[ROOM_SIZE - 1.2, 0.02, ROOM_SIZE - 1.2]} />
          <meshStandardMaterial color="#0c1525" emissive="#14284a" emissiveIntensity={0.18} metalness={0.28} roughness={0.94} />
        </mesh>

        <mesh position={[0, -0.024, 0]}>
          <boxGeometry args={[4.4, 0.018, 3.2]} />
          <meshStandardMaterial color="#111c31" emissive="#243d67" emissiveIntensity={0.22} metalness={0.3} roughness={0.9} />
        </mesh>

        <CeilingPanelGrid />
        <CeilingCoreGlow position={[0, -0.035, 0.24]} />
        <CeilingFinePaneling />

        <mesh position={[0, -0.017, 0]}>
          <boxGeometry args={[0.08, 0.02, ROOM_SIZE - 2.4]} />
          <meshStandardMaterial color="#17243b" emissive="#00ffff" emissiveIntensity={0.14} metalness={0.22} roughness={0.92} />
        </mesh>
        <mesh position={[0, -0.017, 0]}>
          <boxGeometry args={[ROOM_SIZE - 2.4, 0.02, 0.08]} />
          <meshStandardMaterial color="#17243b" emissive="#ff00ff" emissiveIntensity={0.1} metalness={0.22} roughness={0.92} />
        </mesh>

        <pointLight position={[0, -0.12, 0]} color="#fff2dd" intensity={0.8} distance={6} />
      </group>

      {/* ───── TIRA LED del techo (mismo tono que las paredes — elegante) ───── */}
      <LedStrip start={[-ROOM_SIZE/2, ROOM_HEIGHT - 0.05, WALL_Z + 0.05]}   end={[ROOM_SIZE/2, ROOM_HEIGHT - 0.05, WALL_Z + 0.05]}   color={WALL_TRIM_COLOR} />
      <LedStrip start={[WALL_X_L + 0.05, ROOM_HEIGHT - 0.05, -ROOM_SIZE/2]} end={[WALL_X_L + 0.05, ROOM_HEIGHT - 0.05, ROOM_SIZE/2]} color={WALL_TRIM_COLOR} />
      <LedStrip start={[WALL_X_R - 0.05, ROOM_HEIGHT - 0.05, -ROOM_SIZE/2]} end={[WALL_X_R - 0.05, ROOM_HEIGHT - 0.05, ROOM_SIZE/2]} color={WALL_TRIM_COLOR} />
      <LedStrip start={[-ROOM_SIZE/2, ROOM_HEIGHT - 0.05, WALL_Z_F - 0.05]} end={[ROOM_SIZE/2, ROOM_HEIGHT - 0.05, WALL_Z_F - 0.05]} color={WALL_TRIM_COLOR} />

      {/* ───── ESQUINAS VERTICALES (mismo tono — elegante) ───── */}
      <NeonCorner position={[WALL_X_L + 0.05, ROOM_HEIGHT / 2, WALL_Z + 0.05]}   height={ROOM_HEIGHT - 0.2} color={WALL_TRIM_COLOR} />
      <NeonCorner position={[WALL_X_R - 0.05, ROOM_HEIGHT / 2, WALL_Z + 0.05]}   height={ROOM_HEIGHT - 0.2} color={WALL_TRIM_COLOR} />
      <NeonCorner position={[WALL_X_L + 0.05, ROOM_HEIGHT / 2, WALL_Z_F - 0.05]} height={ROOM_HEIGHT - 0.2} color={WALL_TRIM_COLOR} />
      <NeonCorner position={[WALL_X_R - 0.05, ROOM_HEIGHT / 2, WALL_Z_F - 0.05]} height={ROOM_HEIGHT - 0.2} color={WALL_TRIM_COLOR} />

      {/* ───── ZÓCALOS EN EL PISO (mismo tono) ───── */}
      <mesh position={[0, 0.05, WALL_Z + 0.05]}>
        <boxGeometry args={[ROOM_SIZE, 0.08, 0.05]} />
        <meshStandardMaterial color={WALL_TRIM_COLOR} emissive={WALL_TRIM_COLOR} emissiveIntensity={1.0} toneMapped={false} />
      </mesh>
      <mesh position={[WALL_X_L + 0.05, 0.05, 0]}>
        <boxGeometry args={[0.05, 0.08, ROOM_SIZE]} />
        <meshStandardMaterial color={WALL_TRIM_COLOR} emissive={WALL_TRIM_COLOR} emissiveIntensity={1.0} toneMapped={false} />
      </mesh>
      <mesh position={[WALL_X_R - 0.05, 0.05, 0]}>
        <boxGeometry args={[0.05, 0.08, ROOM_SIZE]} />
        <meshStandardMaterial color={WALL_TRIM_COLOR} emissive={WALL_TRIM_COLOR} emissiveIntensity={1.0} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.05, WALL_Z_F - 0.05]}>
        <boxGeometry args={[ROOM_SIZE, 0.08, 0.05]} />
        <meshStandardMaterial color={WALL_TRIM_COLOR} emissive={WALL_TRIM_COLOR} emissiveIntensity={1.0} toneMapped={false} />
      </mesh>

      {/* ───── DECORACIÓN ───── */}
      {/* Ventana cyberpunk GRANDE con vista a la ciudad (pared trasera) */}
      <CyberCityWindow position={[-2.5, 3.2, WALL_Z + 0.05]} width={5.5} height={3.2} />
      {/* Cartel neón circular (pared izquierda) */}
      <NeonSign position={[WALL_X_L + 0.05, 3.5, 1.5]} rotation={[0, Math.PI / 2, 0]} color="#ff00ff" />
      {/* Cartel neón cuadrado (pared derecha) */}
      <NeonSquare position={[WALL_X_R - 0.05, 3.8, 3]} rotation={[0, -Math.PI / 2, 0]} color="#00ffff" />
      {/* Cartel triangular (pared frontal) */}
      <NeonSign position={[-4.5, 3.5, WALL_Z_F - 0.05]} rotation={[0, Math.PI, 0]} color="#00ff88" />

      {/* Alfombra */}
      <mesh position={[0, 0.02, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#1a0a2e" metalness={0.3} roughness={0.8} emissive="#ff00ff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function LedStrip({ start, end, color }) {
  const length = useMemo(() => {
    const dx = end[0] - start[0], dy = end[1] - start[1], dz = end[2] - start[2]
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }, [start, end])
  const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2]
  const isHorizontalX = Math.abs(end[0] - start[0]) > 0.1
  return (
    <>
      <mesh position={mid}>
        <boxGeometry args={isHorizontalX ? [length, 0.06, 0.06] : [0.06, 0.06, length]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <pointLight position={mid} color={color} intensity={4} distance={7} />
    </>
  )
}

function NeonCorner({ position, height, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.05, height, 0.05]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
  )
}

function CyberWindow({ position, width, height }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width + 0.15, height + 0.15, 0.05]} />
        <meshStandardMaterial color="#1a1f3a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#003355" toneMapped={false} />
      </mesh>
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[(-width / 2) + 0.3 + (i * 0.5), -height / 2 + 0.2 + Math.random() * (height - 0.5), 0.05]}>
          <boxGeometry args={[0.15, 0.15 + Math.random() * 0.6, 0.02]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[width, 0.04, 0.02]} />
        <meshStandardMaterial color="#0a0e1f" />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.04, height, 0.02]} />
        <meshStandardMaterial color="#0a0e1f" />
      </mesh>
    </group>
  )
}

function NeonSign({ position, rotation, color = '#ff00ff' }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <torusGeometry args={[0.6, 0.04, 16, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={6} distance={4.5} />
    </group>
  )
}

function NeonSquare({ position, rotation, color = '#00ffff' }) {
  return (
    <group position={position} rotation={rotation}>
      {[0, 1, 2, 3].map(i => {
        const w = 1.2 - i * 0.25
        return (
          <mesh key={i} position={[0, 0, i * 0.02]}>
            <torusGeometry args={[w, 0.025, 8, 4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
          </mesh>
        )
      })}
      <pointLight color={color} intensity={6} distance={4.5} />
    </group>
  )
}

function CeilingPanelGrid() {
  return (
    <group>
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[ROOM_SIZE - 2.2, 0.02, 0.06]} />
        <meshStandardMaterial color="#14213a" emissive="#1f6fbf" emissiveIntensity={0.16} metalness={0.25} roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[0.06, 0.02, ROOM_SIZE - 2.2]} />
        <meshStandardMaterial color="#14213a" emissive="#1f6fbf" emissiveIntensity={0.16} metalness={0.25} roughness={0.92} />
      </mesh>

      <mesh position={[0, -0.028, 0]}>
        <boxGeometry args={[3.8, 0.018, 2.7]} />
        <meshStandardMaterial color="#10192d" emissive="#1a2540" emissiveIntensity={0.2} metalness={0.28} roughness={0.9} />
      </mesh>

      <mesh position={[-3.1, -0.028, -2.3]}>
        <boxGeometry args={[1.5, 0.016, 1.1]} />
        <meshStandardMaterial color="#0f1827" emissive="#ff00ff" emissiveIntensity={0.08} metalness={0.2} roughness={0.95} />
      </mesh>
      <mesh position={[3.1, -0.028, -2.3]}>
        <boxGeometry args={[1.5, 0.016, 1.1]} />
        <meshStandardMaterial color="#0f1827" emissive="#00ffff" emissiveIntensity={0.08} metalness={0.2} roughness={0.95} />
      </mesh>

      <pointLight position={[0, -0.2, 0]} color="#7fd9ff" intensity={0.5} distance={5} />
    </group>
  )
}

function CeilingCoreGlow({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.04, 16, 64]} />
        <meshStandardMaterial color="#ffe6cc" emissive="#ffe6cc" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <torusGeometry args={[1.52, 0.025, 12, 64]} />
        <meshStandardMaterial color="#ff55cc" emissive="#ff55cc" emissiveIntensity={0.65} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.045, 0]}>
        <boxGeometry args={[3.6, 0.02, 2.4]} />
        <meshStandardMaterial color="#121a2e" emissive="#17315f" emissiveIntensity={0.24} metalness={0.22} roughness={0.86} />
      </mesh>
      <pointLight position={[0, -0.16, 0]} color="#fff0dd" intensity={1.0} distance={3.5} />
      <pointLight position={[0.65, -0.18, 0.35]} color="#00ffff" intensity={0.42} distance={2.8} />
      <pointLight position={[-0.65, -0.18, -0.35]} color="#ff00ff" intensity={0.38} distance={2.8} />
    </group>
  )
}

function CeilingFinePaneling() {
  const inset = ROOM_SIZE - 2.8
  const midLine = inset / 3
  return (
    <group>
      <mesh position={[-midLine, -0.032, 0]}>
        <boxGeometry args={[0.04, 0.01, inset]} />
        <meshStandardMaterial color="#18243c" emissive="#223a5f" emissiveIntensity={0.12} metalness={0.18} roughness={0.96} />
      </mesh>
      <mesh position={[midLine, -0.032, 0]}>
        <boxGeometry args={[0.04, 0.01, inset]} />
        <meshStandardMaterial color="#18243c" emissive="#223a5f" emissiveIntensity={0.12} metalness={0.18} roughness={0.96} />
      </mesh>
      <mesh position={[0, -0.032, -midLine]}>
        <boxGeometry args={[inset, 0.01, 0.04]} />
        <meshStandardMaterial color="#18243c" emissive="#223a5f" emissiveIntensity={0.12} metalness={0.18} roughness={0.96} />
      </mesh>
      <mesh position={[0, -0.032, midLine]}>
        <boxGeometry args={[inset, 0.01, 0.04]} />
        <meshStandardMaterial color="#18243c" emissive="#223a5f" emissiveIntensity={0.12} metalness={0.18} roughness={0.96} />
      </mesh>

      <mesh position={[-midLine / 2, -0.03, -midLine / 2]}>
        <boxGeometry args={[1.1, 0.014, 0.9]} />
        <meshStandardMaterial color="#101b2d" emissive="#ff00ff" emissiveIntensity={0.05} metalness={0.18} roughness={0.98} />
      </mesh>
      <mesh position={[midLine / 2, -0.03, -midLine / 2]}>
        <boxGeometry args={[1.1, 0.014, 0.9]} />
        <meshStandardMaterial color="#101b2d" emissive="#00ffff" emissiveIntensity={0.05} metalness={0.18} roughness={0.98} />
      </mesh>
      <mesh position={[-midLine / 2, -0.03, midLine / 2]}>
        <boxGeometry args={[1.1, 0.014, 0.9]} />
        <meshStandardMaterial color="#101b2d" emissive="#00ffff" emissiveIntensity={0.05} metalness={0.18} roughness={0.98} />
      </mesh>
      <mesh position={[midLine / 2, -0.03, midLine / 2]}>
        <boxGeometry args={[1.1, 0.014, 0.9]} />
        <meshStandardMaterial color="#101b2d" emissive="#ff00ff" emissiveIntensity={0.05} metalness={0.18} roughness={0.98} />
      </mesh>
    </group>
  )
}
