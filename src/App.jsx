import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import Scene, { INITIAL_LAYOUT } from './components/Scene'
import ProjectPanel from './components/ProjectPanel'
import EditorPanel from './components/EditorPanel'
import HelpPanel from './components/HelpPanel'
import AboutMePanel from './components/AboutMePanel'
import LoadingIntro from './components/LoadingIntro'
import SceneLabel from './components/SceneLabel'
import AssetsProgress from './components/AssetsProgress'
import { assetPath } from './utils/assetPath'
import './App.css'

const STORAGE_KEY = 'devoffice-3d-layout-v1'
const DELETED_KEY = 'devoffice-3d-deleted-v1'

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

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [gizmoMode, setGizmoMode] = useState('translate')
  const [cameraMode, setCameraMode] = useState('free')
  const [layout, setLayout] = useState(loadSavedLayout)
  const [helpOpen, setHelpOpen] = useState(false)
  const [aboutMeOpen, setAboutMeOpen] = useState(false)
  const [introVisible, setIntroVisible] = useState(true)
  const [tourIndex, setTourIndex] = useState(0)
  const [assetProgress, setAssetProgress] = useState(0)
  const [assetsReady, setAssetsReady] = useState(false)
  // Modo edición solo disponible cuando se corre con `npm run dev` (Vite local).
  // En producción (GitHub Pages, Vercel, etc.) queda completamente oculto.
  const editingAllowed = import.meta.env.DEV
  const [savedFlash, setSavedFlash] = useState(false)
  const [musicState, setMusicState] = useState('loading')
  const flashTimer = useRef(null)
  const audioContextRef = useRef(null)
  const audioBufferRef = useRef(null)
  const gainNodeRef = useRef(null)
  const sourceRef = useRef(null)
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
    const audio = new Audio(assetPath('/boosted.mp3'))
    audio.preload = 'auto'

    const context = new AudioContext()
    audioContextRef.current = context
    gainNodeRef.current = context.createGain()
    gainNodeRef.current.gain.value = 0.18
    gainNodeRef.current.connect(context.destination)

    let cancelled = false

    const loadAudio = async () => {
      try {
        const response = await fetch(audio.src)
        const arrayBuffer = await response.arrayBuffer()
        const decoded = await context.decodeAudioData(arrayBuffer)
        if (cancelled) return
        audioBufferRef.current = decoded
        setMusicState('ready')
      } catch (error) {
        console.warn('No se pudo cargar la música de fondo', error)
        setMusicState('error')
      }
    }

    const startMusic = async () => {
      if (musicStartedRef.current || !audioBufferRef.current || !audioContextRef.current || !gainNodeRef.current) return

      try {
        if (audioContextRef.current.state !== 'running') {
          await audioContextRef.current.resume()
        }

        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBufferRef.current
        source.loop = true
        source.connect(gainNodeRef.current)
        source.start(0)

        sourceRef.current = source
        musicStartedRef.current = true
        setMusicState('playing')
      } catch (error) {
        console.warn('No se pudo iniciar la música de fondo', error)
        setMusicState('ready')
      }
    }

    startMusicRef.current = startMusic
    loadAudio()

    const unlockAndStart = () => {
      void startMusicRef.current()
    }

    window.addEventListener('pointerdown', unlockAndStart, { passive: true, once: true })
    window.addEventListener('keydown', unlockAndStart, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('pointerdown', unlockAndStart)
      window.removeEventListener('keydown', unlockAndStart)
      if (sourceRef.current) {
        try { sourceRef.current.stop() } catch {}
        sourceRef.current.disconnect()
      }
      if (gainNodeRef.current) {
        try { gainNodeRef.current.disconnect() } catch {}
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close()
      }
    }
  }, [])

  const handleMusicToggle = useCallback(() => {
    if (musicState === 'error') return
    void startMusicRef.current()
  }, [musicState])

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

  return (
    <div className="app">
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
        <button
          className={`pill pill-music ${musicState === 'playing' ? 'pill-music-on' : ''}`}
          onClick={handleMusicToggle}
          disabled={musicState === 'error'}
          title={musicState === 'playing' ? 'Música activada' : 'Activar música ambiente'}
        >
          <span className="pill-icon">♪</span>
          {musicState === 'playing' ? 'Sonando' : musicState === 'ready' ? 'Música' : musicState === 'error' ? 'No disp.' : 'Cargando'}
        </button>
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
        shadows
        camera={{ position: [6, 4.5, 7], fov: 55 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#05060f']} />
        <fog attach="fog" args={['#05060f', 10, 30]} />
        <Suspense fallback={null}>
          <AssetsProgress
            onProgress={setAssetProgress}
            onReady={() => setAssetsReady(true)}
          />
          <Scene
            onSelectProject={setSelectedProject}
            onOpenAboutMe={() => setAboutMeOpen(true)}
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

          {/* POST-PROCESSING — Look cinemático MUY tenue (mínimo viable) */}
          {!editMode && (
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

      {helpOpen && <HelpPanel onClose={() => setHelpOpen(false)} />}

      {aboutMeOpen && <AboutMePanel onClose={() => setAboutMeOpen(false)} />}

      {/* Scene labels durante el recorrido (Netflix style) */}
      <SceneLabel tourIndex={tourIndex} active={cameraMode === 'tour'} />

      {/* Loading intro cyberpunk (espera a que carguen los assets 3D) */}
      {introVisible && (
        <LoadingIntro
          assetProgress={assetProgress}
          assetsReady={assetsReady}
          onFinish={() => {
            setIntroVisible(false)
            // Abrir el panel de ayuda automáticamente para que el visitante sepa cómo navegar
            setHelpOpen(true)
            // Intentar arrancar la música (el click-to-skip ya cuenta como gesture)
            try { void startMusicRef.current() } catch {}
          }}
        />
      )}

      {editMode && editingAllowed && (
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
  )
}
