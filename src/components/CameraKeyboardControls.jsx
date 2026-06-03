import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Controles de cámara con teclado tipo videojuego:
 *   WASD       → moverse adelante/atrás/izquierda/derecha (pan)
 *   ↑ ↓        → acercar / alejar (zoom in/out)
 *   ← →        → strafe izquierda / derecha
 *   Q / E      → subir / bajar
 *
 * Funciona junto con OrbitControls (rotación con mouse) y admite vistas guiadas.
 */
const CAMERA_PRESETS = {
  free: null,
  overview: {
    position: [9.5, 7.2, 10.2],
    target: [0, 2, -1],
  },
  desk: {
    position: [4.2, 2.7, 4.8],
    target: [0.4, 1.7, -0.2],
  },
  shelf: {
    // Vista cercana del frente de la repisa — encuadre con trofeo y libros
    position: [1.5, 2.8, -3.5],
    target: [3.36, 2.0, -5.35],
  },
}

// === RECORRIDO NARRATIVO ===
// Cada punto resalta un elemento específico del cuarto.
// hold = segundos viendo ese punto antes de pasar al siguiente
const TOUR_POINTS = [
  // 1. APERTURA — Close-up con CARA visible, ligeramente desde abajo (heroico)
  {
    label: 'Meet Melissa',
    position: [2.5, 2.0, 0.35],
    target: [1.58, 2.15, 1.85],
    hold: 3.2,
  },
  // 2. VISTA GENERAL — Establece el espacio donde vive
  {
    label: 'Welcome to DevOffice 3D',
    position: [7.5, 5.2, 7.5],
    target: [0, 2, -1],
    hold: 2.5,
  },
  // 3. VENTANA CYBERPUNK — El mundo donde vive (atmósfera)
  {
    label: 'Cyberpunk City View',
    position: [3.5, 3.4, 1],
    target: [-2.5, 3.2, -5.8],
    hold: 2.8,
  },
  // 4. ESCRITORIO + MONITOR + DASHBOARD — Su workspace
  {
    label: 'The Workspace',
    position: [2.8, 2.6, 2.2],
    target: [-0.3, 2, -0.3],
    hold: 2.8,
  },
  // 5. LIVE METRICS curvo — Sus skills en datos
  {
    label: 'Live Analytics',
    position: [1.2, 2.6, 1.4],
    target: [-0.77, 2.3, -0.35],
    hold: 2.5,
  },
  // 6. TECH STACK WALL — Tecnologías que maneja
  {
    label: 'Tech Stack',
    position: [2.5, 3.2, 0],
    target: [5.5, 3.0, -1.92],
    hold: 3.2,
  },
  // 7. LETRERO "Melissa García DevMGcode" — Identidad
  {
    label: 'DevMGcode',
    position: [2.5, 4.2, 1],
    target: [5.5, 3.81, -1.85],
    hold: 2.2,
  },
  // 8. REPISA con trofeo + proyectos — Sus logros
  {
    label: 'Achievements',
    position: [1, 3.2, -2.5],
    target: [3.36, 2.5, -5.35],
    hold: 2.8,
  },
  // 9. WALL DISPLAY (vinilo + quote + clock + certs)
  {
    label: 'Mission & Specialties',
    position: [0.5, 3.8, 1.5],
    target: [-1.04, 3.36, 5.5],
    hold: 3.2,
  },
  // 10. EQUIPO DE SONIDO + ondas — Vibe creativa
  {
    label: 'Sound of Code',
    position: [-1, 2.5, 2],
    target: [-4.3, 2, 4.5],
    hold: 2.5,
  },
  // 11. CIERRE — Vista wide final (sale con todo el cuarto)
  {
    label: 'DevOffice 3D · Portfolio',
    position: [-7, 4.8, 6.5],
    target: [0, 2.2, -1],
    hold: 2.5,
  },
]

function vectorFromArray(values) {
  return new THREE.Vector3(values[0], values[1], values[2])
}

// Exportamos los tour points para que la UI pueda mostrar labels
export { TOUR_POINTS }

export default function CameraKeyboardControls({ controlsRef, speed = 6, cameraMode = 'free', onUserInteract, onTourIndex }) {
  const { camera } = useThree()
  const keys = useRef({})
  const desiredPosition = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())
  const tourIndex = useRef(0)
  const tourProgress = useRef(0)
  const tourHold = useRef(0)
  const lastModeChange = useRef(0)   // timestamp del último cambio de modo (para grace period)

  useEffect(() => {
    const onDown = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      keys.current[e.key.toLowerCase()] = true
    }
    const onUp = (e) => {
      keys.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    const onZoomEvent = (e) => {
      const controls = controlsRef.current
      if (!controls) return
      const delta = Number(e.detail || 0)
      if (!delta) return
      const toTarget = new THREE.Vector3().subVectors(controls.target, camera.position).normalize()
      const amount = delta * 0.9
      camera.position.addScaledVector(toTarget, amount)
      controls.update()
    }
    window.addEventListener('camera-zoom', onZoomEvent)

    // Cuando el usuario empieza a interactuar con el mouse, salimos del preset → modo libre.
    // PERO con grace period: ignoramos los starts que ocurren <600ms después de cambiar de modo
    // (porque el click del botón preset puede disparar un start en el canvas).
    const controls = controlsRef.current
    let releaseListener = null
    if (controls && onUserInteract) {
      const onStart = () => {
        const elapsed = Date.now() - lastModeChange.current
        if (elapsed < 600) return  // grace period — ignorar start post-preset
        onUserInteract('free')
      }
      controls.addEventListener('start', onStart)
      releaseListener = () => controls.removeEventListener('start', onStart)
    }

    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('camera-zoom', onZoomEvent)
      if (releaseListener) releaseListener()
    }
  }, [onUserInteract])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    // Marcamos el momento del cambio para el grace period del listener 'start'
    lastModeChange.current = Date.now()

    if (cameraMode === 'free') {
      desiredPosition.current.copy(camera.position)
      desiredTarget.current.copy(controls.target)
      return
    }

    if (cameraMode === 'tour') {
      tourIndex.current = 0
      tourProgress.current = 0
      tourHold.current = 0
      if (onTourIndex) onTourIndex(0)
      desiredPosition.current.copy(vectorFromArray(TOUR_POINTS[0].position))
      desiredTarget.current.copy(vectorFromArray(TOUR_POINTS[0].target))
      return
    }

    const preset = CAMERA_PRESETS[cameraMode]
    if (!preset) return
    desiredPosition.current.copy(vectorFromArray(preset.position))
    desiredTarget.current.copy(vectorFromArray(preset.target))
  }, [cameraMode])

  useFrame((_, delta) => {
    const k = keys.current
    const controls = controlsRef.current
    if (!controls) return

    const v = speed * delta
    const damping = 1 - Math.exp(-4.5 * delta)

    if (cameraMode === 'tour') {
      const current = TOUR_POINTS[tourIndex.current]
      const next = TOUR_POINTS[(tourIndex.current + 1) % TOUR_POINTS.length]
      const moveDuration = 3.2          // transiciones más cinemáticas (antes 2.25s)

      if (tourHold.current < current.hold) {
        tourHold.current += delta
        camera.position.lerp(vectorFromArray(current.position), damping)
        controls.target.lerp(vectorFromArray(current.target), damping)
        controls.update()
        return
      }

      tourProgress.current += delta / moveDuration
      const t = THREE.MathUtils.clamp(tourProgress.current, 0, 1)
      const eased = THREE.MathUtils.smootherstep(t, 0, 1)

      desiredPosition.current.copy(vectorFromArray(current.position)).lerp(vectorFromArray(next.position), eased)
      desiredTarget.current.copy(vectorFromArray(current.target)).lerp(vectorFromArray(next.target), eased)

      const sweep = Math.sin(eased * Math.PI) * 0.38
      const lift = Math.sin(eased * Math.PI) * 0.24
      const depth = Math.cos(eased * Math.PI) * 0.14
      desiredPosition.current.x += sweep * (tourIndex.current % 2 === 0 ? -1 : 1)
      desiredPosition.current.y += lift
      desiredPosition.current.z += depth

      if (tourProgress.current >= 1) {
        tourProgress.current = 0
        tourHold.current = 0
        tourIndex.current = (tourIndex.current + 1) % TOUR_POINTS.length
        if (onTourIndex) onTourIndex(tourIndex.current)
      }

      camera.position.lerp(desiredPosition.current, damping)
      controls.target.lerp(desiredTarget.current, damping)
      controls.update()
      return
    }

    if (v === 0) return

    // Vector "adelante" en plano horizontal (XZ)
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    if (forward.lengthSq() < 0.0001) return
    forward.normalize()

    // Vector "derecha"
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
    const up = new THREE.Vector3(0, 1, 0)

    const move = new THREE.Vector3()
    // WASD: pan (mueve cámara y target juntos)
    if (k['w']) move.addScaledVector(forward, v)
    if (k['s']) move.addScaledVector(forward, -v)
    if (k['a']) move.addScaledVector(right, -v)
    if (k['d']) move.addScaledVector(right, v)
    if (k['q']) move.addScaledVector(up, v)
    if (k['e']) move.addScaledVector(up, -v)

    if (move.lengthSq() > 0) {
      camera.position.add(move)
      controls.target.add(move)
    }

    // Flechas ↑↓: acercar/alejar (dolly — mueve solo cámara hacia/desde target)
    if (k['arrowup']) {
      const toTarget = new THREE.Vector3().subVectors(controls.target, camera.position).normalize()
      camera.position.addScaledVector(toTarget, v)
    }
    if (k['arrowdown']) {
      const toTarget = new THREE.Vector3().subVectors(controls.target, camera.position).normalize()
      camera.position.addScaledVector(toTarget, -v)
    }
    // Flechas ← →: strafe lateral (cámara + target)
    if (k['arrowleft']) {
      camera.position.addScaledVector(right, -v)
      controls.target.addScaledVector(right, -v)
    }
    if (k['arrowright']) {
      camera.position.addScaledVector(right, v)
      controls.target.addScaledVector(right, v)
    }

    // Teclas para zoom rápido: z = acercar, x = alejar
    if (k['z']) {
      const toTarget = new THREE.Vector3().subVectors(controls.target, camera.position).normalize()
      camera.position.addScaledVector(toTarget, v * 1.8)
    }
    if (k['x']) {
      const toTarget = new THREE.Vector3().subVectors(controls.target, camera.position).normalize()
      camera.position.addScaledVector(toTarget, -v * 1.8)
    }

    if (cameraMode === 'free') {
      desiredPosition.current.copy(camera.position)
      desiredTarget.current.copy(controls.target)
    } else {
      camera.position.lerp(desiredPosition.current, damping)
      controls.target.lerp(desiredTarget.current, damping)
    }

    controls.update()
  })

  return null
}
