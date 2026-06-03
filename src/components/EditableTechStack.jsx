import { useEffect, useRef } from 'react'
import { TransformControls } from '@react-three/drei'
import TechStackWall from './TechStackWall'

/**
 * Wrapper editable para la pared de tech stack.
 * Permite mover/rotar/escalar el panel completo desde modo edición.
 */
export default function EditableTechStack({
  name,
  position,
  rotation,
  size = 1,
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
    groupRef.current.scale.setScalar(size)
  }, [position[0], position[1], position[2], rotation?.[0], rotation?.[1], rotation?.[2], size])

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
    } else if (gizmoMode === 'rotate') {
      onUpdate(name, {
        rot: [
          parseFloat(g.rotation.x.toFixed(3)),
          parseFloat(g.rotation.y.toFixed(3)),
          parseFloat(g.rotation.z.toFixed(3)),
        ],
      })
    } else if (gizmoMode === 'scale') {
      const avgScale = (g.scale.x + g.scale.y + g.scale.z) / 3
      onUpdate(name, { size: parseFloat((avgScale).toFixed(2)) })
    }
  }

  return (
    <>
      <group
        ref={groupRef}
        onClick={(e) => {
          if (editMode) {
            e.stopPropagation()
            onSelect(name)
          }
        }}
      >
        <TechStackWall />
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
