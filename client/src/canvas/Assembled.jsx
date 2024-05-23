import React, { useEffect, useMemo, useRef, useState } from 'react'

import * as THREE from 'three'

import { useSnapshot } from 'valtio';
import state from '../store'

import { positions } from '../config/helpers';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useBoundingBox } from '../hook';

const glowRed = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true, color: new THREE.Color(7, 0, 0.5), toneMapped: false })

const Assembled = () => {
  
  const snap = useSnapshot(state);

  const placedDetail = useRef()

  const findIntersections = useBoundingBox(placedDetail)

  const [animationVector, setAnimationVector] = useState(0.6)

  const [intersections, setIntersections] = useState(findIntersections())
  
  const [prevMeshCount, setPrevMeshCount] = useState(0)
  
  useFrame((state, delta) => {
    
    const opacity = glowRed.opacity
    if (opacity > 0.99) {setAnimationVector(-0.6)} 
    else if (opacity <0.6) {setAnimationVector(0.6)}
    glowRed.opacity += animationVector * delta
    
    const countMeshes = () => {
      let a=[]
      state.scene.traverse((object) => {
        if (object.type == 'Mesh') {
          a.push(object)
      }
      })
      return a
    }

    if (prevMeshCount != countMeshes().toString()) {
      setPrevMeshCount(countMeshes().toString())
      setIntersections(findIntersections())
    }
    
    if (state.scene.getObjectByName('placedDetail')) {
      setIntersections(findIntersections())
    }
    
  })
  
  useEffect (() => {
    state.intersected = intersections
  }, [intersections.toString()])
  
  const stateString = JSON.stringify(snap.assemblyMap) //useCallback?
  const assemblyMap = JSON.parse(stateString)
  
  const listOfChanges = [assemblyMap.length, 0, 0, 0]
  
  if (listOfChanges[0]>0) {
    listOfChanges[1] = assemblyMap[listOfChanges[0]-1].id
    if (assemblyMap[listOfChanges[0]-1].connectedTo.length > 0) {
      listOfChanges[2] = assemblyMap[listOfChanges[0]-1].connectedTo[0].id
      listOfChanges[3] = assemblyMap[listOfChanges[0]-1].connectedTo[0].connector.name
    } 
  }
  
  
  useEffect(() => {
    if (snap.parts.length != 0) {      
      state.assemblyMap = positions(assemblyMap, snap.parts).newAssemblyMap
    }
  }, listOfChanges)

  const objects = useMemo(() => snap.assemblyMap.map((part) => useGLTF(`/${part.name}.glb`)), [snap.assemblyMap])
  
  return (
    <group
      key={stateString}
    >
      {objects.length != 0 &&
       snap.assemblyMap.map((instruction, i) => (
         <mesh
          ref={instruction.id<0 ? placedDetail : null}
          key={JSON.stringify(instruction)}
          name={instruction.id<0 ? 'placedDetail' : 'solidDetail'}
          castShadow 
          receiveShadow 
          position={instruction.position}
          rotation={instruction.rotation}
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