import { useRef, useEffect } from 'react'
import { TransformControls } from '@react-three/drei'
import MusicEqualizer from './MusicEqualizer'

/**
 * Wrapper editable para MusicEqualizer (mover/rotar/escalar con gizmos).
 */
export default function EditableEqualizer({
  name,
  position,
  rotation,
  bars = 10,
  width = 1.6,
  height = 0.6,
  colorLow = '#00ffff',
  colorHigh = '#ff00ff',
  speed = 2.5,
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
      onUpdate(name, {
        width: parseFloat((width * avgScale).toFixed(2)),
        height: parseFloat((height * avgScale).toFixed(2)),
      })
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
        <MusicEqualizer
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          bars={bars}
          width={width}
          height={height}
          colorLow={colorLow}
          colorHigh={colorHigh}
          speed={speed}
        />
        {editMode && selected && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, 0.05]} />
            <meshBasicMaterial color={colorLow} wireframe transparent opacity={0.4} />
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
