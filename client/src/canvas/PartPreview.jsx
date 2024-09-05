import React, { useEffect, useRef, useState } from 'react'
import { OrbitControls, PerspectiveCamera, Preload } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { getDistance } from '../config/helpers' // дистанция до камеры чтобы вся деталь вмещалась в поле камеры предпросмотра
import { Group } from 'three'
import * as TWEEN from '@tweenjs/tween.js'

const Model = ({clicked, object}) => {

  let dist = {dist: 1, height: 1}

  let nodes = new Group()

  const objectNodes = Object.keys(object.nodes).filter(
      (nodeName) => nodeName.includes('Detail')
    ).map(
      (nodeName) => object.nodes[nodeName]
    )
  nodes = new Group().add(...objectNodes)
  dist = getDistance(nodes)
  
  const objectToMove = useRef()
  
  useFrame(() => {
    TWEEN.update()
  })

  useEffect(() => {
    if(objectToMove.current) {
      new TWEEN.Tween(objectToMove.current.position).to(
        {
          x: 0,
          y: 0,
          z: 0
        }, 500
      ).easing(TWEEN.Easing.Cubic.Out).start()
      }
    }
  , [clicked])

  return (
    <>
      <OrbitControls
        makeDefault
        autoRotate={false}
        enableZoom={true} 
        target={[0,dist.height,0]} 
      />
      <PerspectiveCamera 
        makeDefault
        position = {[dist.dist, dist.height, dist.dist]} 
        fov={25}
      />
      
      <ambientLight intensity={1.25} />
      <directionalLight position={[dist.dist, dist.height, dist.dist]} />
      <group 
        ref={objectToMove}
        key={`${clicked}/previewgroup`}
        name={`${clicked}`}
        position={[-window.innerWidth,0,0]}
        castShadow 
        receiveShadow 
      >
        {Object.entries(nodes.children).map((subMesh) => (
          <mesh 
            key={`${subMesh[0]}`}
            geometry={subMesh[1].geometry}
          >
            <meshStandardMaterial 
              {...subMesh[1].material} 
            />
          </mesh>
        ))}
      </group>
    </>
  )
}

const PartPreview = ({ clicked, object }) => {

  return (
    <Canvas
      key={'previewPartCanvas'}
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Model clicked={clicked} object={object} />
    <Preload all />
    </Canvas>
  );
}

export default PartPreview

