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

// Stack completo del GitHub de Melissa (DevMGcode)
// Cada tech tiene su logo SVG real desde devicon CDN (mismo que usa el README)
const DEVICON = (slug, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-${variant}.svg`

const TECHS = [
  // Fila 1 — Lenguajes base
  { name: 'HTML',       iconUrl: DEVICON('html5'),       color: '#e34f26', level: 5 },
  { name: 'CSS',        iconUrl: DEVICON('css3'),        color: '#1572b6', level: 5 },
  { name: 'JavaScript', iconUrl: DEVICON('javascript'),  color: '#f7df1e', level: 5 },
  { name: 'TypeScript', iconUrl: DEVICON('typescript'),  color: '#3178c6', level: 4 },
  { name: 'Python',     iconUrl: DEVICON('python'),      color: '#3776ab', level: 3 },
  // Fila 2 — Frameworks frontend
  { name: 'React',      iconUrl: DEVICON('react'),                       color: '#61dafb', level: 5 },
  { name: 'Next.js',    iconUrl: DEVICON('nextjs', 'original-wordmark'), color: '#ffffff', level: 4 },
  { name: 'Angular',    iconUrl: DEVICON('angularjs'),                   color: '#dd0031', level: 4 },
  { name: 'Tailwind',   iconUrl: DEVICON('tailwindcss', 'plain'),        color: '#06b6d4', level: 5 },
  { name: 'Bootstrap',  iconUrl: DEVICON('bootstrap'),                   color: '#7952b3', level: 5 },
  // Fila 3 — Backend + tools
  { name: 'Node.js',    iconUrl: DEVICON('nodejs'),  color: '#7cc242', level: 4 },
  { name: 'Express',    iconUrl: DEVICON('express'), color: '#cccccc', level: 4 },
  { name: 'Spring',     iconUrl: DEVICON('spring'),  color: '#6db33f', level: 3 },
  { name: 'Java',       iconUrl: DEVICON('java'),    color: '#f89820', level: 3 },
  { name: 'Git',        iconUrl: DEVICON('git'),     color: '#f05032', level: 4 },
]

// Layout de la grilla: 5 columnas × 3 filas = 15 plaques
const COLS = 5
const ROWS = 3
const PLAQUE_W = 0.45
const PLAQUE_H = 0.52
const GAP_X = 0.06
const GAP_Y = 0.06

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
      {/* Panel de fondo (oscuro con detalles tech) — más ancho y alto para acomodar 5x3 */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[2.8, 2.0]} />
        <meshStandardMaterial
          color="#0d1428"
          emissive="#0a1a2a"
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.5}
        />
      </mesh>

      {/* Bordes neón del panel */}
      <mesh position={[0, 1.02, -0.02]}>
        <boxGeometry args={[2.8, 0.022, 0.03]} />
        <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.02, -0.02]}>
        <boxGeometry args={[2.8, 0.022, 0.03]} />
        <meshStandardMaterial color="#ff44aa" emissive="#ff44aa" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>

      {/* Título */}
      <mesh position={[0, 0.87, 0]}>
        <planeGeometry args={[1.4, 0.16]} />
        <meshBasicMaterial map={titleTexture} transparent toneMapped={false} />
      </mesh>

      {/* Placas (offset un poquito hacia abajo para dejar espacio al título) */}
      <group position={[0, -0.04, 0.01]}>
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

  const cx = W / 2
  const cy = H / 2

  // Función que dibuja la base (frame + fondo + nombre + nivel)
  const drawBase = () => {
    ctx.clearRect(0, 0, W, H)
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

    // Nombre del tech
    ctx.fillStyle = '#e8f4ff'
    ctx.font = 'bold 22px "Segoe UI"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
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
  }

  drawBase()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace

  // Cargar logo SVG real desde devicon CDN (async — re-dibuja cuando carga)
  if (tech.iconUrl) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      drawBase()
      // Dibujar el logo centrado en el hexágono
      const iconSize = 95
      ctx.save()
      ctx.shadowColor = tech.color
      ctx.shadowBlur = 12
      ctx.drawImage(img, cx - iconSize / 2, cy - iconSize / 2 - 8, iconSize, iconSize)
      ctx.restore()
      tex.needsUpdate = true
    }
    img.onerror = () => {
      // Si falla el CDN, dibujar inicial como fallback
      ctx.fillStyle = tech.color
      ctx.shadowColor = tech.color
      ctx.shadowBlur = 18
      ctx.font = `bold 80px "Segoe UI", monospace`
      ctx.fillText(tech.name[0], cx, cy - 6)
      ctx.shadowBlur = 0
      tex.needsUpdate = true
    }
    img.src = tech.iconUrl
  }

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
