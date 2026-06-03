import { useEffect, useMemo, useRef } from 'react'
import { TransformControls } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Live Metrics Dashboard como objeto INDEPENDIENTE.
 * Tiene su propia posición, rotación, escala — no depende del monitor.
 * Renderiza un plane con textura animada (canvas).
 */
export default function EditableDashboard({
  name,
  position,
  rotation,
  size = 1.4,                  // ancho del plane en world units
  editMode,
  selected,
  gizmoMode,
  onSelect,
  onUpdate,
}) {
  const groupRef = useRef()
  const meshRef = useRef()

  // Canvas + textura compartidos (memo)
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 1024
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return { canvas: c, texture: tex }
  }, [])

  // Vista activa (alterna entre analytics y workflow cada 10 segundos)
  const viewRef = useRef('analytics')
  const viewStartRef = useRef(performance.now())

  useEffect(() => {
    const interval = setInterval(() => {
      viewRef.current = viewRef.current === 'analytics' ? 'workflow' : 'analytics'
      viewStartRef.current = performance.now()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Animación del dashboard (RAF)
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    const SIZE = 1024
    let start = performance.now()
    let rafId = null

    function panel(x, y, w, h, label) {
      ctx.fillStyle = 'rgba(15,25,45,0.95)'
      ctx.fillRect(x, y, w, h)
      ctx.strokeStyle = 'rgba(80,140,200,0.25)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
      ctx.fillStyle = 'rgba(0,200,255,0.4)'
      ctx.fillRect(x, y, w, 2)
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
      ctx.strokeStyle = 'rgba(80,140,200,0.1)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const gy = cy + (i / 4) * ch
        ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx + cw, gy); ctx.stroke()
        ctx.fillStyle = 'rgba(140,180,220,0.5)'
        ctx.font = '11px "Segoe UI"'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'right'
        ctx.fillText(`${100 - i * 25}k`, cx - 8, gy)
      }
      ctx.textAlign = 'left'
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
      ctx.lineWidth = 16
      ctx.strokeStyle = 'rgba(80,140,200,0.15)'
      ctx.beginPath()
      ctx.arc(cxC, cyC, r, 0, Math.PI * 2)
      ctx.stroke()
      const start2 = -Math.PI / 2
      const end = start2 + (percent / 100) * Math.PI * 2
      const grad = ctx.createLinearGradient(cxC - r, cyC, cxC + r, cyC)
      grad.addColorStop(0, '#00ddff')
      grad.addColorStop(1, '#ff66cc')
      ctx.strokeStyle = grad
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(cxC, cyC, r, start2, end)
      ctx.stroke()
      ctx.lineCap = 'butt'
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

    // === TABS arriba (Analytics / Workflow) ===
    function drawTabs(t) {
      const tabs = [
        { id: 'analytics', label: 'ANALYTICS', icon: '◈' },
        { id: 'workflow',  label: 'WORKFLOW',  icon: '⚙' },
      ]
      const active = viewRef.current
      const tabW = 145
      const tabH = 32
      const startX = 28
      const y = 76
      tabs.forEach((tab, i) => {
        const x = startX + i * (tabW + 8)
        const isActive = active === tab.id
        // Tab background
        ctx.fillStyle = isActive ? 'rgba(0,200,255,0.18)' : 'rgba(15,25,45,0.6)'
        ctx.fillRect(x, y, tabW, tabH)
        // Borde inferior
        ctx.fillStyle = isActive ? '#00ddff' : 'rgba(80,140,200,0.2)'
        ctx.fillRect(x, y + tabH - 2, tabW, 2)
        // Label
        ctx.fillStyle = isActive ? '#e8f4ff' : 'rgba(140,180,220,0.65)'
        ctx.font = isActive ? '700 13px "Segoe UI"' : '600 13px "Segoe UI"'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        ctx.fillText(`${tab.icon}  ${tab.label}`, x + 14, y + tabH / 2)
        ctx.textBaseline = 'top'
      })
      // Indicador de auto-rotación
      const elapsed = (performance.now() - viewStartRef.current) / 1000
      const progress = Math.min(elapsed / 10, 1)
      ctx.fillStyle = 'rgba(140,180,220,0.4)'
      ctx.font = '10px "Consolas", monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`auto-rotate · ${Math.ceil(10 - elapsed)}s`, SIZE - 28, y + tabH / 2 + 4)
      // Mini barra de progreso
      ctx.fillStyle = 'rgba(80,140,200,0.2)'
      ctx.fillRect(SIZE - 158, y + tabH - 2, 130, 2)
      ctx.fillStyle = active === 'analytics' ? '#00ddff' : '#ff66cc'
      ctx.fillRect(SIZE - 158, y + tabH - 2, 130 * progress, 2)
      ctx.textAlign = 'left'
    }

    function drawAnalytics(t) {
      ctx.fillStyle = '#e8f4ff'
      ctx.font = '700 32px "Segoe UI", system-ui'
      ctx.textBaseline = 'top'
      ctx.fillText('Analytics Dashboard', 28, 24)
      ctx.fillStyle = 'rgba(140,180,220,0.55)'
      ctx.font = '14px "Segoe UI"'
      ctx.fillText('Métricas en tiempo real · últimos 7 días', 28, 50)
      // LIVE indicator
      ctx.fillStyle = '#00ff88'
      ctx.beginPath()
      ctx.arc(SIZE - 56, 36, 5 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(0,255,136,0.95)'
      ctx.font = '700 12px "Segoe UI"'
      ctx.fillText('LIVE', SIZE - 44, 30)
      // Clock
      const d = new Date()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      const ss = String(d.getSeconds()).padStart(2, '0')
      ctx.fillStyle = 'rgba(140,180,220,0.65)'
      ctx.font = '600 13px "Consolas", monospace'
      ctx.fillText(`${hh}:${mm}:${ss}`, SIZE - 110, 56)

      drawTabs(t)

      // KPIs
      const kpiY = 140, kpiH = 120, kpiGap = 14
      const kpiW = (SIZE - 56 - kpiGap * 3) / 4
      function _drawKPI(x, y, w, h, label, value, delta, color) {
        panel(x, y, w, h)
        ctx.fillStyle = 'rgba(140,180,220,0.65)'
        ctx.font = '600 12px "Segoe UI"'
        ctx.textBaseline = 'top'
        ctx.fillText(label.toUpperCase(), x + 14, y + 12)
        ctx.fillStyle = '#e8f4ff'
        ctx.font = '700 30px "Segoe UI"'
        ctx.fillText(value, x + 14, y + 32)
        ctx.fillStyle = delta >= 0 ? 'rgba(0,255,150,0.95)' : 'rgba(255,90,90,0.95)'
        ctx.font = '600 12px "Segoe UI"'
        const arrow = delta >= 0 ? '▲' : '▼'
        ctx.fillText(`${arrow} ${Math.abs(delta).toFixed(1)}%`, x + 14, y + 70)
        ctx.fillStyle = 'rgba(140,180,220,0.5)'
        ctx.font = '10px "Segoe UI"'
        ctx.fillText('vs semana anterior', x + 14, y + 88)
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

      const lineY = kpiY + kpiH + 18
      const lineH = 350
      drawLineChart(28, lineY, SIZE - 56, lineH, 'Tendencia de ingresos · 7 días', t)

      const botY = lineY + lineH + 18
      const botH = SIZE - botY - 28
      const barW = (SIZE - 56 - kpiGap) * 0.62
      const donutW = (SIZE - 56 - kpiGap) * 0.38
      drawBarChart(28, botY, barW, botH, 'Ventas mensuales', t)
      drawDonut(28 + barW + kpiGap, botY, donutW, botH, 'Rendimiento', 68 + Math.sin(t * 0.5) * 8)
    }

    // ============================================================
    //   VISTA WORKFLOW — flujo de trabajo + metodologías
    // ============================================================
    function drawWorkflow(t) {
      ctx.fillStyle = '#e8f4ff'
      ctx.font = '700 32px "Segoe UI", system-ui'
      ctx.textBaseline = 'top'
      ctx.fillText('Workflow & Methodology', 28, 24)
      ctx.fillStyle = 'rgba(140,180,220,0.55)'
      ctx.font = '14px "Segoe UI"'
      ctx.fillText('Mi proceso de trabajo · Agile + Git Flow + UX First', 28, 50)
      // LIVE indicator (mismo estilo)
      ctx.fillStyle = '#ff66cc'
      ctx.beginPath()
      ctx.arc(SIZE - 64, 36, 5 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,102,204,0.95)'
      ctx.font = '700 12px "Segoe UI"'
      ctx.fillText('ACTIVE', SIZE - 54, 30)
      // Sprint
      ctx.fillStyle = 'rgba(140,180,220,0.65)'
      ctx.font = '600 13px "Consolas", monospace'
      ctx.fillText('SPRINT 24', SIZE - 110, 56)

      drawTabs(t)

      // ── PROCESS FLOW (5 pasos conectados) ──
      const flowY = 152
      const flowH = 140
      panel(28, flowY, SIZE - 56, flowH, 'Process Flow · 5 fases iterativas')
      const steps = [
        { label: 'Planning',  icon: '◴', color: '#00ddff' },
        { label: 'Design',    icon: '◑', color: '#ff66cc' },
        { label: 'Develop',   icon: '◐', color: '#00ff88' },
        { label: 'Test',      icon: '◓', color: '#ffaa00' },
        { label: 'Deploy',    icon: '◉', color: '#a78bfa' },
      ]
      const sx = 60
      const sy = flowY + 65
      const stepGap = (SIZE - 130) / (steps.length - 1)
      const activeStep = Math.floor((t * 0.6) % steps.length)
      steps.forEach((step, i) => {
        const cx = sx + i * stepGap
        // Línea de conexión
        if (i < steps.length - 1) {
          const grad = ctx.createLinearGradient(cx, sy, cx + stepGap, sy)
          grad.addColorStop(0, step.color)
          grad.addColorStop(1, steps[i + 1].color)
          ctx.strokeStyle = grad
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(cx + 30, sy)
          ctx.lineTo(cx + stepGap - 30, sy)
          ctx.stroke()
        }
        // Círculo nodo
        const isActive = i === activeStep
        const r = isActive ? 28 + Math.sin(t * 4) * 2 : 24
        ctx.fillStyle = isActive ? step.color : 'rgba(20,30,55,0.95)'
        ctx.strokeStyle = step.color
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(cx, sy, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        // Icono
        ctx.fillStyle = isActive ? '#0a1024' : step.color
        ctx.font = 'bold 22px "Segoe UI"'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(step.icon, cx, sy)
        // Label
        ctx.fillStyle = isActive ? step.color : '#e8f4ff'
        ctx.font = isActive ? '700 13px "Segoe UI"' : '600 12px "Segoe UI"'
        ctx.textBaseline = 'top'
        ctx.fillText(step.label, cx, sy + 38)
      })
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      // ── METODOLOGÍAS (4 cards) ──
      const methY = flowY + flowH + 18
      const methH = 180
      const methods = [
        { title: 'SCRUM / AGILE',   desc: 'Sprints de 2 semanas · Daily standups · Retros',     color: '#00ddff', icon: '◈' },
        { title: 'GIT FLOW',         desc: 'Feature branches · PRs revisadas · Conventional commits', color: '#ff66cc', icon: '⌥' },
        { title: 'TDD / UNIT TESTS', desc: 'Test first · Cobertura > 80% · CI/CD pipeline',     color: '#00ff88', icon: '✓' },
        { title: 'ATOMIC DESIGN',    desc: 'Componentes reutilizables · Design system propio',   color: '#a78bfa', icon: '⬡' },
      ]
      const methGap = 14
      const methW = (SIZE - 56 - methGap * 3) / 4
      methods.forEach((m, i) => {
        const mx = 28 + i * (methW + methGap)
        panel(mx, methY, methW, methH)
        // Banda de color superior
        ctx.fillStyle = m.color
        ctx.fillRect(mx, methY, methW, 3)
        // Icono grande
        ctx.fillStyle = m.color
        ctx.font = 'bold 38px "Segoe UI"'
        ctx.textAlign = 'center'
        ctx.fillText(m.icon, mx + methW / 2, methY + 18)
        ctx.textAlign = 'left'
        // Título
        ctx.fillStyle = '#e8f4ff'
        ctx.font = '700 14px "Segoe UI"'
        ctx.fillText(m.title, mx + 14, methY + 80)
        // Descripción
        ctx.fillStyle = 'rgba(140,180,220,0.7)'
        ctx.font = '11px "Segoe UI"'
        const words = m.desc.split(' ')
        let line = ''
        let lineY = methY + 105
        words.forEach((word) => {
          const test = line + word + ' '
          if (ctx.measureText(test).width > methW - 24) {
            ctx.fillText(line, mx + 14, lineY)
            line = word + ' '
            lineY += 15
          } else {
            line = test
          }
        })
        if (line) ctx.fillText(line, mx + 14, lineY)
      })

      // ── TOOLS row ──
      const toolY = methY + methH + 18
      const toolH = SIZE - toolY - 28
      panel(28, toolY, SIZE - 56, toolH, 'Tools · Stack diario de desarrollo')
      const tools = [
        { name: 'VS Code',  color: '#007acc', icon: '◧' },
        { name: 'Figma',    color: '#a259ff', icon: '◇' },
        { name: 'Git',      color: '#f05032', icon: '⌥' },
        { name: 'GitHub',   color: '#e8f4ff', icon: '◐' },
        { name: 'Postman',  color: '#ff6c37', icon: '▣' },
        { name: 'Jira',     color: '#2684ff', icon: '◫' },
        { name: 'Notion',   color: '#cccccc', icon: '◰' },
        { name: 'Docker',   color: '#0db7ed', icon: '▤' },
      ]
      const toolGap = 12
      const toolW = (SIZE - 56 - 28 - toolGap * (tools.length - 1)) / tools.length
      tools.forEach((tool, i) => {
        const tx = 42 + i * (toolW + toolGap)
        const ty = toolY + 50
        const th = toolH - 60
        // Card
        ctx.fillStyle = 'rgba(15,25,45,0.6)'
        ctx.fillRect(tx, ty, toolW, th)
        ctx.strokeStyle = tool.color + '60'
        ctx.lineWidth = 1
        ctx.strokeRect(tx + 0.5, ty + 0.5, toolW - 1, th - 1)
        // Icono
        ctx.fillStyle = tool.color
        ctx.font = 'bold 28px "Segoe UI"'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(tool.icon, tx + toolW / 2, ty + th / 2 - 8)
        // Nombre
        ctx.fillStyle = '#e8f4ff'
        ctx.font = '600 11px "Segoe UI"'
        ctx.textBaseline = 'top'
        ctx.fillText(tool.name, tx + toolW / 2, ty + th - 22)
      })
      ctx.textAlign = 'left'
    }

    function draw(now) {
      const t = (now - start) / 1000
      const bg = ctx.createLinearGradient(0, 0, 0, SIZE)
      bg.addColorStop(0, '#0a1024')
      bg.addColorStop(1, '#050816')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, SIZE, SIZE)

      // Dibuja según vista activa
      if (viewRef.current === 'workflow') {
        drawWorkflow(t)
      } else {
        drawAnalytics(t)
      }

      texture.needsUpdate = true
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [canvas, texture])

  // Aplicar posición/rotación del layout
  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(...position)
    groupRef.current.rotation.set(...(rotation || [0, 0, 0]))
    groupRef.current.scale.set(1, 1, 1)
  }, [position[0], position[1], position[2], rotation?.[0], rotation?.[1], rotation?.[2]])

  const handleChange = () => {
    if (!groupRef.current) return
    const g = groupRef.current
    if (gizmoMode === 'translate') {
      onUpdate(name, {
        pos: [
          parseFloat(g.position.x.toFixed(2)),
          parseFloat(g.position.y.toFixed(2)),
          parseFloat(g.position.z.toFixed(2)),
        ],
      })
    } else if (gizmoMode === 'scale') {
      const avgScale = (g.scale.x + g.scale.y + g.scale.z) / 3
      const newSize = parseFloat((size * avgScale).toFixed(2))
      onUpdate(name, { size: newSize })
      g.scale.set(1, 1, 1)
    } else if (gizmoMode === 'rotate') {
      onUpdate(name, {
        rot: [
          parseFloat(g.rotation.x.toFixed(3)),
          parseFloat(g.rotation.y.toFixed(3)),
          parseFloat(g.rotation.z.toFixed(3)),
        ],
      })
    }
  }

  // Proporción 16:9
  const planeW = size
  const planeH = size * 0.56

  // Geometría CURVA tipo monitor ultrawide
  // curveAmount = mitad del ángulo total que abarca la curva (radianes)
  // 0 = plano, 0.35 ≈ 40° total (curva pronunciada estilo ultrawide)
  const curveAmount = 0.28
  const curvedGeo = useMemo(() => {
    const segs = 48
    const radius = planeW / (2 * Math.sin(curveAmount))
    const positions = []
    const uvs = []
    const indices = []
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      const angle = (t - 0.5) * curveAmount * 2
      const x = radius * Math.sin(angle)
      const z = radius * (1 - Math.cos(angle))      // edges bulgan hacia el viewer (+z)
      for (let j = 0; j <= 1; j++) {
        const y = (j - 0.5) * planeH
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
  }, [planeW, planeH, curveAmount])

  return (
    <>
      <group
        ref={groupRef}
        onClick={(e) => {
          if (editMode) {
            e.stopPropagation()
            onSelect(name)
          }
        }}
      >
        <mesh ref={meshRef} geometry={curvedGeo}>
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-30}
          />
        </mesh>
      </group>

      {editMode && selected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={gizmoMode}
          size={0.8}
          onObjectChange={handleChange}
        />
      )}
    </>
  )
}
