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

export default function LoadingIntro({ onFinish, assetProgress = 0, assetsReady = false }) {
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

    // Animar la progress bar combinando tiempo + progreso real de assets
    const progressInterval = setInterval(() => {
      const elapsed = performance.now() - startTime.current
      const timeProgress = Math.min(100, (elapsed / MIN_DURATION) * 100)
      // El progreso visible es el MENOR entre tiempo y assets reales
      // (para que no diga 100% si los assets aún no cargaron)
      setProgress(timeProgress)
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

  // Click para saltar
  const handleClick = () => {
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

        {/* Progress bar — muestra el progreso real combinado de tiempo + assets */}
        <div className="intro-progress-wrap">
          <div className="intro-progress-label">
            <span>LOADING ASSETS</span>
            <span>
              {assetsReady ? '100' : Math.floor(Math.min(progress, assetProgress || progress))}%
            </span>
          </div>
          <div className="intro-progress-bar">
            <div
              className="intro-progress-fill"
              style={{
                width: `${assetsReady ? 100 : Math.min(progress, Math.max(assetProgress, progress * 0.6))}%`,
              }}
            />
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
