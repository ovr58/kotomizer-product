import { useRef, useState } from 'react'

import { Canvas, extend } from '@react-three/fiber'
import { Effects, BakeShadows, Center, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { UnrealBloomPass } from 'three-stdlib'

extend({ UnrealBloomPass }) // эффект глоу материала

import Assembled from './Assembled' // сборщик деталей
import Camerarig from './Camerarig'

const CanvasModel = () => {

  const [ dist, setDist ] = useState({dist: 22, height: 1})

  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: false }}
      className='w-full max-w-full h-full transition-all ease-in'
    >
      <color attach="background" args={['#FFFFFF']} />
      <ambientLight intensity={2.5} />
      <Camerarig dist = {dist} />
        <Assembled setDist={setDist}/>
        <Effects disableGamma>
          <unrealBloomPass threshold={1} strength={0.3} radius={0.5} />
        </Effects>
        <BakeShadows />
    </Canvas>
  )
}

export default CanvasModel