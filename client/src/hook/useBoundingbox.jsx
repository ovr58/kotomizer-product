import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber'

import * as THREE from 'three'

export const useBoundingBox = (obj) => {

    const scene = useThree(state => state.scene)

    const boxToCheck = new THREE.Box3()

    const traverseScene = () => {
        let a = []
        scene.traverse((object) => {
            if (object.type == 'Mesh') {
                a.push(object)
            }
        })

        return a
    }

    const getAllBoxesExeptChecked = () => {
        if (obj.current && allMeshes.length>0) {
            let a = []
            let allMeshesExeptChecked = allMeshes.filter((object) => 
                        object.uuid != obj.current.uuid)
            for (let meshIndex = 0; meshIndex < allMeshesExeptChecked.length; meshIndex++) {
                a.push(boxToCheck.clone().setFromObject(allMeshesExeptChecked[meshIndex]))
            }
            return a
        } else {
            return []
        }
    }

    const getBoxToCheck = () => {
        if (obj.current && allMeshes.length>0) {
            let meshToCheck = allMeshes.filter((object) => 
                        object.uuid == obj.current.uuid)
            return boxToCheck.clone().setFromObject(meshToCheck[0])
        } else {
            return null
        }
    }

    const allMeshes = useMemo(() => traverseScene())

    const allBoxes = useMemo(() => getAllBoxesExeptChecked(), [obj.current])

    const checkedBox = useMemo(() => getBoxToCheck(), [obj.current])

    return () => {
        if (allBoxes.length>0 && checkedBox) {
            let result = []
            for (let box of allBoxes) {
                result.push(
                    checkedBox.intersectsBox(box)
                )
            }
            return result.filter(value => value == true)
        } else {
            return []
        }
}};

useBoundingBox.propTypes = {
    obj: {current: THREE.Object3D}
  }