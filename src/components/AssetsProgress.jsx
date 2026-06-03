import { useProgress } from '@react-three/drei'
import { useEffect } from 'react'

/**
 * Componente invisible que reporta el progreso de carga de assets 3D al exterior.
 * Se monta dentro del Canvas y usa useProgress de drei.
 */
export default function AssetsProgress({ onProgress, onReady }) {
  const { progress, loaded, total, active } = useProgress()

  useEffect(() => {
    if (onProgress) onProgress(progress)
  }, [progress, onProgress])

  useEffect(() => {
    // Listo cuando: progreso 100 + no hay activos + se cargó al menos algo
    if (progress >= 100 && !active && loaded > 0) {
      if (onReady) onReady()
    }
  }, [progress, active, loaded, onReady])

  return null
}
