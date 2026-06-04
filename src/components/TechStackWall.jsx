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
  // Background con hex grid + scanlines (sutil)
  const bgTexture = useMemo(() => makeBackgroundTexture(), [])
  // Status bar inferior
  const statusTexture = useMemo(() => makeStatusBarTexture(TECHS.length), [])

  // Dimensiones del panel
  const PANEL_W = 2.95
  const PANEL_H = 2.15

  return (
    <group ref={groupRef}>
      {/* === MARCO METÁLICO EXTERIOR (gunmetal premium) === */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[PANEL_W + 0.12, PANEL_H + 0.12]} />
        <meshStandardMaterial color="#1a1d24" metalness={0.95} roughness={0.25} />
      </mesh>

      {/* === FONDO DEL PANEL con textura hex grid sutil === */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshStandardMaterial
          map={bgTexture}
          color="#ffffff"
          emissive="#0a1a2a"
          emissiveIntensity={0.25}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* === MARCO INTERNO LED (4 lados) === */}
      {/* Top cyan */}
      <mesh position={[0, PANEL_H / 2 - 0.012, -0.02]}>
        <boxGeometry args={[PANEL_W - 0.02, 0.018, 0.03]} />
        <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {/* Bottom magenta */}
      <mesh position={[0, -PANEL_H / 2 + 0.012, -0.02]}>
        <boxGeometry args={[PANEL_W - 0.02, 0.018, 0.03]} />
        <meshStandardMaterial color="#ff44aa" emissive="#ff44aa" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {/* Left fade */}
      <mesh position={[-PANEL_W / 2 + 0.012, 0, -0.02]}>
        <boxGeometry args={[0.018, PANEL_H - 0.02, 0.03]} />
        <meshStandardMaterial color="#5a8fb0" emissive="#5a8fb0" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      {/* Right fade */}
      <mesh position={[PANEL_W / 2 - 0.012, 0, -0.02]}>
        <boxGeometry args={[0.018, PANEL_H - 0.02, 0.03]} />
        <meshStandardMaterial color="#5a8fb0" emissive="#5a8fb0" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>

      {/* === CORNER BRACKETS HUD (premium detail) === */}
      {[
        [-PANEL_W / 2 + 0.05,  PANEL_H / 2 - 0.05], // TL
        [ PANEL_W / 2 - 0.05,  PANEL_H / 2 - 0.05], // TR
        [-PANEL_W / 2 + 0.05, -PANEL_H / 2 + 0.05], // BL
        [ PANEL_W / 2 - 0.05, -PANEL_H / 2 + 0.05], // BR
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.005]}>
          <ringGeometry args={[0.018, 0.024, 24, 1, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.3} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* === TORNILLOS DECORATIVOS (4 esquinas externas) === */}
      {[
        [-PANEL_W / 2 - 0.04,  PANEL_H / 2 + 0.04],
        [ PANEL_W / 2 + 0.04,  PANEL_H / 2 + 0.04],
        [-PANEL_W / 2 - 0.04, -PANEL_H / 2 - 0.04],
        [ PANEL_W / 2 + 0.04, -PANEL_H / 2 - 0.04],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -0.03]}>
          <cylinderGeometry args={[0.022, 0.022, 0.015, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#4a5060" metalness={1} roughness={0.3} />
        </mesh>
      ))}

      {/* === TÍTULO TECH STACK === */}
      <mesh position={[0, PANEL_H / 2 - 0.16, 0.01]}>
        <planeGeometry args={[1.7, 0.2]} />
        <meshBasicMaterial map={titleTexture} transparent toneMapped={false} />
      </mesh>

      {/* === PLACAS HEXAGONALES === */}
      <group position={[0, -0.08, 0.01]}>
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

      {/* === STATUS BAR INFERIOR === */}
      <mesh position={[0, -PANEL_H / 2 + 0.085, 0.01]}>
        <planeGeometry args={[PANEL_W - 0.08, 0.1]} />
        <meshBasicMaterial map={statusTexture} transparent toneMapped={false} />
      </mesh>
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

    // Nombre del tech — más grande, con letter-spacing manual cyberpunk
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px "Segoe UI", system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = tech.color
    ctx.shadowBlur = 14
    // Letter-spacing manual: dibujar letra por letra con gap
    const name = tech.name.toUpperCase()
    const letterSpacing = 2
    const totalTextW = ctx.measureText(name).width + (name.length - 1) * letterSpacing
    let xPos = cx - totalTextW / 2
    for (const ch of name) {
      const w = ctx.measureText(ch).width
      ctx.fillText(ch, xPos + w / 2, cy + 88)
      xPos += w + letterSpacing
    }
    ctx.shadowBlur = 0

    // Línea decorativa debajo del título — HUD style
    ctx.strokeStyle = tech.color + '60'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx - 50, cy + 108)
    ctx.lineTo(cx + 50, cy + 108)
    ctx.stroke()
    // Acentos en los extremos
    ctx.fillStyle = tech.color
    ctx.beginPath()
    ctx.arc(cx - 50, cy + 108, 2, 0, Math.PI * 2)
    ctx.arc(cx + 50, cy + 108, 2, 0, Math.PI * 2)
    ctx.fill()

    // Nivel (barritas) — abajo del separador, más prolijas
    const barY = cy + 125
    const barW = 22
    const barH = 7
    const gap = 5
    const totalBarW = 5 * barW + 4 * gap
    const startX = cx - totalBarW / 2
    for (let i = 0; i < 5; i++) {
      const filled = i < tech.level
      ctx.fillStyle = filled ? tech.color : 'rgba(80,140,200,0.18)'
      if (filled) { ctx.shadowColor = tech.color; ctx.shadowBlur = 12 }
      ctx.fillRect(startX + i * (barW + gap), barY, barW, barH)
      ctx.shadowBlur = 0
    }

    // Top corner decorations (HUD) — más definidas
    ctx.strokeStyle = tech.color
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(20, 42); ctx.lineTo(20, 20); ctx.lineTo(42, 20)
    ctx.moveTo(W - 42, 20); ctx.lineTo(W - 20, 20); ctx.lineTo(W - 20, 42)
    ctx.moveTo(20, H - 42); ctx.lineTo(20, H - 20); ctx.lineTo(42, H - 20)
    ctx.moveTo(W - 42, H - 20); ctx.lineTo(W - 20, H - 20); ctx.lineTo(W - 20, H - 42)
    ctx.stroke()

    // Código serial top-right — más visible
    ctx.fillStyle = tech.color + 'CC'
    ctx.font = 'bold 13px "Consolas", monospace'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`v${tech.level}.0`, W - 30, 35)

    // Etiqueta TECH abajo-izquierda
    ctx.fillStyle = tech.color + '88'
    ctx.font = 'bold 11px "Consolas", monospace'
    ctx.textAlign = 'left'
    ctx.fillText('// TECH', 28, H - 28)
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
  const H = 96
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H)

  // Glow grande rosa
  ctx.shadowColor = '#ff44aa'
  ctx.shadowBlur = 30
  ctx.fillStyle = '#ff44aa'
  ctx.font = 'bold 56px "Segoe UI", system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Letter-spacing manual para look HUD
  const upperTitle = title.toUpperCase()
  const letterSpacing = 4
  const totalW = ctx.measureText(upperTitle).width + (upperTitle.length - 1) * letterSpacing
  let xPos = W / 2 - totalW / 2
  for (const ch of upperTitle) {
    const w = ctx.measureText(ch).width
    ctx.fillText(ch, xPos + w / 2, H / 2 - 8)
    xPos += w + letterSpacing
  }
  ctx.shadowBlur = 0

  // Doble pasada con blanco encima para que se lea nítido
  ctx.fillStyle = '#ffffff'
  xPos = W / 2 - totalW / 2
  for (const ch of upperTitle) {
    const w = ctx.measureText(ch).width
    ctx.fillText(ch, xPos + w / 2, H / 2 - 8)
    xPos += w + letterSpacing
  }

  // Líneas decorativas a los lados del título
  ctx.strokeStyle = '#00ddff'
  ctx.lineWidth = 2
  const yLine = H / 2 - 8
  ctx.beginPath()
  ctx.moveTo(40, yLine); ctx.lineTo(110, yLine)
  ctx.moveTo(W - 110, yLine); ctx.lineTo(W - 40, yLine)
  ctx.stroke()

  // Subtítulo
  ctx.fillStyle = 'rgba(0, 221, 255, 0.9)'
  ctx.font = 'bold 14px "Consolas", monospace'
  ctx.shadowColor = '#00ddff'
  ctx.shadowBlur = 8
  ctx.fillText('◇ STACK · SKILL · TREE ◇', W / 2, H - 18)
  ctx.shadowBlur = 0

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================
// FONDO DEL PANEL — Hex grid + scanlines premium
// ============================================================
function makeBackgroundTexture() {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Base: gradiente vertical oscuro
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, '#0a1228')
  bg.addColorStop(0.5, '#0d162e')
  bg.addColorStop(1, '#0a0e22')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // Hex grid sutil
  const hexSize = 38
  const hexW = hexSize * 2
  const hexH = hexSize * Math.sqrt(3)
  ctx.strokeStyle = 'rgba(0,221,255,0.07)'
  ctx.lineWidth = 1
  for (let row = -1; row < size / hexH + 2; row++) {
    for (let col = -1; col < size / (hexW * 0.75) + 2; col++) {
      const x = col * hexW * 0.75
      const y = row * hexH + (col % 2) * (hexH / 2)
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const px = x + (hexSize - 3) * Math.cos(angle)
        const py = y + (hexSize - 3) * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }

  // Glow radial central (vibe foco)
  const radial = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 1.5)
  radial.addColorStop(0, 'rgba(0,150,220,0.12)')
  radial.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, size, size)

  // Scanlines horizontales sutiles
  for (let y = 0; y < size; y += 3) {
    ctx.fillStyle = `rgba(0,200,255,0.025)`
    ctx.fillRect(0, y, size, 1)
  }

  // Circuit traces decorativos
  ctx.strokeStyle = 'rgba(255,68,170,0.15)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(80, 100); ctx.lineTo(80, 200); ctx.lineTo(180, 200)
  ctx.moveTo(size - 80, size - 100); ctx.lineTo(size - 80, size - 200); ctx.lineTo(size - 180, size - 200)
  ctx.stroke()
  // Puntos al final de los traces
  ctx.fillStyle = 'rgba(255,68,170,0.5)'
  ctx.beginPath(); ctx.arc(180, 200, 3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(size - 180, size - 200, 3, 0, Math.PI * 2); ctx.fill()

  // Códigos seriales esquinas (tipografía tech)
  ctx.fillStyle = 'rgba(0,221,255,0.4)'
  ctx.font = 'bold 14px "Consolas", monospace'
  ctx.fillText('SEC-TECH-001', 30, 30)
  ctx.textAlign = 'right'
  ctx.fillText('ONLINE · 100%', size - 30, 30)
  ctx.textAlign = 'left'
  ctx.fillText('// MELISSA-G', 30, size - 20)
  ctx.textAlign = 'right'
  ctx.fillText('v3.0.0', size - 30, size - 20)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ============================================================
// STATUS BAR INFERIOR — Premium HUD bar
// ============================================================
function makeStatusBarTexture(totalTechs) {
  const W = 1024
  const H = 96
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fondo translúcido oscuro
  ctx.fillStyle = 'rgba(8,12,28,0.85)'
  ctx.fillRect(0, 0, W, H)
  // Borde superior cyan
  ctx.fillStyle = 'rgba(0,221,255,0.5)'
  ctx.fillRect(0, 0, W, 2)

  // === Stats lado izquierdo ===
  const padX = 28
  const y = H / 2

  // Punto verde "ACTIVE"
  ctx.fillStyle = '#00ff88'
  ctx.shadowColor = '#00ff88'
  ctx.shadowBlur = 12
  ctx.beginPath(); ctx.arc(padX, y, 6, 0, Math.PI * 2); ctx.fill()
  ctx.shadowBlur = 0

  ctx.fillStyle = '#00ff88'
  ctx.font = 'bold 18px "Consolas", monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('SYSTEM ACTIVE', padX + 18, y)

  // Separador
  ctx.strokeStyle = 'rgba(140,180,220,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(padX + 195, y - 20); ctx.lineTo(padX + 195, y + 20); ctx.stroke()

  // Stack loaded
  ctx.fillStyle = '#00ddff'
  ctx.font = 'bold 18px "Consolas", monospace'
  ctx.fillText('STACK:', padX + 215, y)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${totalTechs}/${totalTechs}`, padX + 295, y)
  ctx.fillStyle = 'rgba(140,180,220,0.7)'
  ctx.font = '14px "Consolas", monospace'
  ctx.fillText('TECHS', padX + 345, y)

  // === Stats lado derecho ===
  ctx.fillStyle = '#ff66cc'
  ctx.font = 'bold 18px "Consolas", monospace'
  ctx.textAlign = 'right'
  ctx.fillText('SKILL_LEVEL:', W - padX - 100, y)
  ctx.fillStyle = '#ffffff'
  ctx.fillText('EXPERT', W - padX - 20, y)

  // Pequeños indicators a la derecha (3 LEDs)
  const ledY = y
  const ledStart = W - padX - 230
  ;['#00ff88', '#00ddff', '#ff66cc'].forEach((color, i) => {
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 10
    ctx.beginPath(); ctx.arc(ledStart + i * 16, ledY, 4, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0
  })

  // Borde inferior magenta
  ctx.fillStyle = 'rgba(255,68,170,0.4)'
  ctx.fillRect(0, H - 1, W, 1)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
