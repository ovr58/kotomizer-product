import { useMemo } from 'react'

import { Canvas, extend } from '@react-three/fiber'
import { Effects, BakeShadows, Center, OrbitControls, useGLTF } from '@react-three/drei'
import { UnrealBloomPass } from 'three-stdlib'

extend({ UnrealBloomPass })

import { useSnapshot } from 'valtio'
import state from '../store' 

import Assembled from './Assembled'
import { Parts } from '../config/constants'
import { getDistance } from '../config/helpers'


const CanvasModel = () => {

  const snap = useSnapshot(state)

  state.parts = useMemo(() => Parts.map((part) => useGLTF(`/${part.name}.glb`)), [])

  let dist

  if (snap.parts.length !== 0) {
    dist = useMemo(() => getDistance(snap.parts, snap.assemblyMap), [snap.assemblyMap.length])
  } else {
    dist = 22
  }

  return (
    <Canvas
      shadows
      camera={{position: [-2.4, 0, -dist], fov: 25}}
      gl={{ preserveDrawingBuffer: true, antialias: false }}
      className='w-full max-w-full h-full transition-all ease-in'
    >
      <color attach="background" args={['#FFFFFF']} />
      <ambientLight intensity={2.5} />
        <Center>
          <Assembled />
          <Effects disableGamma>
            <unrealBloomPass threshold={1} strength={0.3} radius={0.5} />
          </Effects>
          <BakeShadows />
          <OrbitControls autoRotate={true} enableZoom={true} />
        </Center>
    </Canvas>
  )
}

export default CanvasModel