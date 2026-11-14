import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import Scene, { INITIAL_LAYOUT } from './components/Scene'
import ProjectPanel from './components/ProjectPanel'
import CertificatesPanel from './components/CertificatesPanel'
import EditorPanel from './components/EditorPanel'
import HelpPanel from './components/HelpPanel'
import AboutMePanel from './components/AboutMePanel'
import LoadingIntro from './components/LoadingIntro'
import SceneLabel from './components/SceneLabel'
import AssetsProgress from './components/AssetsProgress'
import ErrorBoundary from './components/ErrorBoundary'
import MobileFallback from './components/MobileFallback'
import { assetPath } from './utils/assetPath'
import { isMobile, deviceQuality } from './utils/device'
import './App.css'

const STORAGE_KEY = 'devoffice-3d-layout-v2'
const DELETED_KEY = 'devoffice-3d-deleted-v2'

// Playlist de música ambiente. Empieza en la pista 0 (la actual) y al terminar
// una, salta sola a la siguiente (loop de toda la lista). Nombres genéricos en UI.
const MUSIC_TRACKS = [
  '/boosted.mp3',
  '/music/pista-2.mp3',
  '/music/pista-3.mp3',
  '/music/pista-4.mp3',
]

function loadDeletedSet() {
  try {
    const raw = localStorage.getItem(DELETED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch { return new Set() }
}

// Hidrata layout desde localStorage al iniciar. Combina con INITIAL_LAYOUT
// para que items nuevos (que aún no están guardados) aparezcan con sus defaults.
// Excluye los items marcados como eliminados.
function loadSavedLayout() {
  // 🛡️ EN PRODUCCIÓN: siempre cargamos el INITIAL_LAYOUT completo, sin localStorage.
  // Así nadie puede romper el portfolio modificando su navegador.
  if (!import.meta.env.DEV) {
    return { ...INITIAL_LAYOUT }
  }
  const deleted = loadDeletedSet()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const saved = raw ? JSON.parse(raw) : {}
    const merged = {}
    for (const key of Object.keys(INITIAL_LAYOUT)) {
      if (deleted.has(key)) continue
      merged[key] = saved[key] ? { ...INITIAL_LAYOUT[key], ...saved[key] } : INITIAL_LAYOUT[key]
    }
    return merged
  } catch {
    const fallback = {}
    for (const key of Object.keys(INITIAL_LAYOUT)) {
      if (!deleted.has(key)) fallback[key] = INITIAL_LAYOUT[key]
    }
    return fallback
  }
}

// Detecciones de device (se calcula 1 vez al cargar).
// Override manual con ?mobile en la URL → fuerza la vista móvil HTML
// (útil para previsualizar/demostrar la versión móvil desde un desktop).
const FORCE_MOBILE =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('mobile')
const IS_MOBILE = isMobile() || FORCE_MOBILE
const QUALITY = deviceQuality()

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [certsOpen, setCertsOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [gizmoMode, setGizmoMode] = useState('translate')
  const [cameraMode, setCameraMode] = useState('free')
  const [layout, setLayout] = useState(loadSavedLayout)
  const [helpOpen, setHelpOpen] = useState(false)
  const [aboutMeOpen, setAboutMeOpen] = useState(false)
  const [introVisible, setIntroVisible] = useState(true)
  const [tourIndex, setTourIndex] = useState(0)
  const [assetsReady, setAssetsReady] = useState(false)
  // Flag: ¿el help se abrió como parte del flujo de bienvenida (post-intro)?
  // Cuando se cierre por primera vez → arranca el recorrido automáticamente.
  const [helpFromIntro, setHelpFromIntro] = useState(false)
  // Modo edición solo disponible cuando se corre con `npm run dev` (Vite local).
  // En producción (GitHub Pages, Vercel, etc.) queda completamente oculto.
  const editingAllowed = import.meta.env.DEV
  const [savedFlash, setSavedFlash] = useState(false)
  const [musicState, setMusicState] = useState('loading')
  const [volume, setVolume] = useState(0.18)
  const [trackIndex, setTrackIndex] = useState(0)
  const flashTimer = useRef(null)
  const audioRef = useRef(null)
  const trackIndexRef = useRef(0)
  const musicStartedRef = useRef(false)
  const startMusicRef = useRef(() => {})

  // Auto-save a localStorage cuando layout cambia (con debounce visual).
  // 🛡️ Solo en desarrollo — en producción no toca localStorage para nada.
  useEffect(() => {
    if (!editingAllowed) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
      setSavedFlash(true)
      clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setSavedFlash(false), 1500)
    } catch (e) {
      console.warn('No se pudo guardar layout', e)
    }
  }, [layout, editingAllowed])

  useEffect(() => {
    const audio = new Audio(assetPath(MUSIC_TRACKS[0]))
    audio.preload = 'auto'
    audio.volume = 0.18
    audioRef.current = audio

    const onCanPlay = () => setMusicState((s) => (s === 'playing' ? s : 'ready'))
    const onError = () => setMusicState('error')
    // Al terminar una pista → salta sola a la siguiente (loop de la playlist)
    const onEnded = () => {
      const next = (trackIndexRef.current + 1) % MUSIC_TRACKS.length
      trackIndexRef.current = next
      setTrackIndex(next)
      audio.src = assetPath(MUSIC_TRACKS[next])
      audio.play().then(() => setMusicState('playing')).catch(() => {})
    }
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('error', onError)
    audio.addEventListener('ended', onEnded)

    const startMusic = async () => {
      if (musicStartedRef.current) return
      try {
        await audio.play()
        musicStartedRef.current = true
        setMusicState('playing')
      } catch {
        // Necesita gesto del usuario; se reintenta con el primer click/tecla
      }
    }
    startMusicRef.current = startMusic

    const unlockAndStart = () => { void startMusicRef.current() }
    window.addEventListener('pointerdown', unlockAndStart, { passive: true, once: true })
    window.addEventListener('keydown', unlockAndStart, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockAndStart)
      window.removeEventListener('keydown', unlockAndStart)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('ended', onEnded)
      try { audio.pause() } catch {}
      audio.src = ''
    }
  }, [])

  // Play / pausa (el botón ♪)
  const handleMusicToggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || musicState === 'error' || musicState === 'loading') return
    if (audio.paused) {
      audio.play().then(() => { musicStartedRef.current = true; setMusicState('playing') }).catch(() => {})
    } else {
      audio.pause()
      setMusicState('ready')
    }
  }, [musicState])

  // Cambiar de pista (⏮ ⏭). dir = -1 anterior, +1 siguiente. Loop circular.
  const handleTrackChange = useCallback((dir) => {
    const audio = audioRef.current
    if (!audio || musicState === 'error' || musicState === 'loading') return
    const n = (trackIndexRef.current + dir + MUSIC_TRACKS.length) % MUSIC_TRACKS.length
    trackIndexRef.current = n
    setTrackIndex(n)
    const wasPlaying = !audio.paused
    audio.src = assetPath(MUSIC_TRACKS[n])
    audio.load()
    if (wasPlaying) {
      audio.play().then(() => { musicStartedRef.current = true; setMusicState('playing') }).catch(() => {})
    }
  }, [musicState])

  const handleVolumeChange = useCallback((e) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  const handleUpdateLayout = useCallback((name, changes) => {
    // 🛡️ En producción: no-op total. Aunque alguien fuerce editMode=true desde DevTools,
    // este handler no muta nada y la escena queda intacta.
    if (!editingAllowed) return
    setLayout((prev) => {
      const item = prev[name]
      const next = { ...item }
      if (changes.pos)       next.pos = changes.pos
      if (changes.size)      next.size = changes.size
      if (changes.rot)       next.rot = changes.rot
      if (changes.maxRadius) next.maxRadius = changes.maxRadius
      if (changes.screen)    next.screen = changes.screen
      if (changes.width)     next.width = changes.width
      if (changes.height)    next.height = changes.height
      return { ...prev, [name]: next }
    })
  }, [editingAllowed])

  const resetLayout = () => {
    // 🛡️ En producción: no-op.
    if (!editingAllowed) return
    if (!confirm('¿Restaurar todas las posiciones originales? Esto borra tus cambios guardados y trae de vuelta los elementos eliminados.')) return
    setLayout(INITIAL_LAYOUT)
    setSelectedItem(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(DELETED_KEY)
    } catch {}
  }

  const handleDeleteItem = useCallback((name) => {
    // 🛡️ En producción: bloqueado. Nadie puede eliminar items aunque manipule el state.
    if (!editingAllowed) return
    if (!name) return
    const baseKey = name.includes(':') ? name.split(':')[0] : name
    if (!confirm(`¿Eliminar "${baseKey}" de la escena?\n\nPodés restaurarlo después con el botón "Reset al default".`)) return
    try {
      const deleted = loadDeletedSet()
      deleted.add(baseKey)
      localStorage.setItem(DELETED_KEY, JSON.stringify([...deleted]))
    } catch {}
    setLayout((prev) => {
      const next = { ...prev }
      delete next[baseKey]
      return next
    })
    setSelectedItem(null)
  }, [editingAllowed])

  // 🛡️ Listeners de teclado solo en desarrollo Y con editMode activo
  useEffect(() => {
    if (!editingAllowed || !editMode) return
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 't' || e.key === 'T') setGizmoMode('translate')
      if (e.key === 's' || e.key === 'S') setGizmoMode('scale')
      if (e.key === 'r' || e.key === 'R') setGizmoMode('rotate')
      if (e.key === 'Escape') setSelectedItem(null)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItem) {
        e.preventDefault()
        handleDeleteItem(selectedItem)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editingAllowed, editMode, selectedItem, handleDeleteItem])

  // 📱 En mobile: SIEMPRE HTML fallback. El 3D crashea el browser en gama media-baja.
  // No hay forma confiable de detectar si el celu lo soportará, así que vamos al seguro.
  if (IS_MOBILE) {
    return (
      <ErrorBoundary>
        <MobileFallback />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary fallbackUI={<MobileFallback />}>
    <div className={`app ${IS_MOBILE ? 'is-mobile' : 'is-desktop'} quality-${QUALITY}`}>
      <header className="hud">
        <h1>DevOffice 3D <span className="neon">// Melissa García</span></h1>
        <p>
          {editMode
            ? `MODO EDICIÓN — ${gizmoMode === 'translate' ? 'MOVER (T)' : gizmoMode === 'scale' ? 'ESCALAR (S)' : 'ROTAR (R)'} · clic en un objeto, arrastrá el gizmo`
            : 'Portafolio interactivo · explorá los proyectos con el mouse y el teclado'}
        </p>
      </header>

      <div className="top-right-controls">
        {savedFlash && <span className="save-flash">✓ Guardado</span>}
        {!editMode && (
          <>
            <div className="camera-presets" aria-label="Vistas de cámara">
              <button className={`pill ${cameraMode === 'free' ? 'pill-active' : ''}`} onClick={() => setCameraMode('free')} title="Modo libre (mouse + teclado)">
                <span className="pill-icon">✦</span>Libre
              </button>
              <button className={`pill ${cameraMode === 'overview' ? 'pill-active' : ''}`} onClick={() => setCameraMode('overview')} title="Vista panorámica del cuarto">
                <span className="pill-icon">⌂</span>General
              </button>
              <button className={`pill ${cameraMode === 'desk' ? 'pill-active' : ''}`} onClick={() => setCameraMode('desk')} title="Foco al setup gamer">
                <span className="pill-icon">▣</span>Escritorio
              </button>
              <button className={`pill ${cameraMode === 'shelf' ? 'pill-active' : ''}`} onClick={() => setCameraMode('shelf')} title="Foco a la repisa con proyectos">
                <span className="pill-icon">≡</span>Repisa
              </button>
              <button className={`pill ${cameraMode === 'tour' ? 'pill-active' : ''}`} onClick={() => setCameraMode('tour')} title="Tour automático cinematográfico">
                <span className="pill-icon">▶</span>Recorrido
              </button>
            </div>
            <div className="zoom-controls">
              <button className="pill pill-icon-only" onClick={() => window.dispatchEvent(new CustomEvent('camera-zoom', { detail: 1 }))} title="Acercar"><strong>+</strong></button>
              <button className="pill pill-icon-only" onClick={() => window.dispatchEvent(new CustomEvent('camera-zoom', { detail: -1 }))} title="Alejar"><strong>−</strong></button>
            </div>
          </>
        )}
        <button
          className="pill pill-icon-only pill-help"
          onClick={() => setHelpOpen(true)}
          title="¿Cómo usar este portafolio?"
          aria-label="Ayuda"
        >
          <strong>?</strong>
        </button>
        <div className={`volume-control ${musicState === 'playing' ? 'volume-control-active' : ''}`}>
          <button
            className={`pill pill-music ${musicState === 'playing' ? 'pill-music-on' : ''}`}
            onClick={handleMusicToggle}
            disabled={musicState === 'error' || musicState === 'loading'}
            title={musicState === 'playing' ? 'Pausar música' : 'Reproducir música'}
          >
            <span className="pill-icon">♪</span>
            {musicState === 'playing' ? 'ON' : musicState === 'error' ? 'No disp.' : musicState === 'loading' ? '...' : 'OFF'}
          </button>
          {(musicState === 'playing' || musicState === 'ready') && (
            <div className="music-deck">
              <button
                className="music-nav"
                onClick={() => handleTrackChange(-1)}
                title="Pista anterior"
                aria-label="Pista anterior"
              >⏮</button>
              <span className="music-track" title={`Pista ${trackIndex + 1} de ${MUSIC_TRACKS.length}`}>
                <span className="music-track-n">{trackIndex + 1}</span>
                <span className="music-track-total">/{MUSIC_TRACKS.length}</span>
              </span>
              <button
                className="music-nav"
                onClick={() => handleTrackChange(1)}
                title="Siguiente pista"
                aria-label="Siguiente pista"
              >⏭</button>
              <span className="music-divider" />
              <span className="volume-icon">▮</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                aria-label="Volumen"
                style={{ '--vol': `${volume * 100}%` }}
              />
              <span className="volume-pct">{Math.round(volume * 100)}</span>
            </div>
          )}
        </div>
        {editingAllowed && (
          <button
            className={`btn ${editMode ? 'btn-magenta' : ''}`}
            onClick={() => { setEditMode(!editMode); setSelectedItem(null) }}
          >
            {editMode ? '✓ Salir edición' : '✎ Modo edición'}
          </button>
        )}
      </div>

      <Canvas
        shadows={!IS_MOBILE}
        camera={{ position: [6, 4.5, 7], fov: 55 }}
        gl={{
          antialias: !IS_MOBILE,
          powerPreference: IS_MOBILE ? 'low-power' : 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={IS_MOBILE ? 1 : [1, 2]}        // mobile: DPR fijo en 1 (mucho más liviano)
        flat={IS_MOBILE}                      // mobile: sin tone mapping
        onCreated={({ gl }) => {
          gl.setClearColor('#05060f')
        }}
      >
        <color attach="background" args={['#05060f']} />
        <fog attach="fog" args={['#05060f', 10, 30]} />
        <Suspense fallback={null}>
          {/* Dentro del Suspense: solo se monta cuando TODA la escena terminó
              de cargar → dispara assetsReady. Así la intro nunca deja pasar a
              una escena a medio cargar (que se vería negra). */}
          <AssetsProgress onReady={() => setAssetsReady(true)} />
          <Scene
            onSelectProject={setSelectedProject}
            onOpenAboutMe={() => setAboutMeOpen(true)}
            onOpenCerts={() => setCertsOpen(true)}
            /* 🛡️ Forzamos editMode a FALSE en producción para que ni los gizmos puedan aparecer */
            editMode={editingAllowed && editMode}
            selectedItem={editingAllowed ? selectedItem : null}
            onSelectItem={editingAllowed ? setSelectedItem : () => {}}
            layout={layout}
            /* 🛡️ Handler no-op en producción para que ningún componente pueda mutar la escena */
            onUpdateLayout={editingAllowed ? handleUpdateLayout : () => {}}
            gizmoMode={gizmoMode}
            cameraMode={cameraMode}
            onCameraMode={setCameraMode}
            onTourIndex={setTourIndex}
          />

          {/* POST-PROCESSING — Solo en desktop. Mobile salta los efectos para no lagear */}
          {!editMode && !IS_MOBILE && (
            <EffectComposer multisampling={4}>
              {/* Bloom — apenas un brillito en los neones más fuertes */}
              <Bloom
                intensity={0.2}
                luminanceThreshold={0.75}
                luminanceSmoothing={0.9}
                mipmapBlur
                radius={0.5}
              />
              {/* Chromatic Aberration — casi imperceptible */}
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={[0.00015, 0.00015]}
                radialModulation={false}
                modulationOffset={0}
              />
              {/* Vignette — toque sutil en las esquinas */}
              <Vignette
                offset={0.5}
                darkness={0.22}
                blendFunction={BlendFunction.NORMAL}
              />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>

      {selectedProject && !editMode && (
        <ProjectPanel project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}

      {certsOpen && !editMode && (
        <CertificatesPanel onClose={() => setCertsOpen(false)} />
      )}

      {helpOpen && (
        <HelpPanel
          onClose={() => {
            setHelpOpen(false)
            // 🎬 Si el help fue el del flujo post-intro → arrancar recorrido automáticamente
            if (helpFromIntro) {
              setHelpFromIntro(false)
              setTourIndex(0)
              setCameraMode('tour')
            }
          }}
        />
      )}

      {aboutMeOpen && <AboutMePanel onClose={() => setAboutMeOpen(false)} />}

      {/* Barras cinematográficas (letterbox) durante el recorrido */}
      {cameraMode === 'tour' && !editMode && (
        <div className="cine-bars" aria-hidden="true">
          <div className="cine-bar cine-bar-top" />
          <div className="cine-bar cine-bar-bottom" />
        </div>
      )}

      {/* Scene labels durante el recorrido (Netflix style) */}
      <SceneLabel tourIndex={tourIndex} active={cameraMode === 'tour'} />

      {/* Loading intro cyberpunk (espera a que carguen los assets 3D) */}
      {introVisible && (
        <LoadingIntro
          assetsReady={assetsReady}
          onFinish={() => {
            setIntroVisible(false)
            // Abrir el panel de ayuda automáticamente para que el visitante sepa cómo navegar
            setHelpOpen(true)
            // Marcar que este help es parte del flujo de bienvenida → cuando se cierre arranca tour
            setHelpFromIntro(true)
            // Intentar arrancar la música (el click-to-skip ya cuenta como gesture)
            try { void startMusicRef.current() } catch {}
          }}
        />
      )}

      {editMode && editingAllowed && !IS_MOBILE && (
        <EditorPanel
          layout={layout}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
          onReset={resetLayout}
          onDelete={handleDeleteItem}
          gizmoMode={gizmoMode}
          onChangeMode={setGizmoMode}
        />
      )}

    </div>
    </ErrorBoundary>
  )
}
