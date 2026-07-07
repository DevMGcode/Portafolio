import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const DEVICON = (slug, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-${variant}.svg`

const TECHS = [
  { name: 'HTML',       iconUrl: DEVICON('html5'),                       color: '#e34f26', level: 5 },
  { name: 'CSS',        iconUrl: DEVICON('css3'),                        color: '#1572b6', level: 5 },
  { name: 'JavaScript', iconUrl: DEVICON('javascript'),                  color: '#f7df1e', level: 5 },
  { name: 'TypeScript', iconUrl: DEVICON('typescript'),                  color: '#3178c6', level: 4 },
  { name: 'Python',     iconUrl: DEVICON('python'),                      color: '#3776ab', level: 3 },
  { name: 'React',      iconUrl: DEVICON('react'),                       color: '#61dafb', level: 5 },
  { name: 'Next.js',    iconUrl: DEVICON('nextjs', 'original-wordmark'), color: '#ffffff', level: 4 },
  { name: 'Angular',    iconUrl: DEVICON('angularjs'),                   color: '#dd0031', level: 4 },
  { name: 'Tailwind',   iconUrl: DEVICON('tailwindcss', 'original'),     color: '#06b6d4', level: 5 },
  { name: 'Bootstrap',  iconUrl: DEVICON('bootstrap'),                   color: '#7952b3', level: 5 },
  { name: 'Node.js',    iconUrl: DEVICON('nodejs'),                      color: '#7cc242', level: 4 },
  { name: 'Express',    iconUrl: DEVICON('express'),                     color: '#cccccc', level: 4 },
  { name: 'Spring',     iconUrl: DEVICON('spring'),                      color: '#6db33f', level: 3 },
  { name: 'Java',       iconUrl: DEVICON('java'),                        color: '#f89820', level: 3 },
  { name: 'Git',        iconUrl: DEVICON('git'),                         color: '#f05032', level: 4 },
]

const COLS = 5
const ROWS = 3
const PLAQUE_W = 0.58
const PLAQUE_H = 0.72   // más alto para que quepan nombre + dots debajo del hex
const GAP_X    = 0.07
const GAP_Y    = 0.07
const PANEL_W  = 3.55
const PANEL_H  = 2.75

export default function TechStackWall() {
  const plaqueGroupRef  = useRef()
  const scanRef         = useRef()
  const scanMat         = useRef()
  const ledRefs         = useRef([])
  const glowPanelRef    = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // 1. Scanline projector — sube de abajo a arriba en loop
    if (scanRef.current && scanMat.current) {
      const progress = (t * 0.35) % 1
      scanRef.current.position.y = -PANEL_H / 2 + progress * PANEL_H
      scanMat.current.opacity = 0.18 + Math.sin(t * 4) * 0.06
    }

    // 2. Animación individual por placa (respiración escalonada)
    if (plaqueGroupRef.current) {
      plaqueGroupRef.current.children.forEach((plaque, i) => {
        const phase = i * 0.42
        const breathe  = 1 + Math.sin(t * 1.1 + phase) * 0.028
        const floatZ   = Math.sin(t * 1.8 + phase * 1.3) * 0.005
        plaque.scale.setScalar(breathe)
        plaque.position.z = 0.01 + Math.abs(floatZ)
      })
    }

    // 3. LED borders — efecto chasing light
    ledRefs.current.forEach((mesh, i) => {
      if (!mesh?.material) return
      const wave = Math.sin(t * 2.5 + i * 1.2)
      mesh.material.emissiveIntensity = 1.3 + wave * 0.55
    })

    // 4. Panel background glow pulse
    if (glowPanelRef.current?.material) {
      glowPanelRef.current.material.emissiveIntensity = 0.18 + Math.sin(t * 0.8) * 0.06
    }
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

  const titleTexture  = useMemo(() => makeTitleTexture(), [])
  const bgTexture     = useMemo(() => makeBackgroundTexture(), [])
  const statusTexture = useMemo(() => makeStatusBarTexture(TECHS.length), [])

  return (
    <group>
      {/* ── Marco metálico exterior ── */}
      <mesh position={[0, 0, -0.065]}>
        <planeGeometry args={[PANEL_W + 0.16, PANEL_H + 0.16]} />
        <meshStandardMaterial color="#16191f" metalness={0.96} roughness={0.22} />
      </mesh>

      {/* ── Fondo del panel ── */}
      <mesh ref={glowPanelRef} position={[0, 0, -0.04]}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshStandardMaterial
          map={bgTexture}
          color="#ffffff"
          emissive="#0a1a2a"
          emissiveIntensity={0.18}
          metalness={0.35}
          roughness={0.65}
        />
      </mesh>

      {/* ── LEDs del marco (4 lados) ── */}
      <group>
        {/* Top cyan */}
        <mesh ref={(el) => (ledRefs.current[0] = el)} position={[0, PANEL_H / 2 - 0.011, -0.018]}>
          <boxGeometry args={[PANEL_W - 0.02, 0.016, 0.028]} />
          <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        {/* Bottom magenta */}
        <mesh ref={(el) => (ledRefs.current[1] = el)} position={[0, -PANEL_H / 2 + 0.011, -0.018]}>
          <boxGeometry args={[PANEL_W - 0.02, 0.016, 0.028]} />
          <meshStandardMaterial color="#ff44aa" emissive="#ff44aa" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        {/* Left */}
        <mesh ref={(el) => (ledRefs.current[2] = el)} position={[-PANEL_W / 2 + 0.011, 0, -0.018]}>
          <boxGeometry args={[0.016, PANEL_H - 0.02, 0.028]} />
          <meshStandardMaterial color="#5a8fb0" emissive="#5a8fb0" emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
        {/* Right */}
        <mesh ref={(el) => (ledRefs.current[3] = el)} position={[PANEL_W / 2 - 0.011, 0, -0.018]}>
          <boxGeometry args={[0.016, PANEL_H - 0.02, 0.028]} />
          <meshStandardMaterial color="#5a8fb0" emissive="#5a8fb0" emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      </group>

      {/* ── Corner HUD brackets ── */}
      {[
        [-PANEL_W / 2 + 0.06,  PANEL_H / 2 - 0.06],
        [ PANEL_W / 2 - 0.06,  PANEL_H / 2 - 0.06],
        [-PANEL_W / 2 + 0.06, -PANEL_H / 2 + 0.06],
        [ PANEL_W / 2 - 0.06, -PANEL_H / 2 + 0.06],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.006]}>
          <ringGeometry args={[0.019, 0.026, 24, 1, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={1.6} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ── Tornillos decorativos ── */}
      {[
        [-PANEL_W / 2 - 0.044,  PANEL_H / 2 + 0.044],
        [ PANEL_W / 2 + 0.044,  PANEL_H / 2 + 0.044],
        [-PANEL_W / 2 - 0.044, -PANEL_H / 2 - 0.044],
        [ PANEL_W / 2 + 0.044, -PANEL_H / 2 - 0.044],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.015, 16]} />
          <meshStandardMaterial color="#4a5060" metalness={1} roughness={0.3} />
        </mesh>
      ))}

      {/* ── Título TECH STACK ── */}
      <mesh position={[0, PANEL_H / 2 - 0.175, 0.012]}>
        <planeGeometry args={[2.0, 0.22]} />
        <meshBasicMaterial map={titleTexture} transparent toneMapped={false} />
      </mesh>

      {/* ── Scanline proyector animado ── */}
      <mesh ref={scanRef} position={[0, -PANEL_H / 2, 0.005]}>
        <planeGeometry args={[PANEL_W - 0.04, 0.018]} />
        <meshBasicMaterial
          ref={scanMat}
          color="#00ddff"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* ── Placas hexagonales ── */}
      <group ref={plaqueGroupRef} position={[0, -0.09, 0.012]}>
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

      {/* ── Status bar inferior ── */}
      <mesh position={[0, -PANEL_H / 2 + 0.1, 0.012]}>
        <planeGeometry args={[PANEL_W - 0.08, 0.135]} />
        <meshBasicMaterial map={statusTexture} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

// ============================================================
// TEXTURAS PROCEDURALES — Alta resolución
// ============================================================

function makePlaqueTexture(tech) {
  // Canvas más alto para que el nombre y dots queden DEBAJO del hexágono
  const W  = 512
  const H  = 620
  const cx = W / 2

  // Hexágono centrado en el tercio superior
  const HEX_CY = 210
  const HEX_RX = 198
  const HEX_RY = 184
  // Ícono
  const ICON_SIZE = 160
  const ICON_Y    = HEX_CY - ICON_SIZE / 2 - 5
  // Texto y dots debajo del hex
  const NAME_Y  = HEX_CY + HEX_RY + 50   // justo debajo del punto más bajo del hex
  const DOTS_Y  = NAME_Y + 58

  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const drawBase = () => {
    ctx.clearRect(0, 0, W, H)

    // ── Glow exterior amplio (halo de color) ──
    ctx.shadowColor = tech.color
    ctx.shadowBlur  = 55
    drawHexPath(ctx, cx, HEX_CY, HEX_RX + 6, HEX_RY + 6)
    ctx.strokeStyle = tech.color + '88'
    ctx.lineWidth   = 3
    ctx.stroke()
    ctx.shadowBlur  = 0

    // ── Borde principal del hexágono ──
    ctx.shadowColor = tech.color
    ctx.shadowBlur  = 28
    drawHexPath(ctx, cx, HEX_CY, HEX_RX, HEX_RY)
    ctx.strokeStyle = tech.color
    ctx.lineWidth   = 6
    ctx.stroke()
    ctx.shadowBlur  = 0

    // ── Fondo interior oscuro y profundo ──
    drawHexPath(ctx, cx, HEX_CY, HEX_RX - 4, HEX_RY - 4)
    const fill = ctx.createRadialGradient(cx, HEX_CY - 40, 10, cx, HEX_CY, HEX_RX)
    fill.addColorStop(0,   'rgba(28, 40, 75, 0.98)')
    fill.addColorStop(0.65,'rgba(12, 18, 42, 0.98)')
    fill.addColorStop(1,   'rgba(4,  7,  18, 0.98)')
    ctx.fillStyle = fill
    ctx.fill()

    // ── Highlight superior (luz que baja desde arriba) ──
    drawHexPath(ctx, cx, HEX_CY, HEX_RX - 4, HEX_RY - 4)
    const shine = ctx.createLinearGradient(cx, HEX_CY - HEX_RY, cx, HEX_CY)
    shine.addColorStop(0, 'rgba(255,255,255,0.08)')
    shine.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = shine
    ctx.fill()

    // ── Rim interior sutíl del color del tech ──
    drawHexPath(ctx, cx, HEX_CY, HEX_RX - 4, HEX_RY - 4)
    ctx.strokeStyle = tech.color + '28'
    ctx.lineWidth   = 2
    ctx.stroke()

    // ── Nombre del tech — DEBAJO del hexágono, limpio ──
    ctx.fillStyle    = '#ffffff'
    ctx.font         = 'bold 46px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor  = tech.color
    ctx.shadowBlur   = 22
    ctx.fillText(tech.name.toUpperCase(), cx, NAME_Y)
    ctx.shadowBlur   = 0

    // ── Línea divisoria bajo el nombre ──
    const lineW = Math.min(ctx.measureText(tech.name.toUpperCase()).width + 20, 260)
    const lineGrad = ctx.createLinearGradient(cx - lineW / 2, 0, cx + lineW / 2, 0)
    lineGrad.addColorStop(0,   'rgba(255,255,255,0)')
    lineGrad.addColorStop(0.3, tech.color + 'aa')
    lineGrad.addColorStop(0.7, tech.color + 'aa')
    lineGrad.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.strokeStyle = lineGrad
    ctx.lineWidth   = 2
    ctx.beginPath()
    ctx.moveTo(cx - lineW / 2, NAME_Y + 30)
    ctx.lineTo(cx + lineW / 2, NAME_Y + 30)
    ctx.stroke()

    // ── Dots de nivel — 5 círculos grandes y claros ──
    const DOT_R    = 14
    const DOT_GAP  = 38
    const dotsW    = 4 * DOT_GAP
    const dotsStartX = cx - dotsW / 2

    for (let i = 0; i < 5; i++) {
      const dx = dotsStartX + i * DOT_GAP
      const filled = i < tech.level
      if (filled) {
        // Glow del dot lleno
        ctx.shadowColor = tech.color
        ctx.shadowBlur  = 22
        // Gradiente radial en el dot
        const dg = ctx.createRadialGradient(dx, DOTS_Y - 3, 1, dx, DOTS_Y, DOT_R)
        dg.addColorStop(0, '#ffffff')
        dg.addColorStop(0.35, tech.color)
        dg.addColorStop(1, tech.color + 'bb')
        ctx.fillStyle = dg
        ctx.beginPath()
        ctx.arc(dx, DOTS_Y, DOT_R, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        // Dot vacío: borde sutil
        ctx.fillStyle   = 'rgba(40,60,110,0.5)'
        ctx.strokeStyle = 'rgba(100,140,200,0.3)'
        ctx.lineWidth   = 1.5
        ctx.beginPath()
        ctx.arc(dx, DOTS_Y, DOT_R, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }
  }

  drawBase()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16

  if (tech.iconUrl) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      drawBase()
      ctx.save()
      ctx.shadowColor = tech.color
      ctx.shadowBlur  = 18
      ctx.drawImage(img, cx - ICON_SIZE / 2, ICON_Y, ICON_SIZE, ICON_SIZE)
      ctx.restore()
      tex.needsUpdate = true
    }
    img.onerror = () => {
      ctx.fillStyle   = tech.color
      ctx.shadowColor = tech.color
      ctx.shadowBlur  = 30
      ctx.font        = 'bold 120px "Segoe UI", monospace'
      ctx.textAlign   = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(tech.name[0], cx, HEX_CY)
      ctx.shadowBlur  = 0
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

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── Título TECH STACK ─────────────────────────────────────────
function makeTitleTexture() {
  const W = 768
  const H = 110
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H)

  const title = 'TECH STACK'
  const y = H / 2 - 10

  // Glow magenta
  ctx.shadowColor = '#ff44aa'
  ctx.shadowBlur  = 35
  ctx.fillStyle   = '#ff44aa'
  ctx.font = 'bold 64px "Segoe UI", system-ui'
  ctx.textAlign   = 'center'
  ctx.textBaseline = 'middle'
  const ls = 5
  const totalW = ctx.measureText(title).width + (title.length - 1) * ls
  let xPos = W / 2 - totalW / 2
  for (const ch of title) {
    const w = ctx.measureText(ch).width
    ctx.fillText(ch, xPos + w / 2, y)
    xPos += w + ls
  }

  // Blanco encima para nitidez
  ctx.shadowBlur = 0
  ctx.fillStyle  = '#ffffff'
  xPos = W / 2 - totalW / 2
  for (const ch of title) {
    const w = ctx.measureText(ch).width
    ctx.fillText(ch, xPos + w / 2, y)
    xPos += w + ls
  }

  // Líneas decorativas cyan
  ctx.strokeStyle = '#00ddff'
  ctx.lineWidth   = 2.5
  ctx.shadowColor = '#00ddff'
  ctx.shadowBlur  = 10
  const yLine = y
  ctx.beginPath()
  ctx.moveTo(38, yLine); ctx.lineTo(125, yLine)
  ctx.moveTo(W - 125, yLine); ctx.lineTo(W - 38, yLine)
  ctx.stroke()
  // Diamante decorativo en las líneas
  ;[[125, yLine], [W - 125, yLine]].forEach(([px, py]) => {
    ctx.save()
    ctx.translate(px, py)
    ctx.rotate(Math.PI / 4)
    ctx.fillStyle = '#00ddff'
    ctx.fillRect(-4, -4, 8, 8)
    ctx.restore()
  })
  ctx.shadowBlur = 0

  // Subtítulo
  ctx.fillStyle   = 'rgba(0,221,255,0.9)'
  ctx.font        = 'bold 16px "Consolas", monospace'
  ctx.shadowColor = '#00ddff'
  ctx.shadowBlur  = 10
  ctx.fillText('◇  STACK · SKILL · TREE  ◇', W / 2, H - 16)
  ctx.shadowBlur = 0

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  return tex
}

// ── Fondo — hex grid + scanlines + circuit traces ─────────────
function makeBackgroundTexture() {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Base gradiente
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0,   '#0c1530')
  bg.addColorStop(0.45,'#0f1a38')
  bg.addColorStop(1,   '#090d22')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // Hex grid sutil
  const hexSize = 42
  const hexW = hexSize * 2
  const hexH = hexSize * Math.sqrt(3)
  ctx.strokeStyle = 'rgba(0,221,255,0.065)'
  ctx.lineWidth   = 1
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

  // Glow radial central
  const radial = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 1.6)
  radial.addColorStop(0, 'rgba(0,160,240,0.14)')
  radial.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, size, size)

  // Scanlines CRT horizontales
  for (let y = 0; y < size; y += 4) {
    ctx.fillStyle = 'rgba(0,200,255,0.022)'
    ctx.fillRect(0, y, size, 1)
  }

  // Circuit traces decorativos
  ctx.strokeStyle = 'rgba(255,68,170,0.18)'
  ctx.lineWidth   = 1.5
  ctx.beginPath()
  ctx.moveTo(70, 90); ctx.lineTo(70, 190); ctx.lineTo(200, 190)
  ctx.moveTo(size - 70, size - 90); ctx.lineTo(size - 70, size - 190); ctx.lineTo(size - 200, size - 190)
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,68,170,0.6)'
  ;[[200, 190], [size - 200, size - 190]].forEach(([px, py]) => {
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill()
  })

  // Textos HUD corners
  ctx.fillStyle = 'rgba(0,221,255,0.45)'
  ctx.font = 'bold 15px "Consolas", monospace'
  ctx.textBaseline = 'top'
  ctx.fillText('SEC-TECH-001', 28, 22)
  ctx.textAlign = 'right'
  ctx.fillText('ONLINE · 100%', size - 28, 22)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('// MELISSA-G', 28, size - 16)
  ctx.textAlign = 'right'
  ctx.fillText('v3.0.0', size - 28, size - 16)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── Status bar inferior ───────────────────────────────────────
function makeStatusBarTexture(totalTechs) {
  const W = 2048   // doble resolución — texto nítido
  const H = 200
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fondo sólido contrastado
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#04080f')
  bg.addColorStop(1, '#020408')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Borde superior cyan — grueso y brillante
  ctx.fillStyle   = '#00ddff'
  ctx.shadowColor = '#00ddff'
  ctx.shadowBlur  = 20
  ctx.fillRect(0, 0, W, 5)
  ctx.shadowBlur  = 0

  const y    = H / 2 + 6
  const padX = 56

  // ── LED + SYSTEM ACTIVE ──
  ctx.fillStyle   = '#00ff88'
  ctx.shadowColor = '#00ff88'
  ctx.shadowBlur  = 28
  ctx.beginPath()
  ctx.arc(padX, y, 14, 0, Math.PI * 2)
  ctx.fill()
  // Highlight interior del LED
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.arc(padX - 4, y - 4, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle    = '#00ff88'
  ctx.font         = 'bold 46px "Consolas", monospace'
  ctx.textAlign    = 'left'
  ctx.textBaseline = 'middle'
  ctx.shadowColor  = '#00ff88'
  ctx.shadowBlur   = 16
  ctx.fillText('SYSTEM ACTIVE', padX + 36, y)
  ctx.shadowBlur   = 0

  // Separador 1
  ctx.strokeStyle = 'rgba(0,221,255,0.4)'
  ctx.lineWidth   = 2
  ctx.beginPath()
  ctx.moveTo(padX + 460, y - 36)
  ctx.lineTo(padX + 460, y + 36)
  ctx.stroke()

  // ── STACK: 15/15 TECHS ──
  ctx.fillStyle   = '#00ddff'
  ctx.font        = 'bold 46px "Consolas", monospace'
  ctx.shadowColor = '#00ddff'
  ctx.shadowBlur  = 14
  ctx.fillText('STACK:', padX + 490, y)
  ctx.shadowBlur  = 0

  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${totalTechs}/${totalTechs}`, padX + 680, y)

  ctx.fillStyle = 'rgba(180,215,245,0.9)'
  ctx.font      = '38px "Consolas", monospace'
  ctx.fillText('TECHS', padX + 780, y)

  // Separador 2
  ctx.strokeStyle = 'rgba(255,68,170,0.4)'
  ctx.lineWidth   = 2
  ctx.beginPath()
  ctx.moveTo(padX + 940, y - 36)
  ctx.lineTo(padX + 940, y + 36)
  ctx.stroke()

  // ── LEDs decorativos ──
  const ledX = padX + 980
  ;['#00ff88', '#00ddff', '#ff66cc'].forEach((color, i) => {
    ctx.fillStyle   = color
    ctx.shadowColor = color
    ctx.shadowBlur  = 18
    ctx.beginPath()
    ctx.arc(ledX + i * 36, y, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  })

  // ── SKILL: EXPERT (derecha) ──
  ctx.textAlign   = 'right'
  ctx.fillStyle   = '#ff66cc'
  ctx.font        = 'bold 40px "Consolas", monospace'
  ctx.shadowColor = '#ff66cc'
  ctx.shadowBlur  = 14
  ctx.fillText('SKILL:', W - padX - 210, y)
  ctx.shadowBlur  = 0

  ctx.fillStyle   = '#ffffff'
  ctx.font        = 'bold 50px "Consolas", monospace'
  ctx.shadowColor = '#ff66cc'
  ctx.shadowBlur  = 18
  ctx.fillText('EXPERT', W - padX - 20, y)
  ctx.shadowBlur  = 0

  // Borde inferior magenta — grueso y brillante
  ctx.fillStyle   = '#ff44aa'
  ctx.shadowColor = '#ff44aa'
  ctx.shadowBlur  = 16
  ctx.fillRect(0, H - 5, W, 5)
  ctx.shadowBlur  = 0

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace  = THREE.SRGBColorSpace
  tex.anisotropy  = 16   // filtrado anisotrópico para bordes nítidos
  return tex
}
