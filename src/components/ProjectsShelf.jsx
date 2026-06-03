import { useGLTF, Html, Float } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SHELF_SIZE = 4.5
const PROJECT_SIZE = 0.6

/**
 * UNA repisa grande con los 6 proyectos: 2 por nivel × 3 niveles.
 */
export default function ProjectsShelf({ projects, position, rotation = [0, 0, 0], onSelect }) {
  const shelfGltf = useGLTF('/models/repisa.glb')

  const { shelfObj, width, height } = useMemo(() => {
    const cloned = shelfGltf.scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scaleFactor = SHELF_SIZE / maxDim
    cloned.scale.setScalar(scaleFactor)
    const box2 = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    box2.getCenter(center)
    cloned.position.x -= center.x
    cloned.position.z -= center.z
    cloned.position.y -= box2.min.y    // base en y=0
    return {
      shelfObj: cloned,
      width: size.x * scaleFactor,
      height: size.y * scaleFactor,
    }
  }, [shelfGltf.scene])

  // 3 niveles: bottom, middle, top como fracciones de la altura
  const levelHeights = [0.18, 0.50, 0.82].map(f => f * height)
  // 2 columnas dentro de cada nivel
  const colOffsets = [-width * 0.22, width * 0.22]

  return (
    <group position={position} rotation={rotation}>
      <primitive object={shelfObj} />
      {projects.slice(0, 6).map((p, i) => {
        const level = Math.floor(i / 2)   // 0,0,1,1,2,2
        const col = i % 2                 // 0,1,0,1,0,1
        return (
          <ShelfItem
            key={p.id}
            project={p}
            position={[colOffsets[col], levelHeights[level], 0]}
            onSelect={onSelect}
          />
        )
      })}
    </group>
  )
}

function ShelfItem({ project, position, onSelect }) {
  const { scene } = useGLTF(project.model)
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  const normalized = useMemo(() => {
    const cloned = scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    cloned.scale.setScalar(PROJECT_SIZE / maxDim)
    const box2 = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    box2.getCenter(center)
    cloned.position.x -= center.x
    cloned.position.z -= center.z
    cloned.position.y -= box2.min.y   // apoyado encima del nivel
    return cloned
  }, [scene])

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.006
  })

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect(project) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.08}>
        <group ref={ref} scale={hovered ? 1.2 : 1}>
          <primitive object={normalized} />
        </group>
      </Float>
      {hovered && <pointLight color={project.color} intensity={4} distance={1.6} />}
      <Html position={[0, -0.15, 0.3]} center distanceFactor={7}>
        <div style={{
          color: hovered ? '#fff' : '#c6e8ff',
          fontSize: '11px',
          fontWeight: 700,
          textShadow: hovered ? `0 0 10px ${project.color}` : '0 0 4px #000',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          letterSpacing: '0.5px',
          padding: '2px 7px',
          background: 'rgba(5,6,15,0.75)',
          border: `1px solid ${hovered ? project.color : '#1a3050'}`,
          borderRadius: '3px',
          backdropFilter: 'blur(3px)',
          transition: 'all 0.2s'
        }}>
          {project.name}
        </div>
      </Html>
    </group>
  )
}
