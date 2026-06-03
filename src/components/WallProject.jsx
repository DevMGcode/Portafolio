import { useGLTF, Html } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FRAME_SIZE = 1.4
const MODEL_SIZE = 0.9

/**
 * Cuadro/marco holográfico colgado en la pared con el modelo 3D adentro.
 */
export default function WallProject({ project, position, rotation = [0, 0, 0], onSelect }) {
  const { scene } = useGLTF(project.model)
  const modelRef = useRef()
  const [hovered, setHovered] = useState(false)

  const normalized = useMemo(() => {
    const cloned = scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    cloned.scale.setScalar(MODEL_SIZE / maxDim)
    const box2 = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    box2.getCenter(center)
    cloned.position.sub(center)
    return cloned
  }, [scene])

  useFrame(() => {
    if (modelRef.current) modelRef.current.rotation.y += 0.005
  })

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect(project) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      {/* Marco exterior */}
      <mesh>
        <boxGeometry args={[FRAME_SIZE + 0.1, FRAME_SIZE + 0.1, 0.08]} />
        <meshStandardMaterial color="#0a0e1f" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Borde neón */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[FRAME_SIZE + 0.05, FRAME_SIZE + 0.05, 0.04]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered ? 5 : 2.5}
          toneMapped={false}
        />
      </mesh>
      {/* Fondo holográfico oscuro */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[FRAME_SIZE - 0.1, FRAME_SIZE - 0.1]} />
        <meshStandardMaterial color="#000814" />
      </mesh>
      {/* Modelo 3D rotando dentro del marco */}
      <group position={[0, 0, 0.4]} scale={hovered ? 1.1 : 1}>
        <primitive ref={modelRef} object={normalized} />
      </group>
      {/* Halo de luz cuando hover */}
      {hovered && <pointLight color={project.color} intensity={6} distance={2.5} position={[0, 0, 0.5]} />}
      {/* Etiqueta debajo */}
      <Html position={[0, -(FRAME_SIZE / 2) - 0.2, 0.1]} center distanceFactor={6}>
        <div style={{
          color: hovered ? '#ffffff' : project.color,
          fontSize: '14px',
          fontFamily: 'Segoe UI, sans-serif',
          fontWeight: 800,
          textShadow: `0 0 12px ${project.color}, 0 0 4px #000`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          letterSpacing: '1.5px',
          padding: '4px 12px',
          background: 'rgba(5,6,15,0.7)',
          border: `1px solid ${project.color}`,
          borderRadius: '4px',
          backdropFilter: 'blur(4px)'
        }}>
          {project.name}
        </div>
      </Html>
    </group>
  )
}
