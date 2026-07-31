import { useEffect, useState, useRef } from 'react'

/**
 * Loading screen intro cyberpunk:
 *  - Typewriter terminal effect
 *  - Scanlines + glitch
 *  - Progress bar
 *  - Fade out al final
 *  - Auto-dismiss después de la secuencia (o al click)
 */

const LINES = [
  { text: '> INITIALIZING DEVOFFICE_3D...', delay: 0 },
  { text: '> LOADING ASSETS...', delay: 800 },
  { text: '> RENDERING ENVIRONMENT...', delay: 1500 },
  { text: '> CONNECTING NEURAL LINK...', delay: 2300 },
  { text: '> SYSTEM READY.', delay: 3100, color: '#00ff88' },
  { text: '> WELCOME, VISITOR.', delay: 3700, color: '#ff44aa' },
]

const MIN_DURATION = 4200             // intro mínimo de 4.2s (para que se aprecie)
const FADE_DURATION = 800              // ms del fade out

export default function LoadingIntro({ onFinish, assetsReady = false }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const startTime = useRef(performance.now())
  // Ref para onFinish — así el useEffect no se re-ejecuta si cambia la referencia
  const onFinishRef = useRef(onFinish)
  useEffect(() => { onFinishRef.current = onFinish }, [onFinish])

  useEffect(() => {
    // Reset (por si hubo doble mount de StrictMode)
    setVisibleLines([])
    startTime.current = performance.now()

    // Programar la aparición de cada línea
    const lineTimers = LINES.map((line, i) =>
      setTimeout(() => {
        setVisibleLines((prev) => {
          // Evitar duplicados (si ya está el idx, no agregar)
          if (prev.some((p) => p.idx === i)) return prev
          return [...prev, { ...line, idx: i }]
        })
      }, line.delay),
    )

    // Piso de tiempo: da movimiento suave a la barra aunque el progreso real
    // tarde en reportar. Tope 85% → nunca "miente" diciendo 100% antes de que
    // los assets estén realmente listos (eso solo pasa con assetsReady).
    const progressInterval = setInterval(() => {
      const elapsed = performance.now() - startTime.current
      const timeFloor = Math.min(85, (elapsed / MIN_DURATION) * 85)
      setProgress(timeFloor)
    }, 30)

    return () => {
      lineTimers.forEach(clearTimeout)
      clearInterval(progressInterval)
    }
  }, [])    // ← deps vacías: solo se ejecuta UNA vez al montar

  // Dismiss la intro cuando: tiempo mínimo cumplido + assets cargados
  useEffect(() => {
    const elapsed = performance.now() - startTime.current
    const timeOk = elapsed >= MIN_DURATION
    if (timeOk && assetsReady && !fading) {
      setFading(true)
      setTimeout(() => onFinishRef.current?.(), FADE_DURATION)
    } else if (!timeOk && assetsReady) {
      // Si los assets ya están pero falta tiempo, programar el dismiss
      const remaining = MIN_DURATION - elapsed
      const t = setTimeout(() => {
        setFading(true)
        setTimeout(() => onFinishRef.current?.(), FADE_DURATION)
      }, remaining)
      return () => clearTimeout(t)
    }
  }, [assetsReady, fading])

  // Porcentaje mostrado: piso de tiempo suave, topado a 99% hasta que la escena
  // esté realmente lista (assetsReady) → ahí salta a 100 y la barra llega al final.
  const displayPct = assetsReady ? 100 : Math.min(99, Math.round(progress))

  // Click para saltar — SOLO cuando los assets ya cargaron. Si no, saltar
  // dejaría la escena a medio cargar y se vería todo negro.
  const handleClick = () => {
    if (!assetsReady || fading) return
    setFading(true)
    setTimeout(() => onFinish?.(), FADE_DURATION)
  }

  return (
    <div
      className={`intro-overlay ${fading ? 'intro-fading' : ''}`}
      onClick={handleClick}
      role="dialog"
      aria-label="Loading DevOffice 3D"
    >
      {/* Scanlines */}
      <div className="intro-scanlines" />

      {/* Glitch background */}
      <div className="intro-glitch" />

      {/* CRT vignette */}
      <div className="intro-vignette" />

      <div className="intro-content">
        {/* Logo / título */}
        <div className="intro-logo">
          <span className="intro-logo-bracket">[</span>
          <span className="intro-logo-text">DEVOFFICE_3D</span>
          <span className="intro-logo-bracket">]</span>
        </div>
        <div className="intro-subtitle">MELISSA GARCÍA · DevMGcode</div>

        {/* Líneas terminal */}
        <div className="intro-terminal">
          {visibleLines.map((line, i) => (
            <div
              key={i}
              className="intro-line"
              style={{ color: line.color || '#00ddff' }}
            >
              {line.text}
              {i === visibleLines.length - 1 && <span className="intro-cursor">█</span>}
            </div>
          ))}
        </div>

        {/* Progress bar — porcentaje honesto: el mayor entre el progreso real
            de assets y el piso de tiempo, topado a 99% hasta que TODO esté
            listo (assetsReady). Así la barra siempre llega al final. */}
        <div className="intro-progress-wrap">
          <div className="intro-progress-label">
            <span>LOADING ASSETS</span>
            <span>{displayPct}%</span>
          </div>
          <div className="intro-progress-bar">
            <div className="intro-progress-fill" style={{ width: `${displayPct}%` }} />
          </div>
        </div>

        {/* Skip hint */}
        <div className="intro-skip">
          {assetsReady ? 'click anywhere to skip' : 'preparando experiencia 3D...'}
        </div>
      </div>
    </div>
  )
}
