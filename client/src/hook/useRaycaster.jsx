import { useThree } from '@react-three/fiber'
import { useMemo } from 'react';
import { Object3D, Raycaster, Vector3 } from 'three'

import PropTypes from 'prop-types'

// it works only for detection of the collision is happend
export const useForwardRaycast = (obj) => {

    const rayCaster = useMemo(() => new Raycaster(), [])

    const scene = useThree(state => state.scene)

    return () => {
        if (obj.current) {
            const originPoint = obj.current.position.clone()
            
            let vertexArray = []

            for (let coordIndex = 0; coordIndex < obj.current.geometry.attributes.position.array.length; coordIndex+=3) {
                let x = obj.current.geometry.attributes.position.array[coordIndex]
                let y = obj.current.geometry.attributes.position.array[coordIndex+1]
                let z = obj.current.geometry.attributes.position.array[coordIndex+2]
                vertexArray.push(new Vector3(x,y,z))
            }
            for (let vertexIndex = 0; vertexIndex < vertexArray.length; vertexIndex++) {
                let localVertex = vertexArray[vertexIndex].clone()
                let globalVertex = localVertex.applyMatrix4(obj.current.matrix)
                let directionVector = globalVertex.sub(obj.current.position)

                rayCaster.set(
                    originPoint, directionVector.clone().normalize()
                )

                let collisionResults = rayCaster.intersectObjects(scene.children)

                if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                    return true
                }
            }
        } else {
            return false
        }
}};

useForwardRaycast.propTypes = {
    obj: {current: Object3D}
  }