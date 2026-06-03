import { useRef, useEffect } from 'react'
import { TransformControls } from '@react-three/drei'
import ProjectsShelf from './ProjectsShelf'

/**
 * Repisa editable: posición/escala/rotación con gizmos cuando editMode + selected.
 * En modo edición se muestra sólo la repisa (sin proyectos) para que sea más fácil moverla.
 */
export default function EditableShelf({
  name,
  position,
  size,
  rotation,
  projects,
  editMode,
  selected,
  gizmoMode,
  onSelect,
  onSelectProject,
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
      const newSize = parseFloat((size * avgScale).toFixed(2))
      onUpdate(name, { size: newSize })
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
        onClick={(e) => {
          if (!editMode) return
          e.stopPropagation()
          onSelect(name)
        }}
      >
        <ProjectsShelf
          projects={projects}
          shelfSize={size}
          withProjects={!editMode}
          onSelect={onSelectProject}
        />
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
