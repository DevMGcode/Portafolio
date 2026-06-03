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

const TOTAL_DURATION = 4800           // ms hasta el fade out
const FADE_DURATION = 800              // ms del fade out

export default function LoadingIntro({ onFinish }) {
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

    // Animar la progress bar (0 a 100% durante toda la intro)
    const progressInterval = setInterval(() => {
      const elapsed = performance.now() - startTime.current
      const p = Math.min(100, (elapsed / (TOTAL_DURATION - 200)) * 100)
      setProgress(p)
    }, 30)

    // Iniciar fade out
    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, TOTAL_DURATION)

    // Llamar a onFinish después del fade
    const finishTimer = setTimeout(() => {
      onFinishRef.current?.()
    }, TOTAL_DURATION + FADE_DURATION)

    return () => {
      lineTimers.forEach(clearTimeout)
      clearInterval(progressInterval)
      clearTimeout(fadeTimer)
      clearTimeout(finishTimer)
    }
  }, [])    // ← deps vacías: solo se ejecuta UNA vez al montar

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

        {/* Progress bar */}
        <div className="intro-progress-wrap">
          <div className="intro-progress-label">
            <span>LOADING</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="intro-progress-bar">
            <div className="intro-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Skip hint */}
        <div className="intro-skip">click anywhere to skip</div>
      </div>
    </div>
  )
}
