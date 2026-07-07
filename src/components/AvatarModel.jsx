import { useEffect, useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { assetPath } from '../utils/assetPath'

export default function AvatarModel({ url, targetSize = 1, pivot = 'base' }) {
  const mixerRef = useRef(null)

  // Mesh + esqueleto con texturas (AvatarH) y animación (Typing.glb, misma jerarquía CC4).
  const { scene } = useGLTF(assetPath('/models/AvatarH.glb'))
  const { animations } = useGLTF(assetPath('/models/Animaciones/Typing.glb'))

  // Clon con SkeletonUtils (preserva el skin binding). IMPORTANTE: NO se reescala
  // el rig — los boneInverses del esqueleto se calculan a la escala natural y
  // escalar el clon amplifica las traslaciones de hueso, reventando el skinning
  // (el modelo "explota" fuera de la escena). El AvatarH ya viene a buen tamaño;
  // EditableModel lo coloca/orienta. Solo centramos en X/Z y apoyamos en el piso
  // mediante traslación del root (las traslaciones no rompen el bind).
  const { object, hitbox } = useMemo(() => {
    const cloned = skeletonClone(scene)

    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)
    cloned.position.x -= center.x
    cloned.position.z -= center.z
    if (pivot === 'base') cloned.position.y -= box.min.y
    else cloned.position.y -= center.y

    // El boundingSphere en espacio bind puede provocar frustum culling indebido.
    cloned.traverse(o => { if (o.isSkinnedMesh) o.frustumCulled = false })

    // Hitbox invisible: el raycaster usa el boundingSphere (en pose bind, escala
    // 0.01) del SkinnedMesh, que queda diminuto pegado al piso → la avatar no es
    // clickeable para seleccionarla/moverla en edición ni para abrir "Sobre mí".
    // `setFromObject` tampoco sirve aquí (mide la pose bind escalada, no la real
    // deformada por huesos), así que usamos una caja generosa con el tamaño real
    // medido de la pose sentada (centro algo adelantado por la inclinación al
    // teclear). Va dentro del grupo editable, así hereda selección y gizmo.
    const hb = { size: [1.1, 2.9, 1.5], pos: [0, 2.0, 0.4] }
    return { object: cloned, hitbox: hb }
  }, [scene, pivot])

  // Animación de typing. El clip de Mixamo trae root motion en el nodo "Armature"
  // (translation/rotation en unidades FBX) que desplaza todo el rig: nos quedamos
  // SOLO con las rotaciones de los huesos para un typing en el sitio.
  useEffect(() => {
    if (!animations?.length) return
    const src = animations.find(a => a.name === 'mixamo.com')
      ?? animations.find(a => !/t-?pose/i.test(a.name))
      ?? animations[0]
    if (!src) return

    const tracks = src.tracks.filter(t =>
      t.name.endsWith('.quaternion') && !t.name.startsWith('Armature.'))
    const clip = new THREE.AnimationClip('typing', src.duration, tracks)

    const mixer = new THREE.AnimationMixer(object)
    mixerRef.current = mixer
    mixer.clipAction(clip).reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.3).play()

    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(object)
      mixerRef.current = null
    }
  }, [object, animations])

  useFrame((_, delta) => {
    mixerRef.current?.update(delta)
  })

  return (
    <>
      <primitive object={object} />
      {/* Caja invisible para que la avatar sea clickeable/seleccionable */}
      <mesh position={hitbox.pos}>
        <boxGeometry args={hitbox.size} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}

useGLTF.preload(assetPath('/models/AvatarH.glb'))
useGLTF.preload(assetPath('/models/Animaciones/Typing.glb'))
