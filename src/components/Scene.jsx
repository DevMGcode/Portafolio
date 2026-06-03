import { OrbitControls, Environment, ContactShadows, MeshReflectorMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import EditableModel from './EditableModel'
import EditableSoundWave from './EditableSoundWave'
import EditableEqualizer from './EditableEqualizer'
import EditableDashboard from './EditableDashboard'
import EditableTechStack from './EditableTechStack'
import EditableProp from './EditableProp'
import PulsingLight from './PulsingLight'
import Room from './Room'
import CameraKeyboardControls from './CameraKeyboardControls'
import SoundWaves from './SoundWaves'
import CeilingClouds from './CeilingClouds'
import DustParticles from './DustParticles'
import LampLight from './LampLight'
import MugSteam from './MugSteam'
import { makeFloorTexture } from './textures'
import { PROJECTS } from '../data/projects'

// __LAYOUT_START__
export const INITIAL_LAYOUT = {
  escritorio      : { url: '/models/escritorio.glb', pivot: 'base', pos: [0, 0, 0], size: 3 },
  silla           : { url: '/models/silla.glb', pivot: 'base', pos: [0, 0, 1.32], size: 2.6, rot: [0, 3.141592653589793, 0] },
  planta          : { url: '/models/planta.glb', pivot: 'base', pos: [-5.06, -0.11, -0.01], size: 2.6 },
  monitores       : { url: '/models/monitores.glb', pivot: 'base', pos: [-0.05, 1.59, -0.25], size: 2.58, rot: [0, 1.361, 0] },
  teclado         : { url: '/models/teclado.glb', pivot: 'base', pos: [0.03, 1.55, 0.09], size: 1, rot: [-0.012, -0.008, 0.002] },
  telefono        : { url: '/models/telefono.glb', pivot: 'base', pos: [1.25, 1.58, -0.39], size: 0.5, rot: [-3.142, 0.679, -3.142] },
  trofeo          : { url: '/models/trofeo.glb', pivot: 'base', pos: [3.9, 3.64, -5.26], size: 0.6, rot: [0, 0.078, 0] },
  repisa          : { url: '/models/repisa.glb', pivot: 'base', pos: [3.36, 1.05, -5.35], size: 4.5, rot: [0, -1.549, 0] },
  libros1         : { url: '/models/libros1.glb', pivot: 'base', pos: [2.47, 3.01, -5.08], size: 0.8, rot: [0.784, -0.024, -1.469] },
  libros1_b       : { url: '/models/libros1.glb', pivot: 'base', pos: [2.09, 2.22, -5], size: 0.7, rot: [0.787, -0.019, -1.556] },
  libros1_c       : { url: '/models/libros1.glb', pivot: 'base', pos: [4, 2.99, -5.15], size: 0.01, rot: [0.706, -0.019, -1.54] },
  libros1_d       : { url: '/models/libros1.glb', pivot: 'base', pos: [3.64, 2.99, -5.21], size: 0.85, rot: [0.589, -0.007, -1.564] },
  libros1_e       : { url: '/models/libros1.glb', pivot: 'base', pos: [3.65, 1.88, -4.96], size: 0.7, rot: [0, -1.549, 0] },
  libros2         : { url: '/models/libros2.glb', pivot: 'base', pos: [1.46, 3.01, -5.12], size: 0.8, rot: [0.036, 0, -1.558] },
  equipo_sonido   : { url: '/models/equipo-sonido.glb', pivot: 'base', pos: [-4.43, -0.05, 4.77], size: 3.54, rot: [3.141, 0.567, 3.141] },
  letrero         : { url: '/models/letrero.glb', pivot: 'base', pos: [5.85, 3.81, -1.85], size: 2, rot: [-0.118, -1.555, -0.07] },
  lampara_techo   : { url: '/models/lampara-techo.glb', pivot: 'center', pos: [0, 5.85, 0.24], size: 2.64, rot: [0, 0, 0] },
  p_new_styles    : { url: '/models/proj-new-styles.glb', projectId: 'new-styles', pivot: 'base', pos: [-5.98, 0.54, -2.83], size: 4.85, rot: [-3.142, 1.546, -3.142] },
  p_bendita_joya  : { url: '/models/proj-bendita-joya.glb', projectId: 'bendita-joya', pivot: 'base', pos: [0.12, 3.13, -5.63], size: 0.93, rot: [0.037, 0.044, -0.004], animate: 'float' },
  p_dashboard     : { url: '/models/proj-dashboard.glb', projectId: 'dashboard', pivot: 'base', pos: [0.65, 2.04, -0.27], size: 0.81, rot: [0, -0.336, 0] },
  p_paseaperros   : { url: '/models/proj-paseaperros.glb', projectId: 'paseaperros', pivot: 'base', pos: [4.6, 0, -0.26], size: 0.8, rot: [0, -1.058, 0], animate: 'puppy' },
  p_blog_js       : { url: '/models/proj-blog-js.glb', projectId: 'blog-js', pivot: 'base', pos: [-0.99, 1.59, 0.41], size: 0.6, rot: [0.114, 0.557, -0.115] },
  p_comandas      : { url: '/models/proj-comandas.glb', projectId: 'comandas', pivot: 'base', pos: [2.62, 3.66, -5.11], size: 0.6, rot: [0.016, 0.182, -0.035] },
  wave_left       : { kind: 'sound', pos: [-5.32, 1.12, 3.68], rot: [0, -0.631, 0], colorA: '#00ffff', colorB: '#ff00ff', maxRadius: 0.55, speed: 1.5, count: 4 },
  wave_right      : { kind: 'sound', pos: [-3.06, 1.13, 5.1], rot: [0, -0.533, 0], colorA: '#ff00ff', colorB: '#00ffff', maxRadius: 0.55, speed: 1.5, count: 4 },
  wave_left_bot   : { kind: 'sound', pos: [-5.3, 0.57, 3.67], rot: [0, -0.543, 0], colorA: '#ff00ff', colorB: '#00ffff', maxRadius: 0.45, speed: 1.1, count: 3 },
  wave_right_bot  : { kind: 'sound', pos: [-3.06, 0.55, 5.1], rot: [0, -0.533, 0], colorA: '#00ffff', colorB: '#ff00ff', maxRadius: 0.45, speed: 1.1, count: 3 },
  wave_floor      : { kind: 'sound', pos: [-4.44, 0.04, 4.77], colorA: '#ff00ff', colorB: '#00ffff', maxRadius: 2, speed: 0.55, count: 3, emitTowards: 'floor' },
  equalizer       : { kind: 'eq', pos: [-4.25, 2.23, 4.44], rot: [0, -0.6, 0], bars: 12, width: 0.52, height: 0.19, colorLow: '#00ffff', colorHigh: '#ff00ff', speed: 2.8 },
  live_metrics    : { kind: 'dashboard', pos: [-0.77, 2.28, -0.35], rot: [0, 0.352, 0], size: 1 },
  tech_stack      : { kind: 'techstack', pos: [5.87, 2.69, -1.92], rot: [0, -1.5707, 0], size: 1 },
  avatar          : { url: '/models/Avatar.glb', pivot: 'base', pos: [1.58, 0.02, 1.85], size: 3, rot: [-3.1, 0.896, -3.127] },
  taza_cafe       : { url: '/models/tazadecafe.glb', pivot: 'base', pos: [1.64, 1.55, 0.17], size: 0.37, rot: [0, 0, 0] },
  taza_efectos    : { kind: 'prop', type: 'mugsteam', pos: [1.58, 1.44, 0.16], rot: [0, 0, 0], size: 1.98, accentColor: '#ff66cc' },
  mouse           : { url: '/models/mouse.glb', pivot: 'base', pos: [0.76, 1.6, 0.23], size: 0.33, rot: [3.141, -0.221, 3.141] },
  wall_display    : { kind: 'prop', type: 'walldisplay', pos: [-1.04, 3.36, 5.78], rot: [-3.142, 0.027, -3.142], size: 1 },
  puerta          : { kind: 'prop', type: 'cyberdoor', pos: [3.35, 2.21, 5.93], rot: [0, 3.141592653589793, 0], size: 1.73 },
}
// __LAYOUT_END__

export default function Scene({ onSelectProject, onOpenAboutMe, editMode, selectedItem, onSelectItem, layout, onUpdateLayout, gizmoMode, cameraMode, onCameraMode, onTourIndex }) {
  const controlsRef = useRef()
  const floorTexture = useMemo(() => makeFloorTexture(), [])
  return (
    <>
      <ambientLight intensity={0.42} />
      <pointLight position={[3, 4, 3]} intensity={12} color="#00ffff" distance={14} />
      <pointLight position={[-3, 4, -2]} intensity={10} color="#ff00ff" distance={14} />
      <spotLight position={[0, 5.5, 2]} angle={0.65} penumbra={0.75} intensity={11} color="#fff4dd" castShadow />
      <pointLight position={[0, 5.7, 0]} intensity={2.4} color="#7fd9ff" distance={10} />

      {/* HABITACIÓN: paredes, techo, ventana, alfombra */}
      <Room />

      {/* Humo cyberpunk sutil flotando en el techo (atmósfera) */}
      <CeilingClouds count={6} ceilingY={5.6} roomSize={10} />

      {/* Partículas de polvo cinemáticas (dust motes con drift) */}
      <DustParticles count={90} roomSize={11} roomHeight={5.5} />

      {/* Luz LED real saliendo de la lámpara de techo */}
      {layout.lampara_techo && <LampLight position={layout.lampara_techo.pos} />}


      {/* Piso con reflejos MUY sutiles cyberpunk — hex + ~20% reflexión borrosa */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[12, 12]} />
        <MeshReflectorMaterial
          map={floorTexture}
          color="#ffffff"
          mirror={0}
          mixStrength={0.22}
          mixBlur={6}
          blur={[600, 300]}
          resolution={256}
          depthScale={0.5}
          minDepthThreshold={0.9}
          maxDepthThreshold={1}
          roughness={0.85}
          metalness={0.2}
        />
      </mesh>
      {/* Piso exterior muy oscuro (por si la cámara ve afuera del cuarto) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#02030a" roughness={1} metalness={0} />
      </mesh>

      {/* MUEBLES + REPISA + PROYECTOS + ONDAS — todos editables */}
      {Object.entries(layout).map(([name, item]) => {
        if (item.kind === 'sound') {
          return (
            <EditableSoundWave
              key={name}
              name={name}
              position={item.pos}
              rotation={item.rot}
              colorA={item.colorA}
              colorB={item.colorB}
              maxRadius={item.maxRadius}
              speed={item.speed}
              count={item.count}
              emitTowards={item.emitTowards || 'horizontal'}
              editMode={editMode}
              selected={selectedItem === name}
              gizmoMode={gizmoMode}
              onSelect={onSelectItem}
              onUpdate={onUpdateLayout}
            />
          )
        }
        if (item.kind === 'eq') {
          return (
            <EditableEqualizer
              key={name}
              name={name}
              position={item.pos}
              rotation={item.rot}
              bars={item.bars}
              width={item.width}
              height={item.height}
              colorLow={item.colorLow}
              colorHigh={item.colorHigh}
              speed={item.speed}
              editMode={editMode}
              selected={selectedItem === name}
              gizmoMode={gizmoMode}
              onSelect={onSelectItem}
              onUpdate={onUpdateLayout}
            />
          )
        }
        if (item.kind === 'dashboard') {
          return (
            <EditableDashboard
              key={name}
              name={name}
              position={item.pos}
              rotation={item.rot}
              size={item.size}
              editMode={editMode}
              selected={selectedItem === name}
              gizmoMode={gizmoMode}
              onSelect={onSelectItem}
              onUpdate={onUpdateLayout}
            />
          )
        }
        if (item.kind === 'techstack') {
          return (
            <EditableTechStack
              key={name}
              name={name}
              position={item.pos}
              rotation={item.rot}
              size={item.size}
              editMode={editMode}
              selected={selectedItem === name}
              gizmoMode={gizmoMode}
              onSelect={onSelectItem}
              onUpdate={onUpdateLayout}
            />
          )
        }
        if (item.kind === 'prop') {
          return (
            <EditableProp
              key={name}
              name={name}
              type={item.type}
              position={item.pos}
              rotation={item.rot}
              size={item.size}
              color={item.color}
              accentColor={item.accentColor}
              editMode={editMode}
              selected={selectedItem === name}
              gizmoMode={gizmoMode}
              onSelect={onSelectItem}
              onUpdate={onUpdateLayout}
            />
          )
        }
        const project = item.projectId ? PROJECTS.find(p => p.id === item.projectId) : null
        // Caso especial: el teléfono abre WhatsApp al hacer click (no en modo edición)
        const isPhone = name === 'telefono'
        const phoneHandler = isPhone ? () => {
          // Mensaje simple sin emojis para máxima compatibilidad (WhatsApp Web/Mobile/Desktop)
          const msg = '¡Hola Melissa! Me gustaría charlar con vos sobre un proyecto'
          window.open(`https://wa.me/573225402781?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
        } : undefined
        // Caso especial: el avatar abre el modal "Sobre Mí"
        const isAvatar = name === 'avatar'
        const avatarHandler = isAvatar && onOpenAboutMe ? () => onOpenAboutMe() : undefined
        return (
          <EditableModel
            key={name}
            name={name}
            url={item.url}
            position={item.pos}
            targetSize={item.size}
            pivot={item.pivot}
            rotation={item.rot || [0, 0, 0]}
            editMode={editMode}
            selected={selectedItem === name || selectedItem === `${name}:screen`}
            selectedKey={selectedItem}
            gizmoMode={gizmoMode}
            onSelect={onSelectItem}
            onUpdate={onUpdateLayout}
            onView={project ? () => onSelectProject(project) : (phoneHandler || avatarHandler)}
            animate={item.animate}
            auraColor={project?.color || (isPhone ? '#ffb3d9' : (isAvatar ? '#a78bfa' : undefined))}
            screenTransform={item.screen}
          />
        )
      })}

      {/* Luz suave detrás del letrero — proyección elegante en la pared */}
      {!editMode && layout.letrero && (
        <>
          <PulsingLight
            position={[layout.letrero.pos[0] + 0.3, layout.letrero.pos[1], layout.letrero.pos[2]]}
            color="#ff66cc"
            baseIntensity={1.2}
            pulseIntensity={1.8}
            distance={3.5}
            bpm={28}
          />
          <PulsingLight
            position={[layout.letrero.pos[0] - 0.4, layout.letrero.pos[1] - 0.3, layout.letrero.pos[2] + 0.5]}
            color="#00e5ff"
            baseIntensity={0.5}
            pulseIntensity={0.8}
            distance={2}
            bpm={35}
          />
        </>
      )}

      {/* Luces que pulsan en los bafles (efecto subwoofer latiendo) */}
      {!editMode && layout.equipo_sonido && (() => {
        const eq = layout.equipo_sonido
        return (
          <>
            <PulsingLight position={[eq.pos[0] - 1.3, eq.pos[1] + 0.7, eq.pos[2] + 0.5]} color="#00ffff" baseIntensity={0.8} pulseIntensity={4} distance={3} bpm={95} />
            <PulsingLight position={[eq.pos[0] + 1.3, eq.pos[1] + 0.7, eq.pos[2] + 0.5]} color="#ff00ff" baseIntensity={0.8} pulseIntensity={4} distance={3} bpm={95} />
            <PulsingLight position={[eq.pos[0], eq.pos[1] + 2.5, eq.pos[2]]} color="#00ffff" baseIntensity={0.5} pulseIntensity={3} distance={5} bpm={47.5} />
          </>
        )
      })()}

      <ContactShadows position={[0, 0.02, 0]} opacity={0.5} scale={20} blur={2.5} far={5} />
      <Environment preset="night" />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={true}
        screenSpacePanning={true}
        minDistance={1}
        maxDistance={30}
        zoomSpeed={0.9}
        rotateSpeed={0.65}
        maxPolarAngle={Math.PI / 2 - 0.02}
        target={[0, 2, -1]}
      />
      <CameraKeyboardControls controlsRef={controlsRef} speed={8} cameraMode={cameraMode} onUserInteract={onCameraMode} onTourIndex={onTourIndex} />
    </>
  )
}
