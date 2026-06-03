import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Ventana arquitectónica grande con vista a una ciudad cyberpunk.
 * Marco delgado de metal oscuro, skyline brillante, lluvia visible.
 */
export default function CyberCityWindow({
  position = [0, 3, 0],
  rotation = [0, 0, 0],
  width = 6,
  height = 3.5,
}) {
  const skylineTexture = useMemo(() => makeSkylineTexture(), [])

  // Textura de lluvia animada
  const rainCanvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 512
    return c
  }, [])
  const rainTexture = useMemo(() => {
    const t = new THREE.CanvasTexture(rainCanvas)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [rainCanvas])

  const drops = useMemo(() => {
    return Array.from({ length: 180 }, () => ({
      x: Math.random() * 512,
      y: Math.random() * 512,
      len: 12 + Math.random() * 22,
      speed: 7 + Math.random() * 9,
      alpha: 0.5 + Math.random() * 0.4,
    }))
  }, [])

  const skylineFlickerRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // ── ANIMAR LLUVIA ──
    const ctx = rainCanvas.getContext('2d')
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    ctx.fillRect(0, 0, 512, 512)
    ctx.strokeStyle = 'rgba(200,230,255,0.9)'
    ctx.lineWidth = 1.4
    drops.forEach(d => {
      ctx.globalAlpha = d.alpha
      ctx.beginPath()
      ctx.moveTo(d.x, d.y)
      ctx.lineTo(d.x - 2, d.y + d.len)
      ctx.stroke()
      d.y += d.speed
      if (d.y > 512) {
        d.y = -d.len
        d.x = Math.random() * 512
      }
    })
    ctx.globalAlpha = 1
    rainTexture.needsUpdate = true

    // ── FLICKER del skyline ──
    if (skylineFlickerRef.current) {
      skylineFlickerRef.current.material.opacity = 0.1 + Math.abs(Math.sin(t * 3)) * 0.12
    }
  })

  const frameThickness = 0.08    // marco delgado
  const frameDepth = 0.05

  return (
    <group position={position} rotation={rotation}>
      {/* ── CIELO + SKYLINE (capa más al fondo, ya MUY brillante) ── */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={skylineTexture} toneMapped={false} />
      </mesh>

      {/* Capa aditiva que pulsa para titilar las ventanas */}
      <mesh ref={skylineFlickerRef} position={[0, 0, 0.005]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={skylineTexture}
          toneMapped={false}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>


      {/* ── LLUVIA bien visible ── */}
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={rainTexture}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* ── MARCO DELGADO ARQUITECTÓNICO (gris oscuro metálico) ── */}
      {/* Superior */}
      <mesh position={[0, height / 2 + frameThickness / 2, frameDepth / 2]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#3a3e48" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* Inferior */}
      <mesh position={[0, -height / 2 - frameThickness / 2, frameDepth / 2]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#3a3e48" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* Izquierdo */}
      <mesh position={[-width / 2 - frameThickness / 2, 0, frameDepth / 2]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#3a3e48" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* Derecho */}
      <mesh position={[width / 2 + frameThickness / 2, 0, frameDepth / 2]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#3a3e48" metalness={0.9} roughness={0.35} />
      </mesh>

      {/* ── DIVISOR VERTICAL DELGADO (solo uno — ventanal a 2 paneles, no TV de 4) ── */}
      <mesh position={[0, 0, frameDepth / 2 - 0.005]}>
        <boxGeometry args={[0.03, height, frameDepth * 0.6]} />
        <meshStandardMaterial color="#2a2e36" metalness={0.85} roughness={0.4} />
      </mesh>

      {/* ── BRILLO SUAVE alrededor de la ventana (la integra con el cuarto) ── */}
      <pointLight position={[0, 0, 0.6]} color="#c66ed8" intensity={6} distance={7} />
      <pointLight position={[width * 0.3, height * 0.2, 0.4]} color="#66ddff" intensity={3} distance={5} />
    </group>
  )
}

/**
 * Textura del skyline cyberpunk: cielo + rascacielos con ventanas brillantes.
 * Pintada con tonos vibrantes para que se vea bien sin dependerá de iluminación.
 */
function makeSkylineTexture() {
  const W = 2048
  const H = 1024
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── CIELO MUY brillante (cyberpunk vibrant) ──
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0,    '#3a1a80')
  sky.addColorStop(0.25, '#5a2099')
  sky.addColorStop(0.5,  '#9a3aa0')
  sky.addColorStop(0.7,  '#d44c8a')
  sky.addColorStop(0.85, '#a02a70')
  sky.addColorStop(1,    '#3a1240')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)

  // Estrellas
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * W
    const y = Math.random() * H * 0.45
    const a = 0.4 + Math.random() * 0.6
    ctx.fillStyle = `rgba(255,255,255,${a})`
    const s = Math.random() > 0.85 ? 2.5 : 1.5
    ctx.fillRect(x, y, s, s)
  }

  // Nubes tenues
  for (let i = 0; i < 8; i++) {
    const cx = Math.random() * W
    const cy = 80 + Math.random() * 350
    const r = 100 + Math.random() * 250
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, 'rgba(220,140,220,0.35)')
    g.addColorStop(1, 'rgba(220,140,220,0)')
    ctx.fillStyle = g
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  }

  // RESPLANDOR HORIZONTE (potente — esto es lo que hace ver la ciudad)
  const glow = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.95)
  glow.addColorStop(0,   'rgba(255,140,220,0)')
  glow.addColorStop(0.5, 'rgba(255,140,220,0.45)')
  glow.addColorStop(1,   'rgba(255,140,220,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, H * 0.5, W, H * 0.45)

  // ── 3 CAPAS de rascacielos ──
  drawSkylineLayer(ctx, W, H, {
    count: 40,
    minH: 200, maxH: 480,
    baseY: H * 0.55,
    color: '#2a1f4a',
    windowColor: 'rgba(200,160,255,1)',
    windowDensity: 0.45,
    minW: 30, maxW: 80,
  })
  drawSkylineLayer(ctx, W, H, {
    count: 28,
    minH: 380, maxH: 620,
    baseY: H * 0.66,
    color: '#1a1230',
    windowColor: 'rgba(255,210,255,1)',
    windowDensity: 0.6,
    minW: 55, maxW: 130,
  })
  drawSkylineLayer(ctx, W, H, {
    count: 20,
    minH: 520, maxH: 820,
    baseY: H * 0.8,
    color: '#0a0820',
    windowColor: 'rgba(0,250,255,1)',
    windowDensity: 0.7,
    minW: 90, maxW: 200,
  })

  // ── CARTELES NEÓN GIGANTES con mucho glow ──
  ctx.font = 'bold 64px monospace'
  const signs = [
    { text: 'NEON · CITY', color: '#ff44aa', x: W * 0.1,  y: H * 0.48 },
    { text: 'CYBERTECH',   color: '#00ddff', x: W * 0.48, y: H * 0.55 },
    { text: 'MΞGΛ',        color: '#ffaa00', x: W * 0.8,  y: H * 0.42 },
  ]
  signs.forEach(s => {
    ctx.shadowColor = s.color
    ctx.shadowBlur = 50
    ctx.fillStyle = s.color
    ctx.fillText(s.text, s.x, s.y)
    ctx.fillText(s.text, s.x, s.y)
    ctx.fillText(s.text, s.x, s.y)
    ctx.shadowBlur = 0
  })

  // Smog inferior MUY sutil — solo última franja
  const fog = ctx.createLinearGradient(0, H * 0.85, 0, H)
  fog.addColorStop(0, 'rgba(140,40,160,0)')
  fog.addColorStop(1, 'rgba(80,20,100,0.35)')
  ctx.fillStyle = fog
  ctx.fillRect(0, H * 0.85, W, H * 0.15)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function drawSkylineLayer(ctx, W, H, opts) {
  const { count, minH, maxH, baseY, color, windowColor, windowDensity, minW, maxW } = opts
  let x = 0
  for (let i = 0; i < count; i++) {
    const w = minW + Math.random() * (maxW - minW)
    const h = minH + Math.random() * (maxH - minH)
    const y = baseY - h * 0.3
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, H - y)

    // Antena con luz roja parpadeante
    if (Math.random() > 0.5) {
      ctx.fillStyle = color
      ctx.fillRect(x + w / 2 - 1, y - 25, 2, 25)
      ctx.fillStyle = '#ff0044'
      ctx.fillRect(x + w / 2 - 3, y - 28, 6, 6)
    }

    // Ventanas
    const cellW = 8
    const cellH = 10
    const cols = Math.floor((w - 6) / cellW)
    const rows = Math.floor((H - y - 10) / cellH)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < windowDensity) {
          ctx.fillStyle = windowColor
          ctx.fillRect(x + 3 + c * cellW, y + 5 + r * cellH, 4, 6)
        }
      }
    }

    x += w + Math.random() * 12
    if (x > W) break
  }
}
