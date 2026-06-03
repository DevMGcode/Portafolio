import { useGLTF, Html, Float } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SHELF_SIZE = 1.4
const MODEL_SIZE = 0.7

/**
 * Repisa montada en la pared con el modelo del proyecto encima, rotando.
 * Sin marcos neón fuertes — look más "vitrina" elegante.
 */
export default function ShelfProject({ project, position, onSelect }) {
  const shelf = useGLTF('/models/repisa.glb')
  const projectGltf = useGLTF(project.model)
  const modelRef = useRef()
  const [hovered, setHovered] = useState(false)

  const shelfObj = useMemo(() => {
    const cloned = shelf.scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    cloned.scale.setScalar(SHELF_SIZE / maxDim)
    const box2 = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    box2.getCenter(center)
    cloned.position.x -= center.x
    cloned.position.z -= center.z
    cloned.position.y -= box2.min.y
    return { obj: cloned, topY: box2.max.y - box2.min.y }
  }, [shelf.scene])

  const projObj = useMemo(() => {
    const cloned = projectGltf.scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    cloned.scale.setScalar(MODEL_SIZE / maxDim)
    const box2 = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    box2.getCenter(center)
    cloned.position.x -= center.x
    cloned.position.z -= center.z
    cloned.position.y -= box2.min.y    // apoyado en y=0 del grupo
    return cloned
  }, [projectGltf.scene])

  useFrame(() => {
    if (modelRef.current) modelRef.current.rotation.y += 0.005
  })

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect(project) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      {/* Repisa */}
      <primitive object={shelfObj.obj} />

      {/* Proyecto encima */}
      <group position={[0, shelfObj.topY + 0.05, 0]}>
        <Float speed={1.5} rotationIntensity={0} floatIntensity={0.15}>
          <group ref={modelRef} scale={hovered ? 1.15 : 1}>
            <primitive object={projObj} />
          </group>
        </Float>
        {/* Luz suave del color del proyecto, sólo en hover */}
        {hovered && <pointLight color={project.color} intensity={3} distance={2} />}
      </group>

      {/* Etiqueta debajo de la repisa */}
      <Html position={[0, -0.15, 0.3]} center distanceFactor={7}>
        <div style={{
          color: hovered ? '#ffffff' : '#c6e8ff',
          fontSize: '12px',
          fontFamily: 'Segoe UI, sans-serif',
          fontWeight: 700,
          textShadow: hovered ? `0 0 10px ${project.color}` : '0 0 6px #000',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          letterSpacing: '1px',
          padding: '3px 9px',
          background: 'rgba(5,6,15,0.7)',
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
