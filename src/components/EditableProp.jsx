import { useEffect, useRef } from 'react'
import { TransformControls } from '@react-three/drei'
import CoffeeMug from './CoffeeMug'
import MugSteam from './MugSteam'
import WallDisplay from './WallDisplay'
import CyberDoor from './CyberDoor'

/**
 * Wrapper editable para props procedurales (no-GLB).
 * Switchea según `type` (mug, mouse, postit, etc.) y permite mover/rotar/escalar.
 */
export default function EditableProp({
  name,
  type,
  position,
  rotation,
  size = 1,
  color,
  accentColor,
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
    groupRef.current.scale.set(1, 1, 1)        // outer scale siempre 1 — el size va en el inner group
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
    } else if (gizmoMode === 'rotate') {
      onUpdate(name, {
        rot: [
          parseFloat(g.rotation.x.toFixed(3)),
          parseFloat(g.rotation.y.toFixed(3)),
          parseFloat(g.rotation.z.toFixed(3)),
        ],
      })
    } else if (gizmoMode === 'scale') {
      // Patrón EditableModel: outer scale es factor relativo, se multiplica por size actual
      const avg = (g.scale.x + g.scale.y + g.scale.z) / 3
      const newSize = parseFloat((size * avg).toFixed(2))
      onUpdate(name, { size: newSize })
      g.scale.set(1, 1, 1)                     // reset outer scale para próxima edición
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
        {/* Inner group con el size real — re-aplica scale cuando size cambia */}
        <group scale={[size, size, size]}>
          {type === 'mug' && <CoffeeMug color={color} accentColor={accentColor} />}
          {type === 'mugsteam' && (
            <MugSteam
              position={[0, 0, 0]}
              mugHeight={0.18}
              rimRadius={0.055}
              baseRadius={0.05}
              coasterColor={accentColor || '#ff66cc'}
            />
          )}
          {type === 'walldisplay' && <WallDisplay />}
          {type === 'cyberdoor' && <CyberDoor />}
        </group>
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
