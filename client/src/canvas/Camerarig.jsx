import { useEffect, useRef } from 'react'

import PropTypes from 'prop-types'

import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

import { useFrame } from '@react-three/fiber'
import * as TWEEN from '@tweenjs/tween.js'
// настройка камеры при разных экранах

const Camerarig = ({ dist, targetObj }) => {

  const camera = useRef()
  const controls = useRef()

  useFrame(() => {
    TWEEN.update()
  })

  useEffect(() => {
    new TWEEN.Tween(camera.current.position).to(
      {
        x: -dist.dist,
        y: dist.height,
        z: -dist.dist
      },
      2000
    ).easing(TWEEN.Easing.Cubic.Out).start()
  }, [dist.dist])

  return (
    <>
      <PerspectiveCamera key='menuCamera' makeDefault ref={camera} position = {[0, 0, 0]} fov={25}/>
      <OrbitControls
       key='menuOrbitControl'
       ref={controls} 
       autoRotate={false}
       minPolarAngle={Math.PI/2}
       maxPolarAngle={Math.PI/2}
       enableZoom={true} 
       target={[0,dist.height,0]} />
    </>
  )
}

export default Camerarig

Camerarig.propTypes = {
  dist: PropTypes.object,
}