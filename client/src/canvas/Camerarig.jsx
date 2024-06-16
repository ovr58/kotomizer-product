import { useEffect, useRef } from 'react'

import PropTypes from 'prop-types'

import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'

// настройка камеры при разных экранах

const Camerarig = ({ dist }) => {

  const camera = useRef()
  const controls = useRef()

  useEffect(() => {
    controls.current.target.copy(new Vector3(0, dist.height, 0))
    camera.current.position.copy(new Vector3(dist.dist, dist.height, dist.dist))
  }, [dist])

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault position = {[-2.4, 0, 22]} fov={25}/>
      <OrbitControls ref={controls} autoRotate={true} enableZoom={true} target={[0,dist.height,0]} />
    </>
  )
}

export default Camerarig

Camerarig.propTypes = {
  dist: PropTypes.object,
}