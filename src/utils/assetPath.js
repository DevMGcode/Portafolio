/**
 * Prefixea una ruta de asset estático con el BASE_URL de Vite.
 * En dev → '/models/foo.glb'
 * En prod (GH Pages) → '/Portafolio/models/foo.glb'
 */
export function assetPath(path) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const clean = path.startsWith('/') ? path : `/${path}`
  return base + clean
}
