import React, { useRef } from 'react'

import { useSnapshot } from 'valtio'
import appState from '../store'

import { AccumulativeShadows, RandomizedLight } from '@react-three/drei'
// задний план для модели - плоскость, тени, свет
const Backdrop = () => {

  const shadows = useRef() // ссылка на тени

  const snap = useSnapshot(appState)
  const stateString = JSON.stringify(snap) // уникальный ключ для обновления картинки

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