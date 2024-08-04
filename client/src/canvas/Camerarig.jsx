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
    controls.current.autoRotate = false
    new TWEEN.Tween(controls.current.target).to(
      {
        x: targetObj[0],
        y: targetObj[1],
        z: targetObj[2]
      },
      2100
    ).easing(TWEEN.Easing.Cubic.Out).start()
    new TWEEN.Tween(camera.current.position).to(
      {
        x: targetObj[0]+Math.sign(targetObj[0])*dist.dist,
        y: dist.height,
        z: targetObj[2]+Math.sign(targetObj[2])*dist.dist
      },
      2000
    ).easing(TWEEN.Easing.Cubic.Out).start()
  }, [targetObj])

  return (
    <>
      <PerspectiveCamera key='menuCamera' ref={camera} makeDefault position = {[-2.4, 0, 22]} fov={25}/>
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