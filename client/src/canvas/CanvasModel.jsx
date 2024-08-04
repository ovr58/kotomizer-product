import React from 'react'

import { Canvas } from '@react-three/fiber'

import Assembled from './Assembled'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { AssembledProvider } from '../contexts/AssembledContext'
import { TextureProvider } from '../contexts/TextureContext'
import { useSnapshot } from 'valtio'
import appState from '../store'

const CanvasModel = () => {

  const snap = useSnapshot(appState)

  const dist = snap.distanceToCamera.dist
  const height = snap.distanceToCamera.height
  console.log('rendered CanvasComponent - ')
  return (
    <Canvas
      className='mainCanvas'
      gl={{ preserveDrawingBuffer: true }}
      resize={{ debounce: 0 }}
      shadows
      >
      <ambientLight intensity={2.5} />
      <PerspectiveCamera 
        makeDefault 
        position = {[dist, height, dist]} 
        fov={25}
        />
      <OrbitControls
        autoRotate={snap.camRotation}
        minPolarAngle={-Math.PI}
        maxPolarAngle={Math.PI}
        enableZoom={true} 
        target={[0,height,0]} 
        />
      <TextureProvider>
        <AssembledProvider snap={{assemblyMap: JSON.parse(JSON.stringify(snap.assemblyMap))}}>
            <Assembled />
        </AssembledProvider>
      </TextureProvider>
    </Canvas>
  )
}

export default CanvasModel