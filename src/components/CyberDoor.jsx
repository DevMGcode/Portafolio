import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Puerta cyberpunk sliding tipo Star Wars / Star Trek:
 *  - Frame metálico gunmetal con LEDs
 *  - 2 paneles deslizantes con textura hex
 *  - Status indicator arriba (verde "OPEN/SECURE")
 *  - Pulse subtle en los LEDs
 *  - Pantalla "SECTOR_01" con scanlines
 *  - Hex pattern translúcido en los paneles
 */
export default function CyberDoor() {
  const rootRef = useRef()
  const ledRef = useRef()
  const statusRef = useRef()
  const scanlineRef = useRef()
  const currentOpacity = useRef(1)
  const _worldPos = useRef(new THREE.Vector3())

  // Textura del panel (hex con scanlines)
  const panelTexture = useMemo(() => makePanelTexture(), [])
  // Textura del display de status
  const displayTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 128
    return c
  }, [])
  const displayCanvasTexture = useMemo(() => {
    const t = new THREE.CanvasTexture(displayTexture)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [displayTexture])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // LEDs pulsando suave
    if (ledRef.current && ledRef.current.material) {
      ledRef.current.material.emissiveIntensity = 1.2 + Math.sin(t * 1.6) * 0.4
    }
    // Status indicador respirando
    if (statusRef.current && statusRef.current.material) {
      statusRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.6
    }
    // Scanline animado en el display
    const ctx = displayTexture.getContext('2d')
    drawStatusDisplay(ctx, t)
    displayCanvasTexture.needsUpdate = true

    // === FADE dinámico cuando la cámara está afuera ===
    // La puerta está en la pared frontal. Si la cámara cruza al otro lado, se vuelve translúcida
    // para no tapar la vista del interior. Si vuelve adentro, reaparece.
    if (!rootRef.current) return
    rootRef.current.getWorldPosition(_worldPos.current)
    const doorZ = _worldPos.current.z
    const camZ = state.camera.position.z
    // Si camera está más allá de la puerta (en +Z) → afuera → fade
    const distOutside = camZ - doorZ
    let targetOpacity = 1
    if (distOutside > 0.4) targetOpacity = 0.18      // bien afuera: muy translúcida
    else if (distOutside > 0) targetOpacity = 1 - (distOutside / 0.4) * 0.82
    // Lerp suave
    currentOpacity.current += (targetOpacity - currentOpacity.current) * 0.12
    const op = currentOpacity.current
    rootRef.current.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material.transparent = true
        node.material.opacity = op
        node.material.depthWrite = op > 0.85
      }
    })
  })

  // Dimensiones de la puerta
  const W = 1.6        // ancho total
  const H = 2.4        // alto total
  const D = 0.08       // profundidad del marco

  return (
    <group ref={rootRef}>
      {/* === MARCO DE LA PUERTA === */}
      {/* Lados verticales */}
      <mesh position={[-W / 2 - 0.04, 0, 0]} castShadow>
        <boxGeometry args={[0.08, H, D]} />
        <meshStandardMaterial color="#2c2f36" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[W / 2 + 0.04, 0, 0]} castShadow>
        <boxGeometry args={[0.08, H, D]} />
        <meshStandardMaterial color="#2c2f36" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Top */}
      <mesh position={[0, H / 2 + 0.04, 0]} castShadow>
        <boxGeometry args={[W + 0.16, 0.08, D]} />
        <meshStandardMaterial color="#2c2f36" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Threshold (umbral inferior) */}
      <mesh position={[0, -H / 2 - 0.04, 0]} castShadow>
        <boxGeometry args={[W + 0.16, 0.08, D]} />
        <meshStandardMaterial color="#1a1d24" metalness={0.85} roughness={0.35} />
      </mesh>

      {/* === LED FRAME (línea cyan interna) === */}
      <mesh ref={ledRef} position={[0, 0, D / 2 + 0.005]}>
        <ringGeometry args={[0, 0.01, 4, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* LED izquierdo */}
      <mesh position={[-W / 2 + 0.01, 0, D / 2 + 0.01]}>
        <boxGeometry args={[0.012, H - 0.05, 0.015]} />
        <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {/* LED derecho */}
      <mesh position={[W / 2 - 0.01, 0, D / 2 + 0.01]}>
        <boxGeometry args={[0.012, H - 0.05, 0.015]} />
        <meshStandardMaterial color="#ff44aa" emissive="#ff44aa" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {/* LED top */}
      <mesh position={[0, H / 2 - 0.01, D / 2 + 0.01]}>
        <boxGeometry args={[W - 0.02, 0.012, 0.015]} />
        <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>

      {/* === DISPLAY DE STATUS (arriba) === */}
      <group position={[0, H / 2 + 0.18, D / 2]}>
        {/* Carcasa */}
        <mesh>
          <boxGeometry args={[0.65, 0.18, 0.04]} />
          <meshStandardMaterial color="#15181f" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Pantalla */}
        <mesh ref={scanlineRef} position={[0, 0, 0.022]}>
          <planeGeometry args={[0.6, 0.14]} />
          <meshBasicMaterial map={displayCanvasTexture} toneMapped={false} />
        </mesh>
      </group>

      {/* === STATUS LIGHT (círculo verde "secure") === */}
      <mesh ref={statusRef} position={[W / 2 - 0.13, H / 2 + 0.18, D / 2 + 0.03]}>
        <circleGeometry args={[0.025, 24]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>

      {/* === PANELES DE LA PUERTA (2 hojas slide) === */}
      {/* Panel izquierdo */}
      <mesh position={[-W / 4 - 0.005, 0, 0]} castShadow>
        <boxGeometry args={[W / 2 - 0.02, H - 0.05, D * 0.5]} />
        <meshStandardMaterial color="#0d1428" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Panel derecho */}
      <mesh position={[W / 4 + 0.005, 0, 0]} castShadow>
        <boxGeometry args={[W / 2 - 0.02, H - 0.05, D * 0.5]} />
        <meshStandardMaterial color="#0d1428" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* === HEX PATTERN sobre los paneles === */}
      <mesh position={[-W / 4 - 0.005, 0, D * 0.25 + 0.005]}>
        <planeGeometry args={[W / 2 - 0.04, H - 0.1]} />
        <meshBasicMaterial map={panelTexture} transparent opacity={0.55} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[W / 4 + 0.005, 0, D * 0.25 + 0.005]}>
        <planeGeometry args={[W / 2 - 0.04, H - 0.1]} />
        <meshBasicMaterial map={panelTexture} transparent opacity={0.55} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* === LÍNEA CENTRAL (separación de paneles) === */}
      <mesh position={[0, 0, D * 0.25 + 0.008]}>
        <boxGeometry args={[0.006, H - 0.1, 0.01]} />
        <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>

      {/* === LECTOR BIOMÉTRICO (panel a la derecha) === */}
      <group position={[W / 2 + 0.18, -0.3, D / 2]}>
        {/* Carcasa */}
        <mesh>
          <boxGeometry args={[0.18, 0.32, 0.04]} />
          <meshStandardMaterial color="#15181f" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Pantalla escáner */}
        <mesh position={[0, 0.04, 0.022]}>
          <planeGeometry args={[0.14, 0.18]} />
          <meshBasicMaterial color="#0a1024" toneMapped={false} />
        </mesh>
        {/* Mano huella simbólica */}
        <mesh position={[0, 0.04, 0.024]}>
          <ringGeometry args={[0.04, 0.05, 32]} />
          <meshBasicMaterial color="#00ddff" toneMapped={false} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0.04, 0.024]}>
          <ringGeometry args={[0.02, 0.025, 32]} />
          <meshBasicMaterial color="#00ddff" toneMapped={false} transparent opacity={0.5} />
        </mesh>
        {/* LED del lector */}
        <mesh position={[0, -0.1, 0.024]}>
          <circleGeometry args={[0.012, 16]} />
          <meshStandardMaterial color="#ff44aa" emissive="#ff44aa" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

// ============================================================
//   TEXTURAS PROCEDURALES
// ============================================================

function makePanelTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Fondo transparente
  ctx.clearRect(0, 0, size, size)

  // Hex grid
  const hexSize = 28
  const hexW = hexSize * 2
  const hexH = hexSize * Math.sqrt(3)
  for (let row = -1; row < size / hexH + 2; row++) {
    for (let col = -1; col < size / (hexW * 0.75) + 2; col++) {
      const x = col * hexW * 0.75
      const y = row * hexH + (col % 2) * (hexH / 2)
      ctx.strokeStyle = 'rgba(0,200,255,0.35)'
      ctx.lineWidth = 1.5
      drawHex(ctx, x, y, hexSize - 4)
      ctx.stroke()
    }
  }

  // Iluminar algunos hex random
  for (let i = 0; i < 18; i++) {
    const col = Math.floor(Math.random() * (size / (hexW * 0.75)))
    const row = Math.floor(Math.random() * (size / hexH))
    const x = col * hexW * 0.75
    const y = row * hexH + (col % 2) * (hexH / 2)
    drawHex(ctx, x, y, hexSize - 4)
    const grad = ctx.createRadialGradient(x, y, 0, x, y, hexSize)
    grad.addColorStop(0, 'rgba(0,221,255,0.55)')
    grad.addColorStop(1, 'rgba(0,221,255,0)')
    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,255,255,0.85)'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Algunas en rosa
  for (let i = 0; i < 6; i++) {
    const col = Math.floor(Math.random() * (size / (hexW * 0.75)))
    const row = Math.floor(Math.random() * (size / hexH))
    const x = col * hexW * 0.75
    const y = row * hexH + (col % 2) * (hexH / 2)
    drawHex(ctx, x, y, hexSize - 4)
    ctx.strokeStyle = 'rgba(255,68,170,0.85)'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Líneas circuit
  ctx.strokeStyle = 'rgba(0,221,255,0.2)'
  ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) {
    const y = (i / 5) * size + Math.random() * 30
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function drawHex(ctx, cx, cy, radius) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function drawStatusDisplay(ctx, time) {
  const W = 512
  const H = 128
  ctx.clearRect(0, 0, W, H)
  // Fondo
  ctx.fillStyle = '#0a1024'
  ctx.fillRect(0, 0, W, H)
  // Scanlines
  for (let y = 0; y < H; y += 3) {
    ctx.fillStyle = `rgba(0,221,255,${0.05 + Math.sin(time * 4 + y * 0.1) * 0.02})`
    ctx.fillRect(0, y, W, 1)
  }
  // Border
  ctx.strokeStyle = '#00ddff'
  ctx.lineWidth = 2
  ctx.strokeRect(4, 4, W - 8, H - 8)

  // Texto SECTOR_01
  ctx.fillStyle = '#00ff88'
  ctx.shadowColor = '#00ff88'
  ctx.shadowBlur = 12
  ctx.font = 'bold 38px "Consolas", monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('SECTOR_01', 24, H / 2 - 8)
  ctx.shadowBlur = 0

  // Subtítulo
  ctx.fillStyle = 'rgba(140,180,220,0.7)'
  ctx.font = '12px "Consolas", monospace'
  ctx.fillText('· DEVOFFICE · ACCESS GRANTED', 24, H / 2 + 22)

  // Indicador OPEN / SECURE pulsante
  const pulse = Math.abs(Math.sin(time * 2))
  ctx.fillStyle = `rgba(0,255,136,${0.6 + pulse * 0.4})`
  ctx.shadowColor = '#00ff88'
  ctx.shadowBlur = 8
  ctx.font = 'bold 18px Consolas'
  ctx.textAlign = 'right'
  ctx.fillText('● SECURE', W - 24, H / 2)
  ctx.shadowBlur = 0
}
