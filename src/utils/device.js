/**
 * Detecta el tipo de dispositivo para ajustar calidad y features
 */

export function isMobile() {
  if (typeof window === 'undefined') return false
  // Touch + ancho de pantalla chico
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const smallScreen = window.innerWidth < 900
  return hasTouch && smallScreen
}

export function isLowEnd() {
  if (typeof window === 'undefined') return false
  // Heurística: pocos cores o memoria escasa
  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory || 4
  return cores <= 4 && memory <= 4
}

export function deviceQuality() {
  if (isMobile() || isLowEnd()) return 'low'
  return 'high'
}
