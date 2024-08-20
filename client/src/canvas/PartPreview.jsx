import React, { useMemo, useRef } from 'react'
import { OrbitControls, PerspectiveCamera, Preload, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Parts } from '../config/constants'
import { getDistance } from '../config/helpers' // дистанция до камеры чтобы вся деталь вмещалась в поле камеры предпросмотра
import * as THREE from 'three'

const PartPreview = ({ clicked }) => {

  const menuPart = useRef()

  const object = useMemo(() => useGLTF(`/${clicked}.glb`))

  const objectGroup = new THREE.Group()
  
  Object.keys(object.nodes).forEach((node) => node.includes('Detail') && objectGroup.add(object.nodes[node]))

  const dist = getDistance(objectGroup)

  return (
    <Canvas
      key={'previewPartCanvas'}
      frameloop='demand'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
    >
      <PerspectiveCamera 
        makeDefault
        position = {[dist.dist, dist.height, dist.dist]} 
        fov={25}
      />
      <OrbitControls
        autoRotate={false}
        enableZoom={true} 
        target={[0,dist.height,0]} 
      />
      <ambientLight intensity={1.25} />
      <directionalLight position={[dist.dist, dist.height, dist.dist]} />
      {object && 
        <group 
          ref = {menuPart}
          key={`${clicked}/previewgroup`}
          name={clicked}
          userData={{available: Parts[clicked].available}}
          position={[0,0,0]}
          castShadow 
          receiveShadow 
        >
          {Object.entries(object.nodes).filter((arr) => arr[0].includes('Detail')).map((subMesh) => (
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
      }
      
      <Preload all />
    </Canvas>
    );
}

export default PartPreview

