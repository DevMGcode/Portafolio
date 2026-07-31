import { useEffect } from 'react'

/**
 * Señal de "escena lista". Se coloca DENTRO del <Suspense> como hermano de la
 * escena: mientras cualquier modelo esté cargando, el Suspense muestra su
 * fallback y este componente NO se monta. Cuando todo terminó de cargar, el
 * subárbol se monta y disparamos onReady exactamente una vez.
 *
 * Antes esto usaba useProgress() de drei, pero al re-renderizarse durante el
 * render de los <Model> generaba el warning "setState while rendering another
 * component". Montarse tras el Suspense es más simple y 100% confiable.
 */
export default function AssetsProgress({ onReady }) {
  useEffect(() => {
    onReady?.()
  }, [onReady])

  return null
}
