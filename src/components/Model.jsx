import { useGLTF } from '@react-three/drei'
import { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { assetPath } from '../utils/assetPath'

// Genera una geometría tipo "plane curvo" (sección cilíndrica) para pantallas ultrawide.
// curveAmount = mitad del ángulo total (radianes). 0 = plano.
function makeCurvedPlaneGeometry(width, height, curveAmount = 0.28, segs = 48) {
  if (curveAmount <= 0.001) return new THREE.PlaneGeometry(width, height)
  const radius = width / (2 * Math.sin(curveAmount))
  const positions = []
  const uvs = []
  const indices = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const angle = (t - 0.5) * curveAmount * 2
    const x = radius * Math.sin(angle)
    const z = radius * (1 - Math.cos(angle))   // edges bulgan hacia +z (viewer)
    for (let j = 0; j <= 1; j++) {
      const y = (j - 0.5) * height
      positions.push(x, y, z)
      uvs.push(t, j)
    }
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3
    indices.push(a, c, b, b, c, d)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  g.setIndex(indices)
  g.computeVertexNormals()
  return g
}

/**
 * Renderiza un GLB normalizado, con pivot en su BASE (default) o en su CENTRO.
 * El group externo decide la posición en el mundo.
 *
 * pivot: 'base' = el punto y=0 del group queda al pie del objeto (para muebles)
 *        'center' = el punto y=0 del group queda al centro (para flotantes)
 */
export default function Model({ url, targetSize = 1, pivot = 'base', rotation = [0, 0, 0], animatedScreen = false, animatedScreenTransform = null, onScreenMesh = null }) {
  // 🛡️ Prefixea la URL con BASE_URL para que funcione tanto en dev como en GH Pages
  const { scene } = useGLTF(assetPath(url))
  const animRef = useRef(null)

  const object = useMemo(() => {
    const cloned = scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    cloned.scale.setScalar(targetSize / maxDim)

    const box2 = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    box2.getCenter(center)
    cloned.position.x -= center.x
    cloned.position.z -= center.z
    if (pivot === 'base') {
      cloned.position.y -= box2.min.y
    } else {
      cloned.position.y -= center.y
    }
    return cloned
  }, [scene, targetSize, pivot])

  useEffect(() => {
    if (!animatedScreen) return

    // Crear canvas y texture
    const canvas = document.createElement('canvas')
    const size = 1024
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    // SIEMPRE creamos UN único plane con la textura, alineado con el frente del objeto.
    // No hacemos material swap ni buscamos meshes — esto garantiza una sola pantalla.
    {
      const box3 = new THREE.Box3().setFromObject(object)
      const sizeVec = new THREE.Vector3()
      box3.getSize(sizeVec)
      const center = new THREE.Vector3()
      box3.getCenter(center)

      // OCULTAR meshes "pantalla baked-in" del modelo p_dashboard para que no compitan
      object.traverse((node) => {
        if (!node.isMesh) return
        const n = (node.name || '').toLowerCase()
        const m = (node.material && node.material.name ? node.material.name : '').toLowerCase()
        if (
          n.includes('screen') || n.includes('display') || n.includes('panel') || n.includes('monitor') ||
          m.includes('screen') || m.includes('display') || m.includes('emission')
        ) {
          node.visible = false
        }
      })

      // Tamaño ajustado a la pantalla del MONITOR CURVO.
      // Proporción 16:9 estilo monitor ultrawide.
      const baseW = Math.max(sizeVec.x || 1, sizeVec.y || 1, sizeVec.z || 1)
      const planeWidth = baseW * 1.15
      const planeHeight = planeWidth * 0.56

      // === PLANE CURVO (estilo monitor ultrawide) ===
      // Geometría custom cilíndrica para coincidir con la curva del monitor.
      const curveAmount = 0.28   // mitad del ángulo total (rad) — 0=plano
      const planeGeo = makeCurvedPlaneGeometry(planeWidth, planeHeight, curveAmount, 48)
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        side: THREE.DoubleSide,       // curvo: visible desde ambos lados
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -30,
      })
      const plane = new THREE.Mesh(planeGeo, mat)

      // Bien al frente del modelo (30cm), garantizando NO toca nada del p_dashboard
      plane.position.set(center.x, center.y, box3.max.z + 0.3)
      plane.renderOrder = 10
      plane.name = 'screen_fallback'
      object.add(plane)
      if (onScreenMesh) onScreenMesh(plane)

      // Aplicar transform guardado del layout (coordenadas locales del modelo)
      if (animatedScreenTransform) {
        try {
          const s = animatedScreenTransform
          if (s.pos) plane.position.set(...s.pos)
          if (s.scale) plane.scale.set(...s.scale)
        } catch (e) {}
      }
    }

    let rafId = null
    let start = performance.now()

    // === DASHBOARD ANALÍTICO PROFESIONAL ===
    // Helpers
    function panel(x, y, w, h, label) {
      // Fondo del panel
      ctx.fillStyle = 'rgba(15,25,45,0.95)'
      ctx.fillRect(x, y, w, h)
      // Borde sutil
      ctx.strokeStyle = 'rgba(80,140,200,0.25)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
      // Accent superior
      ctx.fillStyle = 'rgba(0,200,255,0.4)'
      ctx.fillRect(x, y, w, 2)
      // Label
      if (label) {
        ctx.fillStyle = 'rgba(140,180,220,0.7)'
        ctx.font = '600 13px "Segoe UI", system-ui'
        ctx.textBaseline = 'top'
        ctx.fillText(label, x + 14, y + 12)
      }
    }

    function drawLineChart(x, y, w, h, label, t) {
      panel(x, y, w, h, label)
      const padL = 50, padR = 18, padT = 38, padB = 28
      const cx = x + padL, cy = y + padT
      const cw = w - padL - padR, ch = h - padT - padB
      // Grid horizontal
      ctx.strokeStyle = 'rgba(80,140,200,0.1)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const gy = cy + (i / 4) * ch
        ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx + cw, gy); ctx.stroke()
        // Eje Y labels
        ctx.fillStyle = 'rgba(140,180,220,0.5)'
        ctx.font = '11px "Segoe UI"'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'right'
        ctx.fillText(`${100 - i * 25}k`, cx - 8, gy)
      }
      ctx.textAlign = 'left'
      // X labels (días)
      const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
      ctx.fillStyle = 'rgba(140,180,220,0.5)'
      ctx.font = '11px "Segoe UI"'
      ctx.textBaseline = 'top'
      days.forEach((d, i) => {
        const dx = cx + (i / (days.length - 1)) * cw
        ctx.textAlign = 'center'
        ctx.fillText(d, dx, cy + ch + 8)
      })
      ctx.textAlign = 'left'
      // Series 1 (cyan - revenue)
      const drawSeries = (color, offset, amp, freq) => {
        ctx.strokeStyle = color
        ctx.lineWidth = 2.5
        ctx.beginPath()
        for (let i = 0; i <= 80; i++) {
          const px = cx + (i / 80) * cw
          const v = 0.5 + Math.sin(t * 0.5 + i * freq + offset) * 0.18 + Math.sin(t * 0.3 + i * 0.05) * 0.1
          const py = cy + ch - v * ch
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.stroke()
        // Fill bajo curva
        ctx.lineTo(cx + cw, cy + ch)
        ctx.lineTo(cx, cy + ch)
        ctx.closePath()
        const grad = ctx.createLinearGradient(0, cy, 0, cy + ch)
        grad.addColorStop(0, color.replace('1)', '0.25)'))
        grad.addColorStop(1, color.replace('1)', '0)'))
        ctx.fillStyle = grad
        ctx.fill()
      }
      drawSeries('rgba(0,200,255,1)', 0, 1, 0.08)
      drawSeries('rgba(255,100,200,1)', 2, 1, 0.06)
      // Leyenda
      ctx.font = '11px "Segoe UI"'
      ctx.fillStyle = 'rgba(0,200,255,0.9)'
      ctx.fillRect(x + w - 130, y + 14, 8, 8)
      ctx.fillStyle = '#cfe5f5'
      ctx.fillText('Ingresos', x + w - 116, y + 14)
      ctx.fillStyle = 'rgba(255,100,200,0.9)'
      ctx.fillRect(x + w - 130, y + 28, 8, 8)
      ctx.fillStyle = '#cfe5f5'
      ctx.fillText('Visitas', x + w - 116, y + 28)
    }

    function drawBarChart(x, y, w, h, label, t) {
      panel(x, y, w, h, label)
      const padL = 38, padR = 14, padT = 38, padB = 26
      const cx = x + padL, cy = y + padT
      const cw = w - padL - padR, ch = h - padT - padB
      const n = 7
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul']
      const barW = (cw / n) * 0.6
      const gap = (cw / n) * 0.4
      for (let i = 0; i < n; i++) {
        const v = 0.4 + (Math.sin(t * 0.7 + i * 0.9) + 1) / 2 * 0.55
        const bh = v * ch
        const bx = cx + i * (barW + gap) + gap / 2
        const by = cy + ch - bh
        const grad = ctx.createLinearGradient(0, by, 0, by + bh)
        grad.addColorStop(0, 'rgba(0,220,255,0.95)')
        grad.addColorStop(1, 'rgba(0,120,200,0.65)')
        ctx.fillStyle = grad
        ctx.fillRect(bx, by, barW, bh)
        // Label
        ctx.fillStyle = 'rgba(140,180,220,0.55)'
        ctx.font = '10px "Segoe UI"'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(months[i], bx + barW / 2, cy + ch + 6)
      }
      ctx.textAlign = 'left'
    }

    function drawDonut(x, y, w, h, label, percent) {
      panel(x, y, w, h, label)
      const cxC = x + w / 2
      const cyC = y + h / 2 + 8
      const r = Math.min(w, h) * 0.32
      // Anillo fondo
      ctx.lineWidth = 16
      ctx.strokeStyle = 'rgba(80,140,200,0.15)'
      ctx.beginPath()
      ctx.arc(cxC, cyC, r, 0, Math.PI * 2)
      ctx.stroke()
      // Anillo valor
      const start = -Math.PI / 2
      const end = start + (percent / 100) * Math.PI * 2
      const grad = ctx.createLinearGradient(cxC - r, cyC, cxC + r, cyC)
      grad.addColorStop(0, '#00ddff')
      grad.addColorStop(1, '#ff66cc')
      ctx.strokeStyle = grad
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(cxC, cyC, r, start, end)
      ctx.stroke()
      ctx.lineCap = 'butt'
      // Texto central
      ctx.fillStyle = '#e8f4ff'
      ctx.font = '700 28px "Segoe UI"'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${Math.round(percent)}%`, cxC, cyC - 4)
      ctx.fillStyle = 'rgba(140,180,220,0.7)'
      ctx.font = '11px "Segoe UI"'
      ctx.fillText('Conversión', cxC, cyC + 22)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
    }

    function draw(now) {
      const t2 = (now - start) / 1000
      // === Fondo dashboard ===
      const bg = ctx.createLinearGradient(0, 0, 0, size)
      bg.addColorStop(0, '#0a1024')
      bg.addColorStop(1, '#050816')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)

      // === Header ===
      ctx.fillStyle = '#e8f4ff'
      ctx.font = '700 32px "Segoe UI", system-ui'
      ctx.textBaseline = 'top'
      ctx.fillText('Analytics Dashboard', 28, 24)
      ctx.fillStyle = 'rgba(140,180,220,0.55)'
      ctx.font = '14px "Segoe UI"'
      ctx.fillText('Métricas en tiempo real · últimos 7 días', 28, 62)
      // Indicador LIVE
      ctx.fillStyle = '#00ff88'
      ctx.beginPath()
      ctx.arc(size - 56, 36, 5 + Math.sin(t2 * 4) * 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(0,255,136,0.95)'
      ctx.font = '700 12px "Segoe UI"'
      ctx.fillText('LIVE', size - 44, 30)
      // Reloj
      const d = new Date()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      const ss = String(d.getSeconds()).padStart(2, '0')
      ctx.fillStyle = 'rgba(140,180,220,0.65)'
      ctx.font = '600 13px "Consolas", monospace'
      ctx.fillText(`${hh}:${mm}:${ss}`, size - 110, 60)

      // Variables locales para closure
      const t = t2

      // === Fila de KPIs (4 tiles) ===
      const kpiY = 110
      const kpiH = 130
      const kpiGap = 14
      const kpiW = (size - 56 - kpiGap * 3) / 4
      // KPI inline para acceder a t
      function _drawKPI(x, y, w, h, label, value, delta, color) {
        panel(x, y, w, h)
        ctx.fillStyle = 'rgba(140,180,220,0.65)'
        ctx.font = '600 12px "Segoe UI"'
        ctx.textBaseline = 'top'
        ctx.fillText(label.toUpperCase(), x + 14, y + 12)
        ctx.fillStyle = '#e8f4ff'
        ctx.font = '700 32px "Segoe UI"'
        ctx.fillText(value, x + 14, y + 34)
        ctx.fillStyle = delta >= 0 ? 'rgba(0,255,150,0.95)' : 'rgba(255,90,90,0.95)'
        ctx.font = '600 12px "Segoe UI"'
        const arrow = delta >= 0 ? '▲' : '▼'
        ctx.fillText(`${arrow} ${Math.abs(delta).toFixed(1)}%`, x + 14, y + 74)
        ctx.fillStyle = 'rgba(140,180,220,0.5)'
        ctx.font = '10px "Segoe UI"'
        ctx.fillText('vs semana anterior', x + 14, y + 93)
        // sparkline
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i < 30; i++) {
          const px = x + 14 + (i / 29) * (w - 28)
          const py = y + h - 14 - (Math.sin(t * 1.2 + i * 0.4 + label.charCodeAt(0)) + 1) / 2 * 16
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.stroke()
      }
      const usersVal = 12480 + Math.floor(Math.sin(t * 0.5) * 320)
      const revVal = '$' + (48230 + Math.floor(Math.sin(t * 0.4) * 1200)).toLocaleString('es-AR')
      const ordersVal = 1247 + Math.floor(Math.sin(t * 0.6) * 40)
      const convVal = (3.8 + Math.sin(t * 0.7) * 0.4).toFixed(1) + '%'
      _drawKPI(28, kpiY, kpiW, kpiH, 'Usuarios', usersVal.toLocaleString('es-AR'), 12.4, 'rgba(0,200,255,0.9)')
      _drawKPI(28 + (kpiW + kpiGap), kpiY, kpiW, kpiH, 'Ingresos', revVal, 8.7, 'rgba(0,255,150,0.9)')
      _drawKPI(28 + (kpiW + kpiGap) * 2, kpiY, kpiW, kpiH, 'Órdenes', ordersVal.toLocaleString('es-AR'), -2.3, 'rgba(255,180,80,0.9)')
      _drawKPI(28 + (kpiW + kpiGap) * 3, kpiY, kpiW, kpiH, 'Conversión', convVal, 5.1, 'rgba(255,100,200,0.9)')

      // === Fila central: gráfico de línea grande ===
      const lineY = kpiY + kpiH + 18
      const lineH = 360
      drawLineChart(28, lineY, size - 56, lineH, 'Tendencia de ingresos · 7 días', t)

      // === Fila inferior: bar chart + donut ===
      const botY = lineY + lineH + 18
      const botH = size - botY - 28
      const barW = (size - 56 - kpiGap) * 0.62
      const donutW = (size - 56 - kpiGap) * 0.38
      drawBarChart(28, botY, barW, botH, 'Ventas mensuales', t)
      drawDonut(28 + barW + kpiGap, botY, donutW, botH, 'Rendimiento', 68 + Math.sin(t * 0.5) * 8)

      texture.needsUpdate = true
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    animRef.current = { rafId, texture }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (animRef.current && animRef.current.texture) animRef.current.texture.dispose()
    }
  }, [animatedScreen, object])

  return <primitive object={object} rotation={rotation} />
}
