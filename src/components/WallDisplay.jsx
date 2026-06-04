import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Wall Display cyberpunk — collage decorativo para pared:
 *  - Vinilo girando (toque hipster / música)
 *  - Frame con quote motivacional
 *  - Clock RGB digital
 *  - 3 certificaciones / achievements
 *  - Marco superior tipo "shelf"
 */
export default function WallDisplay() {
  const vinylRef = useRef()
  const clockRef = useRef()

  // Texturas procedurales
  const vinylTexture = useMemo(() => makeVinylTexture(), [])
  const quoteTexture = useMemo(() => makeQuoteTexture(), [])
  // Especialidades reales del GitHub de Melissa
  const cert1Texture = useMemo(() => makeCertTexture('FRONTEND', 'Dev · React · Angular', '#61dafb'), [])
  const cert2Texture = useMemo(() => makeCertTexture('IT PROJECT', 'Management · Agile', '#ff66cc'), [])
  const cert3Texture = useMemo(() => makeCertTexture('UI/UX', 'Design · Figma', '#a78bfa'), [])

  // Clock canvas (se redibuja cada frame)
  const clockCanvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 256
    return c
  }, [])
  const clockTexture = useMemo(() => {
    const t = new THREE.CanvasTexture(clockCanvas)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [clockCanvas])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Vinilo girando (33 RPM ≈ 0.55 rev/s ≈ 3.45 rad/s)
    if (vinylRef.current) {
      vinylRef.current.rotation.z = -t * 0.55
    }
    // Redibujar clock
    const ctx = clockCanvas.getContext('2d')
    drawClock(ctx, t)
    clockTexture.needsUpdate = true
  })

  return (
    <group>
      {/* === MARCO DEL DISPLAY (tipo shelf horizontal) === */}
      <mesh position={[0, 0.95, -0.02]}>
        <boxGeometry args={[3.4, 0.05, 0.04]} />
        <meshStandardMaterial color="#3a3e48" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.95, -0.02]}>
        <boxGeometry args={[3.4, 0.05, 0.04]} />
        <meshStandardMaterial color="#3a3e48" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* LED accent inferior */}
      <mesh position={[0, -0.97, 0.005]}>
        <boxGeometry args={[3.4, 0.012, 0.02]} />
        <meshStandardMaterial color="#ff66cc" emissive="#ff66cc" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.97, 0.005]}>
        <boxGeometry args={[3.4, 0.012, 0.02]} />
        <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>

      {/* === VINILO (izquierda) === */}
      <group position={[-1.15, 0.05, 0.015]}>
        {/* Carcasa cuadrada (square) del vinilo */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.85, 0.85]} />
          <meshStandardMaterial color="#0d1428" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Borde tornillos esquinas */}
        {[[-0.38, 0.38], [0.38, 0.38], [-0.38, -0.38], [0.38, -0.38]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.012, 12]} />
            <meshStandardMaterial color="#5a5e68" metalness={1} roughness={0.3} />
          </mesh>
        ))}
        {/* Vinilo girando */}
        <mesh ref={vinylRef} position={[0, 0, 0.005]}>
          <circleGeometry args={[0.32, 64]} />
          <meshBasicMaterial map={vinylTexture} toneMapped={false} />
        </mesh>
        {/* Etiqueta vinilo (label) */}
        <mesh position={[0, 0, 0.008]}>
          <circleGeometry args={[0.09, 32]} />
          <meshBasicMaterial color="#ff44aa" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.009]}>
          <circleGeometry args={[0.012, 16]} />
          <meshBasicMaterial color="#0a0a14" toneMapped={false} />
        </mesh>
      </group>

      {/* === QUOTE FRAME (centro arriba) === */}
      <mesh position={[0, 0.45, 0]}>
        <planeGeometry args={[1.6, 0.42]} />
        <meshBasicMaterial map={quoteTexture} toneMapped={false} transparent />
      </mesh>

      {/* === CLOCK RGB (centro abajo) === */}
      <mesh ref={clockRef} position={[0, -0.45, 0]}>
        <planeGeometry args={[1.6, 0.4]} />
        <meshBasicMaterial map={clockTexture} toneMapped={false} transparent />
      </mesh>

      {/* === CERTIFICACIONES (derecha, columna de 3) === */}
      <mesh position={[1.2, 0.55, 0]}>
        <planeGeometry args={[0.85, 0.4]} />
        <meshBasicMaterial map={cert1Texture} toneMapped={false} transparent />
      </mesh>
      <mesh position={[1.2, 0.05, 0]}>
        <planeGeometry args={[0.85, 0.4]} />
        <meshBasicMaterial map={cert2Texture} toneMapped={false} transparent />
      </mesh>
      <mesh position={[1.2, -0.45, 0]}>
        <planeGeometry args={[0.85, 0.4]} />
        <meshBasicMaterial map={cert3Texture} toneMapped={false} transparent />
      </mesh>
    </group>
  )
}

// ============================================================
//   TEXTURAS PROCEDURALES
// ============================================================

function makeVinylTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const cx = size / 2
  const cy = size / 2

  // Fondo negro del vinilo
  ctx.fillStyle = '#080810'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#0a0a14'
  ctx.beginPath()
  ctx.arc(cx, cy, size / 2 - 5, 0, Math.PI * 2)
  ctx.fill()

  // Surcos del vinilo (concéntricos)
  for (let r = 60; r < size / 2 - 10; r += 3) {
    ctx.strokeStyle = `rgba(80,80,100,${0.05 + Math.random() * 0.1})`
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Brillo de reflejo (gradiente radial diagonal)
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0,    'rgba(255,100,200,0.18)')
  grad.addColorStop(0.4,  'rgba(255,255,255,0.05)')
  grad.addColorStop(0.6,  'rgba(0,200,255,0.18)')
  grad.addColorStop(1,    'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, size / 2 - 5, 0, Math.PI * 2)
  ctx.fill()

  return new THREE.CanvasTexture(canvas)
}

function makeQuoteTexture() {
  const W = 1024
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fondo dark
  ctx.fillStyle = '#0a1024'
  ctx.fillRect(0, 0, W, H)
  // Borde cyan
  ctx.strokeStyle = '#00ddff'
  ctx.lineWidth = 3
  ctx.strokeRect(8, 8, W - 16, H - 16)
  // Esquinas HUD
  ctx.strokeStyle = '#00ddff'
  ctx.lineWidth = 4
  const cornerSize = 30
  ctx.beginPath()
  ctx.moveTo(20, 20 + cornerSize); ctx.lineTo(20, 20); ctx.lineTo(20 + cornerSize, 20)
  ctx.moveTo(W - 20 - cornerSize, 20); ctx.lineTo(W - 20, 20); ctx.lineTo(W - 20, 20 + cornerSize)
  ctx.moveTo(20, H - 20 - cornerSize); ctx.lineTo(20, H - 20); ctx.lineTo(20 + cornerSize, H - 20)
  ctx.moveTo(W - 20 - cornerSize, H - 20); ctx.lineTo(W - 20, H - 20); ctx.lineTo(W - 20, H - 20 - cornerSize)
  ctx.stroke()

  // Tu moto real de GitHub — letra grande, bien visible
  ctx.fillStyle = '#e8f4ff'
  ctx.font = 'italic 700 56px "Segoe UI"'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = '#00ddff'
  ctx.shadowBlur = 18
  ctx.fillText('"Technology with purpose"', W / 2, H / 2 - 32)
  ctx.shadowBlur = 0

  // Subtítulo (segundo motto) más grande también
  ctx.fillStyle = 'rgba(255,102,204,0.95)'
  ctx.font = '600 28px "Consolas", monospace'
  ctx.shadowColor = '#ff66cc'
  ctx.shadowBlur = 8
  ctx.fillText('// Always building and learning', W / 2, H / 2 + 36)
  ctx.shadowBlur = 0

  return new THREE.CanvasTexture(canvas)
}

function makeCertTexture(title, subtitle, color) {
  const W = 512
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fondo
  ctx.fillStyle = '#0d1428'
  ctx.fillRect(0, 0, W, H)
  // Borde del color del cert
  ctx.strokeStyle = color
  ctx.lineWidth = 4
  ctx.strokeRect(6, 6, W - 12, H - 12)
  // Banda superior color
  ctx.fillStyle = color
  ctx.fillRect(6, 6, W - 12, 8)

  // Badge circular más grande
  ctx.fillStyle = color + '22'
  ctx.beginPath()
  ctx.arc(W / 2, H / 2 - 38, 55, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.arc(W / 2, H / 2 - 38, 55, 0, Math.PI * 2)
  ctx.stroke()
  // Estrella en el badge — más grande
  ctx.fillStyle = color
  ctx.font = 'bold 62px Segoe UI'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = color
  ctx.shadowBlur = 18
  ctx.fillText('★', W / 2, H / 2 - 38)
  ctx.shadowBlur = 0

  // Título mucho más grande
  ctx.fillStyle = '#e8f4ff'
  ctx.font = 'bold 38px Segoe UI'
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.fillText(title, W / 2, H / 2 + 50)
  ctx.shadowBlur = 0
  // Subtítulo más grande también
  ctx.fillStyle = 'rgba(180,210,240,0.95)'
  ctx.font = '600 22px Segoe UI'
  ctx.fillText(subtitle, W / 2, H / 2 + 88)

  // Código serial bottom
  ctx.fillStyle = color + 'AA'
  ctx.font = 'bold 13px Consolas, monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`ID: ${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`, 16, H - 18)
  ctx.textAlign = 'right'
  ctx.fillText('2024', W - 16, H - 18)

  return new THREE.CanvasTexture(canvas)
}

function drawClock(ctx, time) {
  const W = 512
  const H = 256
  ctx.clearRect(0, 0, W, H)
  // Fondo
  ctx.fillStyle = '#0a1024'
  ctx.fillRect(0, 0, W, H)
  // Borde
  ctx.strokeStyle = '#ff66cc'
  ctx.lineWidth = 3
  ctx.strokeRect(8, 8, W - 16, H - 16)

  // Hora actual
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const colonOn = Math.floor(time * 2) % 2 === 0

  // Dígitos grandes
  ctx.fillStyle = '#00ddff'
  ctx.font = 'bold 90px "Consolas", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = '#00ddff'
  ctx.shadowBlur = 20
  const colon = colonOn ? ':' : ' '
  ctx.fillText(`${hh}${colon}${mm}`, W / 2, H / 2 - 5)
  ctx.shadowBlur = 0

  // Segundos pequeños
  ctx.fillStyle = '#ff66cc'
  ctx.font = 'bold 22px Consolas'
  ctx.shadowColor = '#ff66cc'
  ctx.shadowBlur = 8
  ctx.fillText(`:${ss}`, W / 2 + 165, H / 2 + 20)
  ctx.shadowBlur = 0

  // Label
  ctx.fillStyle = 'rgba(140,180,220,0.65)'
  ctx.font = 'bold 14px Segoe UI'
  ctx.fillText('LOCAL TIME · BOGOTÁ', W / 2, H - 30)

  // Fecha
  const dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  ctx.fillStyle = 'rgba(0,221,255,0.6)'
  ctx.font = '12px Consolas'
  ctx.fillText(dateStr, W / 2, 30)
}
