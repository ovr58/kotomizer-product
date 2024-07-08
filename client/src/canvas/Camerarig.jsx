import { useEffect, useRef } from 'react'

import PropTypes from 'prop-types'

import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

import { useSnapshot } from 'valtio'
import appState from '../store'
import { useFrame } from '@react-three/fiber'
import * as TWEEN from '@tweenjs/tween.js'
// настройка камеры при разных экранах

const Camerarig = ({ dist, type, targetObj }) => {

  const snap = useSnapshot(appState)
  const camera = useRef()
  const controls = useRef()

  useFrame(() => {
    TWEEN.update()
  })

  useEffect(() => {
    controls.current.autoRotate = appState.camRotation
  }, [appState.camRotation])

  useEffect(() => {
    snap.assemblyMap.length>0 && type != 'menu' &&
      snap.assemblyMap[snap.assemblyMap.length - 1].id > 0  &&
        camera.current.position.set(dist.dist, dist.height, dist.dist)
    if (type == 'menu') {
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
    } 
  }, [dist, targetObj])

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault position = {[-2.4, 0, 22]} fov={25}/>
      <OrbitControls
       ref={controls} 
       autoRotate={type == 'menu' ? false : appState.camRotation}
       minPolarAngle={type == 'menu' ? Math.PI/2 : -Math.PI}
       maxPolarAngle={type == 'menu' ? Math.PI/2 : Math.PI}
       enableZoom={true} 
       target={[0,dist.height,0]} />
    </>
  )
}

export default Camerarig

Camerarig.propTypes = {
  dist: PropTypes.object,
}