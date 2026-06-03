import { useRef, useEffect, useState } from 'react'
import { TransformControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import Model from './Model'
import ProjectAura from './ProjectAura'

export default function EditableModel({
  name,
  url,
  position,
  targetSize,
  pivot = 'base',
  rotation,
  editMode,
  selected,
  gizmoMode,
  onSelect,
  onUpdate,
  onView,
  animate,
  auraColor,
  screenTransform,
  selectedKey,
}) {
  const groupRef = useRef()
  const innerRef = useRef()
  const screenRef = useRef(null)
  const baseY = useRef(0)
  const tNext = useRef(2)
  const [hovered, setHovered] = useState(false)

  // Animación procedural (solo cuando NO está en edit mode)
  useFrame((state, delta) => {
    if (editMode || !animate || !innerRef.current) return
    const t = state.clock.getElapsedTime()
    if (animate === 'puppy') {
      const breath = Math.sin(t * 3) * 0.015
      const tail   = Math.sin(t * 6) * 0.12
      let hopY = 0
      if (t > tNext.current) {
        const hopT = t - tNext.current
        if (hopT < 0.5) {
          hopY = Math.sin(hopT * Math.PI) * 0.35
        } else {
          tNext.current = t + 2.5 + Math.random() * 3
        }
      }
      innerRef.current.position.y = baseY.current + breath + hopY
      innerRef.current.rotation.y = tail
    } else if (animate === 'float') {
      innerRef.current.position.y = baseY.current + Math.sin(t * 1.5) * 0.08
      innerRef.current.rotation.y += delta * 0.3
    } else if (animate === 'breathe') {
      // Animación elegante para carteles: ligero "respirar" + bobbing minimal sin rotar
      const breathScale = 1 + Math.sin(t * 0.9) * 0.018
      const bob = Math.sin(t * 0.9) * 0.025
      innerRef.current.scale.setScalar(breathScale)
      innerRef.current.position.y = baseY.current + bob
    }
  })

  // Aplicar posición/rotación cuando vienen del layout
  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(...position)
    groupRef.current.rotation.set(...(rotation || [0, 0, 0]))
    groupRef.current.scale.set(1, 1, 1)

    // Si hay transform guardado para la pantalla, aplicarlo (se espera en coordenadas locales)
    try {
      if (screenRef.current && screenTransform) {
        const s = screenTransform
        if (s.pos) screenRef.current.position.set(...s.pos)
        if (s.scale) screenRef.current.scale.set(...s.scale)
      }
    } catch {}
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
      const newSize = parseFloat((targetSize * avgScale).toFixed(2))
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
          if (editMode) {
            e.stopPropagation()
            onSelect(name)
          } else if (onView) {
            e.stopPropagation()
            onView()
          }
        }}
        onPointerOver={onView ? (e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' } : undefined}
        onPointerOut={onView ? () => { setHovered(false); document.body.style.cursor = 'auto' } : undefined}
      >
        <group ref={innerRef}>
          <Model
            url={url}
            targetSize={targetSize}
            pivot={pivot}
          />
          {auraColor && !editMode && (
            <ProjectAura color={auraColor} hovered={hovered} size={Math.max(0.4, targetSize * 0.55)} />
          )}
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
