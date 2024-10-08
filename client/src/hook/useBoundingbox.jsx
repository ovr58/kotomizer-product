import { useMemo, useState } from 'react';
import { useThree } from '@react-three/fiber'
import { OBB } from 'three/addons/math/OBB.js'

import * as THREE from 'three'

export const useBoundingBox = (obj) => {

    const [ printed, setPrinted ] = useState([])

    const { scene } = useThree()
    
    const traverseScene = () => {
        let a = []
        scene.traverse((object) => {
            if (object.type == 'Mesh') {
                object.geometry.computeBoundingBox()
                object.geometry.userData.obb = new OBB().fromBox3(
                    object.geometry.boundingBox
                )
                object.userData.obb = new OBB()
                object.userData.obb.copy(object.geometry.userData.obb)
                // object.userData.obb.applyMatrix4(object.matrixWorld)
                a.push(object)
            }
        })

        return a
    }

    const getAllBoxesExeptChecked = () => {
        if (obj.current && allMeshes.length>0) {
            let a = []
            let allMeshesExeptChecked = allMeshes.filter((object) => 
                        object.name != 'placedDetail' && object.name != 'hitbox')
            for (let meshIndex = 0; meshIndex < allMeshesExeptChecked.length; meshIndex++) {
                if (!printed.indexOf(meshIndex)>=0) {
                    setPrinted([...printed, meshIndex])
                }
                a.push(allMeshesExeptChecked[meshIndex].userData.obb)
            }
            return a
        } else {
            return []
        }
    }

    const getBoxToCheck = () => {
        if (obj.current && allMeshes.length>0) {
            return allMeshes.filter((mesh) => mesh.name == 'placedDetail')[0].userData.obb
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
                    checkedBox.intersectsOBB(box)
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