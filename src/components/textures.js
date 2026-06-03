import * as THREE from 'three'

/**
 * Genera una textura procedural para las paredes:
 * paneles tech grandes con seams (separaciones) y tornillos. ALTO CONTRASTE.
 */
export function makeWallTexture() {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Base azul-grisácea industrial (más clara para ser visible en luz baja)
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, '#2a3858')
  bg.addColorStop(0.5, '#1f2a48')
  bg.addColorStop(1, '#161e36')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // Noise / granulado metálico
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const alpha = Math.random() * 0.25
    const tone = Math.random() > 0.5 ? 255 : 50
    ctx.fillStyle = `rgba(${tone},${tone},${tone},${alpha})`
    ctx.fillRect(x, y, 1, 1)
  }

  // Paneles 4×4 con seams MUY visibles
  const cols = 4
  const rows = 4
  const panelW = size / cols
  const panelH = size / rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * panelW
      const y = r * panelH

      // Seam exterior (separación oscura)
      ctx.strokeStyle = 'rgba(0,0,0,0.7)'
      ctx.lineWidth = 4
      ctx.strokeRect(x + 2, y + 2, panelW - 4, panelH - 4)

      // Borde luminoso interno cyan tenue
      ctx.strokeStyle = 'rgba(0,200,255,0.35)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 8, y + 8, panelW - 16, panelH - 16)

      // Línea interna magenta sutil
      ctx.strokeStyle = 'rgba(255,80,200,0.12)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 18, y + 18, panelW - 36, panelH - 36)

      // Tornillos en las 4 esquinas (más grandes y visibles)
      const screws = [
        [x + 22, y + 22],
        [x + panelW - 22, y + 22],
        [x + 22, y + panelH - 22],
        [x + panelW - 22, y + panelH - 22],
      ]
      screws.forEach(([sx, sy]) => {
        // Halo
        ctx.fillStyle = 'rgba(0,100,150,0.4)'
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fill()
        // Tornillo metal
        ctx.fillStyle = 'rgba(200,220,240,0.7)'
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill()
        // Centro oscuro
        ctx.fillStyle = 'rgba(20,30,50,0.9)'
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill()
        // Reflejo
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.beginPath(); ctx.arc(sx - 1, sy - 1, 0.8, 0, Math.PI * 2); ctx.fill()
      })

      // Etiqueta serial visible en algunos paneles
      if ((r + c) % 3 === 0) {
        ctx.fillStyle = 'rgba(0,255,255,0.55)'
        ctx.font = 'bold 13px Consolas, monospace'
        const serial = `SEC-${r}${c}-${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`
        ctx.fillText(serial, x + 30, y + panelH - 28)
      }

      // Circuito decorativo visible
      if ((r + c) % 4 === 1) {
        ctx.strokeStyle = 'rgba(0,220,255,0.5)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(x + 40, y + 50)
        ctx.lineTo(x + 40, y + 80)
        ctx.lineTo(x + 80, y + 80)
        ctx.stroke()
        // Punto al final
        ctx.fillStyle = 'rgba(0,255,255,0.9)'
        ctx.beginPath(); ctx.arc(x + 80, y + 80, 3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(0,255,255,0.4)'
        ctx.beginPath(); ctx.arc(x + 80, y + 80, 6, 0, Math.PI * 2); ctx.fill()
      }

      // Cuadrante con barras LED
      if ((r + c) % 5 === 2) {
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = i < 3 ? 'rgba(0,255,180,0.55)' : 'rgba(255,80,180,0.55)'
          ctx.fillRect(x + 40 + i * 10, y + panelH - 50, 6, 22)
        }
      }
    }
  }

  // Líneas scan horizontales más marcadas
  for (let y = 0; y < size; y += 4) {
    ctx.fillStyle = 'rgba(0,30,60,0.12)'
    ctx.fillRect(0, y, size, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 1)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Genera una textura procedural para el piso:
 * patrón hexagonal tech con líneas visibles. NO reflectivo.
 */
export function makeFloorTexture() {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Base oscura industrial
  const bg = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  bg.addColorStop(0, '#162342')
  bg.addColorStop(1, '#0a1024')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // Grid base sutil
  ctx.strokeStyle = 'rgba(80,140,200,0.18)'
  ctx.lineWidth = 1
  for (let i = 0; i < size; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke()
  }

  // Hexágonos tech BIEN visibles
  const hexSize = 70
  const hexW = hexSize * 2
  const hexH = hexSize * Math.sqrt(3)
  for (let row = -1; row < size / hexH + 2; row++) {
    for (let col = -1; col < size / (hexW * 0.75) + 2; col++) {
      const x = col * hexW * 0.75
      const y = row * hexH + (col % 2) * (hexH / 2)
      drawHex(ctx, x, y, hexSize - 6, 'rgba(0,180,230,0.3)', 1.5)
      // Sombra interior tenue
      drawHex(ctx, x, y, hexSize - 14, 'rgba(0,100,180,0.12)', 1)
    }
  }

  // Algunos hexágonos resaltados (centros iluminados)
  for (let i = 0; i < 25; i++) {
    const col = Math.floor(Math.random() * (size / (hexW * 0.75)))
    const row = Math.floor(Math.random() * (size / hexH))
    const x = col * hexW * 0.75
    const y = row * hexH + (col % 2) * (hexH / 2)
    // Borde brillante
    drawHex(ctx, x, y, hexSize - 6, 'rgba(0,255,255,0.7)', 2)
    // Glow interior
    const grad = ctx.createRadialGradient(x, y, 0, x, y, hexSize - 6)
    grad.addColorStop(0, 'rgba(0,200,255,0.35)')
    grad.addColorStop(1, 'rgba(0,200,255,0)')
    ctx.fillStyle = grad
    drawHexFill(ctx, x, y, hexSize - 6)
  }

  // Algunos en magenta para contraste
  for (let i = 0; i < 8; i++) {
    const col = Math.floor(Math.random() * (size / (hexW * 0.75)))
    const row = Math.floor(Math.random() * (size / hexH))
    const x = col * hexW * 0.75
    const y = row * hexH + (col % 2) * (hexH / 2)
    drawHex(ctx, x, y, hexSize - 6, 'rgba(255,80,200,0.7)', 2)
  }

  // Ruido granular del piso
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.fillStyle = `rgba(100,150,200,${Math.random() * 0.12})`
    ctx.fillRect(x, y, 1, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 5)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function drawHex(ctx, cx, cy, radius, strokeStyle, lineWidth) {
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
}

function drawHexFill(ctx, cx, cy, radius) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}
