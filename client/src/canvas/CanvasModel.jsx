import React, { Suspense, useRef } from 'react'

import { Canvas } from '@react-three/fiber'

import Assembled from './Assembled'
import { CanvasLoader } from '../components/'

import { Image as  DreiImage, OrbitControls, PerspectiveCamera, Stats, TransformControls } from '@react-three/drei'
import { AssembledProvider } from '../contexts/AssembledContext'
import { ObjectsProvider } from '../contexts'
import { useSnapshot } from 'valtio'
import appState from '../store'

const CanvasModel = () => {

  const transform = useRef()
  const orbit = useRef()
  const transformObject = useRef({})

  const snap = useSnapshot(appState)

  const assemblyMap = snap.assemblyMap
  const urlData = snap.backgroundObj.backgroundImg
  const setPosition = snap.backgroundObj.position
  const setRotation = snap.backgroundObj.rotation
  const setScale = [snap.backgroundObj.width, snap.backgroundObj.height]

  const transformMode = snap.backgroundObj.mode
  const dist = snap.distanceToCamera.dist
  const height = snap.distanceToCamera.height
  return (
    <Canvas
      className='mainCanvas'
      gl={{ preserveDrawingBuffer: true }}
      resize={{ debounce: 0 }}
      shadows
      dpr={[1,2]}
      frameloop='demand'
    >
      
      <ambientLight intensity={1.9} />
      <PerspectiveCamera 
        makeDefault 
        position = {[dist, height, dist]} 
        fov={25}
      />
      <Suspense fallback={<CanvasLoader />}>
        <ObjectsProvider>
          <AssembledProvider snap={{assemblyMap: JSON.parse(JSON.stringify(assemblyMap))}}>
              <Assembled />
          </AssembledProvider>
        </ObjectsProvider>
      </Suspense>
      {snap.backgroundObj.backgroundImg &&
      <>
        {transformMode != 'none' && 
          <TransformControls 
            ref = {transform}
            showZ={Boolean(transformMode !== 'scale')} 
            mode={transformMode} 
            object={transformObject.current}
          />
        }
        <DreiImage 
          ref={transformObject}
          key={'scalableImage'}
          url={urlData} 
          position={setPosition} 
          rotation={setRotation} 
          scale={setScale}
        />
      </>
      }
      <OrbitControls
        ref={orbit}
        makeDefault
        autoRotate={(transformMode != 'none' && snap.backgroundObj.backgroundImg)  ? false : snap.camRotation}
        minPolarAngle={-Math.PI}
        maxPolarAngle={Math.PI}
        enableZoom={true} 
        target={[0,height,0]} 
      />
      
      <Stats />
    </Canvas>
  )
}

export default CanvasModel