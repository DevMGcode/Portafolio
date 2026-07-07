import { useEffect, useRef, useMemo } from 'react'
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
const BASE_FOV = 55

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

// === RECORRIDO CINEMATOGRÁFICO ===
// Cada shot puede anclarse a un objeto del layout (`anchor`): la cámara y el
// target se calculan como offsets relativos a la posición REAL del objeto, así
// el recorrido sigue encuadrando bien aunque los muebles se muevan en edición.
// Si el anchor no existe (item eliminado) cae a `position`/`target` absolutos.
//   hold = segundos contemplando el punto (con drift cinematográfico)
//   fov  = "lente" del plano: bajo = close-up íntimo, alto = gran angular
export const TOUR_SHOTS = [
  // 1. APERTURA — Close-up con CARA visible, ligeramente desde abajo (heroico)
  // Target = cabeza del avatar; cámara adelante-derecha (ella mira hacia -z)
  {
    label: 'Meet Melissa',
    anchor: 'avatar',
    camOff: [1.45, 2.55, -0.95],
    targetOff: [0, 2.67, 0],
    position: [2.5, 2.0, 0.35],
    target: [1.58, 2.15, 1.85],
    hold: 4.0,
    fov: 42,
  },
  // 2. VISTA GENERAL — Plano amplio mostrando TODO (Tech Stack, Letrero, Puerta, Wall Display)
  {
    label: 'Welcome to DevOffice 3D',
    position: [-2.5, 3.6, 3.8],
    target: [2.2, 1.8, -1],
    hold: 3.6,
    fov: 58,
  },
  // 3. VENTANA CYBERPUNK — El mundo donde vive (atmósfera)
  {
    label: 'Cyberpunk City View',
    position: [3.5, 3.4, 1],
    target: [-2.5, 3.2, -5.8],
    hold: 2.8,
    fov: 50,
  },
  // 4. ESCRITORIO + MONITOR + DASHBOARD — Su workspace
  {
    label: 'The Workspace',
    anchor: 'monitores',
    camOff: [2.85, 1.12, 2.41],
    targetOff: [-0.25, 0.52, -0.09],
    position: [2.8, 2.6, 2.2],
    target: [-0.3, 2, -0.3],
    hold: 2.8,
    fov: 46,
  },
  // 5. LIVE METRICS curvo — Sus skills en datos
  {
    label: 'Live Analytics',
    anchor: 'live_metrics',
    camOff: [1.97, 0.42, 1.72],
    targetOff: [0, 0.12, -0.03],
    position: [1.2, 2.6, 1.4],
    target: [-0.77, 2.3, -0.35],
    hold: 2.6,
    fov: 42,
  },
  // 6. TECH STACK WALL — Tecnologías que maneja
  // Encuadre frontal (perpendicular a la pared) y con distancia para ver TODO el panel
  {
    label: 'Tech Stack',
    anchor: 'tech_stack',
    camOff: [-3.9, 0.35, 0.05],
    targetOff: [-0.2, 0.05, 0],
    position: [2.5, 3.2, 0],
    target: [5.5, 3.0, -1.92],
    hold: 4.0,
    fov: 50,
  },
  // 7. LETRERO "Melissa García DevMGcode" — Identidad
  {
    label: 'DevMGcode',
    anchor: 'letrero',
    camOff: [-3.47, 0.2, 2.49],
    targetOff: [-0.47, -0.19, -0.36],
    position: [2.5, 4.2, 1],
    target: [5.5, 3.81, -1.85],
    hold: 2.2,
    fov: 44,
  },
  // 8. REPISA con trofeo + proyectos — Sus logros
  {
    label: 'Achievements',
    anchor: 'repisa',
    camOff: [-2.36, 2.15, 2.85],
    targetOff: [0, 1.45, 0],
    position: [1, 3.2, -2.5],
    target: [3.36, 2.5, -5.35],
    hold: 2.8,
    fov: 46,
  },
  // 9. WALL DISPLAY (vinilo + quote + clock + certs)
  {
    label: 'Mission & Specialties',
    anchor: 'wall_display',
    camOff: [1.54, 0.44, -4.28],
    targetOff: [0, 0, -0.28],
    position: [0.5, 3.8, 1.5],
    target: [-1.04, 3.36, 5.5],
    hold: 3.2,
    fov: 48,
  },
  // 10. EQUIPO DE SONIDO + ondas — Vibe creativa
  {
    label: 'Sound of Code',
    anchor: 'equipo_sonido',
    camOff: [3.43, 2.55, -2.77],
    targetOff: [0.13, 2.05, -0.27],
    position: [-1, 2.5, 2],
    target: [-4.3, 2, 4.5],
    hold: 2.6,
    fov: 46,
  },
  // 11. CIERRE — Vista wide final (sale con todo el cuarto)
  {
    label: 'DevOffice 3D · Portfolio',
    position: [-7, 4.8, 6.5],
    target: [0, 2.2, -1],
    hold: 2.8,
    fov: 60,
  },
]

// Resuelve los shots contra el layout vigente: anclados a objetos reales.
export function buildTourPoints(layout) {
  return TOUR_SHOTS.map((shot) => {
    const anchorPos = shot.anchor ? layout?.[shot.anchor]?.pos : null
    if (!anchorPos) return shot
    return {
      ...shot,
      position: [anchorPos[0] + shot.camOff[0], anchorPos[1] + shot.camOff[1], anchorPos[2] + shot.camOff[2]],
      target: [anchorPos[0] + shot.targetOff[0], anchorPos[1] + shot.targetOff[1], anchorPos[2] + shot.targetOff[2]],
    }
  })
}

function vectorFromArray(values) {
  return new THREE.Vector3(values[0], values[1], values[2])
}

export default function CameraKeyboardControls({ controlsRef, speed = 6, cameraMode = 'free', onUserInteract, onTourIndex, layout }) {
  const { camera } = useThree()
  const keys = useRef({})
  const desiredPosition = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())
  const lastModeChange = useRef(0)   // timestamp del último cambio de modo (para grace period)

  // --- Estado del recorrido cinematográfico ---
  const tourIndex = useRef(0)
  const tourPhase = useRef('hold')          // 'hold' (contemplando) | 'move' (viajando)
  const phaseTime = useRef(0)
  const moveDuration = useRef(3)
  const moveFrom = useRef(new THREE.Vector3())        // posición al iniciar el viaje
  const moveFromTarget = useRef(new THREE.Vector3())  // target al iniciar el viaje
  const moveCtrl = useRef(new THREE.Vector3())        // punto de control Bézier (curva del dolly)

  // Shots resueltos contra el layout actual (siguen a los objetos si se mueven).
  // Se lee vía ref dentro de useFrame para no reiniciar el tour en cada auto-save.
  const tourPoints = useMemo(() => buildTourPoints(layout), [layout])
  const tourPointsRef = useRef(tourPoints)
  tourPointsRef.current = tourPoints

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
      tourPhase.current = 'hold'
      phaseTime.current = 0
      if (onTourIndex) onTourIndex(0)
      const first = tourPointsRef.current[0]
      desiredPosition.current.copy(vectorFromArray(first.position))
      desiredTarget.current.copy(vectorFromArray(first.target))
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
      const points = tourPointsRef.current
      const current = points[tourIndex.current]
      const next = points[(tourIndex.current + 1) % points.length]
      let desiredFov = current.fov ?? BASE_FOV

      if (tourPhase.current === 'hold') {
        // === CONTEMPLACIÓN: la cámara nunca queda muerta ===
        // Drift tipo Ken Burns: push-in lento hacia el target + levísima
        // elevación que empieza y termina en 0 (sin saltos al salir).
        // El reloj del plano solo corre cuando la cámara YA llegó al encuadre
        // (al entrar al tour la cámara viaja desde donde estaba el usuario;
        // sin esta espera, el plano se "consume" durante ese vuelo)
        if (camera.position.distanceTo(desiredPosition.current) < 0.35) {
          phaseTime.current += delta
        }
        const t = THREE.MathUtils.clamp(phaseTime.current / current.hold, 0, 1)
        const drift = THREE.MathUtils.smootherstep(t, 0, 1)

        const pos = vectorFromArray(current.position)
        const tgt = vectorFromArray(current.target)
        const toTarget = tgt.clone().sub(pos)
        const dist = toTarget.length()
        if (dist > 0.001) toTarget.normalize()
        const pushIn = Math.min(0.35, dist * 0.09) * drift
        pos.addScaledVector(toTarget, pushIn)
        pos.y += 0.05 * Math.sin(drift * Math.PI)

        desiredPosition.current.copy(pos)
        desiredTarget.current.copy(tgt)

        if (phaseTime.current >= current.hold) {
          // Preparar el viaje: partimos de la posición YA drifteada (sin salto)
          tourPhase.current = 'move'
          phaseTime.current = 0
          moveFrom.current.copy(desiredPosition.current)
          moveFromTarget.current.copy(desiredTarget.current)

          const to = vectorFromArray(next.position)
          const travel = moveFrom.current.distanceTo(to)
          // Duración proporcional a la distancia: saltos cortos ágiles, viajes largos majestuosos
          moveDuration.current = THREE.MathUtils.clamp(travel / 2.4, 2.0, 4.0)

          // Punto de control Bézier: arco lateral alternado + leve elevación
          const mid = moveFrom.current.clone().add(to).multiplyScalar(0.5)
          const dir = to.clone().sub(moveFrom.current)
          dir.y = 0
          const perp = dir.lengthSq() > 0.0001
            ? new THREE.Vector3(-dir.z, 0, dir.x).normalize()
            : new THREE.Vector3(1, 0, 0)
          const side = tourIndex.current % 2 === 0 ? 1 : -1
          mid.addScaledVector(perp, side * THREE.MathUtils.clamp(travel * 0.16, 0.2, 0.9))
          mid.y += THREE.MathUtils.clamp(travel * 0.12, 0.1, 0.55)
          moveCtrl.current.copy(mid)
        }
      } else {
        // === VIAJE: dolly curvo (Bézier cuadrática) con easing suave ===
        phaseTime.current += delta
        const t = THREE.MathUtils.clamp(phaseTime.current / moveDuration.current, 0, 1)
        const e = THREE.MathUtils.smootherstep(t, 0, 1)
        const one = 1 - e

        const a = moveFrom.current
        const c = moveCtrl.current
        const b = vectorFromArray(next.position)
        desiredPosition.current.set(
          one * one * a.x + 2 * one * e * c.x + e * e * b.x,
          one * one * a.y + 2 * one * e * c.y + e * e * b.y,
          one * one * a.z + 2 * one * e * c.z + e * e * b.z,
        )
        desiredTarget.current.copy(moveFromTarget.current).lerp(vectorFromArray(next.target), e)

        // El "lente" cambia gradualmente durante el viaje (transición de plano)
        desiredFov = THREE.MathUtils.lerp(current.fov ?? BASE_FOV, next.fov ?? BASE_FOV, e)

        if (t >= 1) {
          tourPhase.current = 'hold'
          phaseTime.current = 0
          tourIndex.current = (tourIndex.current + 1) % points.length
          if (onTourIndex) onTourIndex(tourIndex.current)
        }
      }

      // FOV cinematográfico con suavizado
      camera.fov += (desiredFov - camera.fov) * damping
      camera.updateProjectionMatrix()

      camera.position.lerp(desiredPosition.current, damping)
      controls.target.lerp(desiredTarget.current, damping)
      controls.update()
      return
    }

    // Fuera del tour: devolver el FOV al valor base suavemente
    if (Math.abs(camera.fov - BASE_FOV) > 0.05) {
      camera.fov += (BASE_FOV - camera.fov) * damping
      camera.updateProjectionMatrix()
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
