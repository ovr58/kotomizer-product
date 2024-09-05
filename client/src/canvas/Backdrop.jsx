import React from 'react'

import { AccumulativeShadows, RandomizedLight } from '@react-three/drei'
// задний план для модели - плоскость, тени, свет
const Backdrop = ({ height }) => {

  return (
    <AccumulativeShadows
      temporal
      frames={60}
      alphaTest={0.45}
      scale={10}
    >
      <RandomizedLight 
        amount={4}
        radius={2}
        intensity={1.55}
        ambient={0.25}
        position={[1.5, height*0.8, 1.5]}
        castShadow
        shadowBias={-0.0001}
      />
      <RandomizedLight 
        amount={5}
        radius={4}
        intensity={1.35}
        ambient={0.25}
        position={[-1.8, height*0.9, -2]}
        castShadow
        shadowBias={-0.0001}
      />
    </AccumulativeShadows>
  )
}

export default Backdrop