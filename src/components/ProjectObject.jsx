import { useGLTF, Html, Float } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TARGET_SIZE = 1.0

export default function ProjectObject({ project, position, onSelect }) {
  const { scene } = useGLTF(project.model)
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  // Normalizar y centrar el modelo
  const normalized = useMemo(() => {
    const cloned = scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    cloned.scale.setScalar(TARGET_SIZE / maxDim)
    const box2 = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    box2.getCenter(center)
    cloned.position.sub(center)
    return cloned
  }, [scene])

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.006
  })

  const scaleMul = hovered ? 1.25 : 1.0

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group
        position={position}
        onClick={(e) => { e.stopPropagation(); onSelect(project) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <group ref={ref} scale={scaleMul}>
          <primitive object={normalized} />
        </group>
        <pointLight color={project.color} intensity={hovered ? 8 : 2} distance={3} />
        <Html position={[0, -0.8, 0]} center distanceFactor={6}>
          <div style={{
            color: hovered ? '#ffffff' : project.color,
            fontSize: '13px',
            fontFamily: 'Segoe UI, sans-serif',
            fontWeight: 800,
            textShadow: `0 0 12px ${project.color}, 0 0 4px #000`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            letterSpacing: '1.5px',
            padding: '4px 10px',
            background: 'rgba(5,6,15,0.6)',
            border: `1px solid ${project.color}`,
            borderRadius: '4px',
            backdropFilter: 'blur(4px)'
          }}>
            {project.name}
          </div>
        </Html>
      </group>
    </Float>
  )
}
