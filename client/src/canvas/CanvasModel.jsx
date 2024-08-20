import React, { useRef } from 'react'

import { Canvas } from '@react-three/fiber'

import Assembled from './Assembled'
import { Image as  DreiImage, OrbitControls, PerspectiveCamera, TransformControls } from '@react-three/drei'
import { AssembledProvider } from '../contexts/AssembledContext'
import { ObjectsProvider } from '../contexts'
import { useSnapshot } from 'valtio'
import appState from '../store'

const CanvasModel = () => {

  const transform = useRef()
  const orbit = useRef()
  const transformObject = useRef()

  const snap = useSnapshot(appState)

  const assemblyMap = snap.assemblyMap

  const urlData = snap.backgroundObj.backgroundImg
  const setPosition = snap.backgroundObj.position
  const setRotation = snap.backgroundObj.rotation
  const setScale = [snap.backgroundObj.width, snap.backgroundObj.height]

  const transformMode = snap.backgroundObj.mode
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
      <ambientLight intensity={1.9} />
      <PerspectiveCamera 
        makeDefault 
        position = {[dist, height, dist]} 
        fov={25}
      />
      <ObjectsProvider>
        <AssembledProvider snap={{assemblyMap: JSON.parse(JSON.stringify(assemblyMap))}}>
            <Assembled />
        </AssembledProvider>
      </ObjectsProvider>
      {snap.backgroundObj.backgroundImg &&
      <>
        {transformMode != 'none' ? 
        <TransformControls 
          ref = {transform}
          showZ={Boolean(transformMode !== 'scale')} 
          mode={transformMode} 
        >
        <DreiImage 
          key={'scalableImage'}
          url={urlData} 
          position={setPosition} 
          rotation={setRotation} 
          scale={setScale}
          />
        </TransformControls>
        :
        transform.current && 
        <DreiImage 
          ref={transformObject}
          key={'readyImage'}
          url={urlData} 
          position={transform.current.object.position} 
          rotation={transform.current.object.rotation} 
          scale={[transform.current.object.scale.x * setScale[0], transform.current.object.scale.y * setScale[1]]}
        />
        }
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
    </Canvas>
  )
}

export default CanvasModel