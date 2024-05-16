import React, { useRef } from 'react'

import { useSnapshot } from 'valtio'
import state from '../store'

import { easing } from 'maath'

import { useFrame } from '@react-three/fiber'

import { AccumulativeShadows, RandomizedLight } from '@react-three/drei'

const Backdrop = () => {
  
  const shadows = useRef()

  const snap = useSnapshot(state)
  const stateString = JSON.stringify(snap)

  return (
    <AccumulativeShadows
      key={stateString}
      ref={shadows}
      temporal
      frames={60}
      alphaTest={0.65}
      scale={2}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.14]}
    >
      <RandomizedLight 
        amount={4}
        radius={9}
        intensity={1.55}
        ambient={0.25}
        position={[5, 5, -10]}
      />
      <RandomizedLight 
        amount={6}
        radius={5}
        intensity={1.35}
        ambient={0.55}
        position={[-5, 5, -9]}
      />
    </AccumulativeShadows>
  )
}

export default Backdrop