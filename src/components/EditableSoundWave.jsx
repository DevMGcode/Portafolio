import { useRef, useEffect } from 'react'
import { TransformControls } from '@react-three/drei'
import SoundWaves from './SoundWaves'

/**
 * Wrapper editable para SoundWaves: renderiza las ondas + un click-target invisible
 * para que el usuario pueda seleccionarlas con click en Modo edición y arrastrarlas con gizmos.
 */
export default function EditableSoundWave({
  name,
  position,
  rotation,
  colorA = '#00ffff',
  colorB = '#ff00ff',
  maxRadius = 0.5,
  speed = 1.5,
  count = 4,
  emitTowards = 'horizontal',
  editMode,
  selected,
  gizmoMode,
  onSelect,
  onUpdate,
}) {
  const groupRef = useRef()

  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(...position)
    groupRef.current.rotation.set(...(rotation || [0, 0, 0]))
    groupRef.current.scale.set(1, 1, 1)
  }, [position[0], position[1], position[2], rotation?.[0], rotation?.[1], rotation?.[2]])

  const handleChange = () => {
    if (!groupRef.current) return
    const g = groupRef.current
    if (gizmoMode === 'translate') {
      onUpdate(name, {
        pos: [
          parseFloat(g.position.x.toFixed(2)),
          parseFloat(g.position.y.toFixed(2)),
          parseFloat(g.position.z.toFixed(2)),
        ],
      })
    } else if (gizmoMode === 'scale') {
      const avgScale = (g.scale.x + g.scale.y + g.scale.z) / 3
      const newRadius = parseFloat((maxRadius * avgScale).toFixed(2))
      onUpdate(name, { maxRadius: newRadius })
      g.scale.set(1, 1, 1)
    } else if (gizmoMode === 'rotate') {
      onUpdate(name, {
        rot: [
          parseFloat(g.rotation.x.toFixed(3)),
          parseFloat(g.rotation.y.toFixed(3)),
          parseFloat(g.rotation.z.toFixed(3)),
        ],
      })
    }
  }

  return (
    <>
      <group
        ref={groupRef}
        onClick={editMode ? (e) => { e.stopPropagation(); onSelect(name) } : undefined}
      >
        {/* Ondas visibles */}
        <SoundWaves
          position={[0, 0, 0]}
          count={count}
          colorA={colorA}
          colorB={colorB}
          maxRadius={maxRadius}
          speed={speed}
          emitTowards={emitTowards}
        />
        {/* Click-target invisible (sólo en edit mode) para que se pueda clickear */}
        {editMode && (
          <mesh visible={false}>
            <sphereGeometry args={[Math.max(0.3, maxRadius * 0.6), 8, 8]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}
        {/* Indicador visible cuando seleccionada */}
        {editMode && selected && (
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color={colorA} transparent opacity={0.7} />
          </mesh>
        )}
      </group>
      {editMode && selected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={gizmoMode}
          size={0.8}
          onObjectChange={handleChange}
        />
      )}
    </>
  )
}
