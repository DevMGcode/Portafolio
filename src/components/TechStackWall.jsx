import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Pared de "placas neón" tipo certificación / skill tree cyberpunk.
 * Cada plaque es un hexágono con:
 *   - Frame neón del color del tech
 *   - Icono/inicial en grande
 *   - Nombre del tech debajo
 *   - Barra de "nivel" (★★★★☆)
 */

const TECHS = [
  { name: 'React',      icon: 'R',  color: '#61dafb', level: 5 },
  { name: 'JavaScript', icon: 'JS', color: '#f7df1e', level: 5 },
  { name: 'TypeScript', icon: 'TS', color: '#3178c6', level: 4 },
  { name: 'Angular',    icon: 'A',  color: '#dd0031', level: 4 },
  { name: 'Node.js',    icon: 'N',  color: '#7cc242', level: 4 },
  { name: 'MongoDB',    icon: 'M',  color: '#47a248', level: 4 },
  { name: 'Tailwind',   icon: 'TW', color: '#06b6d4', level: 5 },
  { name: 'Git',        icon: 'G',  color: '#f05032', level: 4 },
]

// Layout de la grilla: 4 columnas × 2 filas
const COLS = 4
const ROWS = 2
const PLAQUE_W = 0.55
const PLAQUE_H = 0.65
const GAP_X = 0.08
const GAP_Y = 0.08

export default function TechStackWall() {
  const groupRef = useRef()

  // Animación suave (pulso conjunto)
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.children.forEach((plaque, i) => {
      const mesh = plaque.children[0]
      if (mesh && mesh.material) {
        // Pulso desfasado por plaque
        const pulse = 1 + Math.sin(t * 1.5 + i * 0.5) * 0.04
        plaque.scale.setScalar(pulse)
      }
    })
  })

  const plaques = useMemo(() => {
    return TECHS.map((tech, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const totalW = COLS * PLAQUE_W + (COLS - 1) * GAP_X
      const totalH = ROWS * PLAQUE_H + (ROWS - 1) * GAP_Y
      const x = -totalW / 2 + col * (PLAQUE_W + GAP_X) + PLAQUE_W / 2
      const y =  totalH / 2 - row * (PLAQUE_H + GAP_Y) - PLAQUE_H / 2
      return { tech, x, y, texture: makePlaqueTexture(tech) }
    })
  }, [])

  // Título "TECH STACK" arriba del panel
  const titleTexture = useMemo(() => makeTitleTexture('TECH STACK'), [])

  return (
    <group ref={groupRef}>
      {/* Panel de fondo (oscuro con detalles tech) */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[3.2, 1.9]} />
        <meshStandardMaterial
          color="#0d1428"
          emissive="#0a1a2a"
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.5}
        />
      </mesh>

      {/* Bordes neón del panel */}
      <mesh position={[0, 0.97, -0.02]}>
        <boxGeometry args={[3.2, 0.025, 0.03]} />
        <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.97, -0.02]}>
        <boxGeometry args={[3.2, 0.025, 0.03]} />
        <meshStandardMaterial color="#ff44aa" emissive="#ff44aa" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>

      {/* Título */}
      <mesh position={[0, 0.78, 0]}>
        <planeGeometry args={[1.6, 0.2]} />
        <meshBasicMaterial map={titleTexture} transparent toneMapped={false} />
      </mesh>

      {/* Placas */}
      <group position={[0, -0.05, 0.01]}>
        {plaques.map(({ tech, x, y, texture }, i) => (
          <group key={i} position={[x, y, 0]}>
            <mesh>
              <planeGeometry args={[PLAQUE_W, PLAQUE_H]} />
              <meshBasicMaterial
                map={texture}
                transparent
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// ============================================================
// TEXTURAS PROCEDURALES
// ============================================================

function makePlaqueTexture(tech) {
  const W = 256
  const H = 320
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fondo hexagonal con gradiente oscuro
  ctx.clearRect(0, 0, W, H)
  const cx = W / 2
  const cy = H / 2

  // Hexágono outer (frame neón color tech)
  ctx.shadowColor = tech.color
  ctx.shadowBlur = 25
  drawHexPath(ctx, cx, cy + 10, W * 0.45, H * 0.4)
  ctx.strokeStyle = tech.color
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.shadowBlur = 0

  // Hexágono inner con fondo oscuro
  drawHexPath(ctx, cx, cy + 10, W * 0.42, H * 0.37)
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.42)
  grad.addColorStop(0, 'rgba(20,30,55,0.95)')
  grad.addColorStop(1, 'rgba(8,12,28,0.95)')
  ctx.fillStyle = grad
  ctx.fill()

  // Líneas circuito decorativas
  ctx.strokeStyle = tech.color + '40'
  ctx.lineWidth = 1
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    const y = cy + 40 + i * 12
    ctx.moveTo(40, y)
    ctx.lineTo(W - 40, y)
    ctx.stroke()
  }

  // Icono / inicial central
  ctx.fillStyle = tech.color
  ctx.shadowColor = tech.color
  ctx.shadowBlur = 18
  ctx.font = `bold ${tech.icon.length > 1 ? 64 : 88}px "Segoe UI", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(tech.icon, cx, cy - 6)
  ctx.shadowBlur = 0

  // Nombre del tech
  ctx.fillStyle = '#e8f4ff'
  ctx.font = 'bold 22px "Segoe UI"'
  ctx.fillText(tech.name.toUpperCase(), cx, cy + 78)

  // Nivel (barritas)
  const barY = cy + 110
  const barW = 18
  const barH = 6
  const gap = 4
  const totalW = 5 * barW + 4 * gap
  const startX = cx - totalW / 2
  for (let i = 0; i < 5; i++) {
    const filled = i < tech.level
    ctx.fillStyle = filled ? tech.color : 'rgba(80,140,200,0.2)'
    if (filled) { ctx.shadowColor = tech.color; ctx.shadowBlur = 10 }
    ctx.fillRect(startX + i * (barW + gap), barY, barW, barH)
    ctx.shadowBlur = 0
  }

  // Top corner decorations (HUD)
  ctx.strokeStyle = tech.color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(20, 38); ctx.lineTo(20, 20); ctx.lineTo(38, 20)
  ctx.moveTo(W - 38, 20); ctx.lineTo(W - 20, 20); ctx.lineTo(W - 20, 38)
  ctx.moveTo(20, H - 38); ctx.lineTo(20, H - 20); ctx.lineTo(38, H - 20)
  ctx.moveTo(W - 38, H - 20); ctx.lineTo(W - 20, H - 20); ctx.lineTo(W - 20, H - 38)
  ctx.stroke()

  // Código serial top-right
  ctx.fillStyle = tech.color + 'AA'
  ctx.font = '10px "Consolas", monospace'
  ctx.textAlign = 'right'
  ctx.fillText(`v${tech.level}.0`, W - 30, 35)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function drawHexPath(ctx, cx, cy, rx, ry) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    const x = cx + rx * Math.cos(angle)
    const y = cy + ry * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function makeTitleTexture(title) {
  const W = 512
  const H = 80
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H)
  // Glow
  ctx.shadowColor = '#ff44aa'
  ctx.shadowBlur = 25
  ctx.fillStyle = '#ff44aa'
  ctx.font = 'bold 48px "Segoe UI", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, W / 2, H / 2)
  ctx.shadowBlur = 0
  // Doble pasada
  ctx.fillStyle = '#fff'
  ctx.fillText(title, W / 2, H / 2)
  // Subtítulo
  ctx.fillStyle = 'rgba(140,180,220,0.8)'
  ctx.font = '12px "Consolas", monospace'
  ctx.fillText('· STACK SKILL TREE ·', W / 2, H - 12)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
