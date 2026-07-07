import { useEffect, useState } from 'react'
import { TOUR_SHOTS } from './CameraKeyboardControls'

/**
 * Overlay tipo Netflix/documental que muestra el título de cada escena del recorrido.
 * Aparece con animación slide-in y fade-out al cambiar de escena.
 */
export default function SceneLabel({ tourIndex, active }) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [displayIndex, setDisplayIndex] = useState(0)

  // Cuando cambia el tourIndex o active, animar el cambio
  useEffect(() => {
    if (!active) {
      setVisible(false)
      setFading(false)
      return
    }
    // Mostrar nuevo
    setDisplayIndex(tourIndex)
    setFading(false)
    setVisible(true)

    // Auto-fade después de 4 segundos
    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, 4000)
    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, 4500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [tourIndex, active])

  if (!visible || !active) return null

  const point = TOUR_SHOTS[displayIndex]
  if (!point || !point.label) return null

  const total = TOUR_SHOTS.length

  return (
    <div className={`scene-label ${fading ? 'scene-fading' : ''}`}>
      <div className="scene-counter">
        {String(displayIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
      <div className="scene-label-title">{point.label}</div>
      <div className="scene-label-deco" />
    </div>
  )
}
