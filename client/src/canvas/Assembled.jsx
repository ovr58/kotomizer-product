import React, { useEffect, useMemo, useRef, useState } from 'react'

import * as THREE from 'three'

import { useSnapshot } from 'valtio';
import state from '../store'

import { positions } from '../config/helpers';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const glowRed = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true, color: new THREE.Color(7, 0, 0.5), toneMapped: false })

const Assembled = () => {
  
  const snap = useSnapshot(state);

  const [animationVector, setAnimationVector] = useState(0.6)

  useFrame((_, delta) => {
    const opacity = glowRed.opacity
    if (opacity > 0.99) {setAnimationVector(-0.6)} 
    else if (opacity <0.6) {setAnimationVector(0.6)}
    glowRed.opacity += animationVector * delta
  })

  const stateString = JSON.stringify(snap.assemblyMap) //useCallback?
  const assemblyMap = JSON.parse(stateString)
  
  useEffect(() => {
    if (snap.parts.length != 0) {      
      state.assemblyMap = positions(assemblyMap, snap.parts).newAssemblyMap
    }
  }, [snap.assemblyMap.length, 
      snap.assemblyMap[assemblyMap.length - 1].id,
      assemblyMap[assemblyMap.length-1].connectedTo[0].id
    ])

  const objects = useMemo(() => snap.assemblyMap.map((part) => useGLTF(`/${part.name}.glb`)), [snap.assemblyMap])
  
  return (
    <group
      key={stateString}
    >
      {objects.length != 0 &&
       snap.assemblyMap.map((instruction, i) => (
         <mesh
          key={JSON.stringify(instruction)}
          castShadow 
          receiveShadow 
          position={instruction.position}
          scale={objects[i].nodes.Detail1.scale}
          geometry={objects[i].nodes.Detail1.geometry}
          material={instruction.id >= 0 ? objects[i].nodes.Detail1.material : glowRed}
         >
        </mesh>
      ))}
    </group>
  )
}

export default Assembled