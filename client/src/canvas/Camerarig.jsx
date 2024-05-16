import { useRef } from 'react'

import PropTypes from 'prop-types'

import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'

import { useSnapshot } from 'valtio'
import state from '../store'

const Camerarig = ({ children }) => {

  const group = useRef()

  const snap = useSnapshot(state)

  useFrame((state, delta) => {
    const isBreakpoint = window.innerWidth <= 1260
    const isMobile = window.innerWidth <= 600

    let targetPosition = [-2.4, 0, -22]

    if (snap.intro) {
      if (isBreakpoint) targetPosition = [2, 0, -22]
      if (isMobile) targetPosition = [2, 0.2, -22.5]
    } else {
      if (isMobile) targetPosition = [2, 0, -22.5]
      else targetPosition = [2, 0, -21.5]
    }

    easing.damp3(state.camera.position, targetPosition, 0.25, delta)

    // easing.dampE(
    //   group.current.rotation,
    //   group.current.rotation,
    //   0.25,
    //   delta
    // )
  })


  return (
    <group ref={group}>{ children }</group>
  )
}

export default Camerarig

Camerarig.propTypes = {
  children: PropTypes.object,
}