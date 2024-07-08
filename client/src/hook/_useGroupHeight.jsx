import { Object3D } from 'three'
import * as THREE from 'three'

export const useGroupHeight = (group) => {

    const getGroupSize = (group) => {

        const box = new THREE.Box3().setFromObject(group.current)
    
        const groupSize = new THREE.Vector3()
    
        box.getSize(groupSize) // взяли размеры

        return groupSize
    }

    return () => {
        if (group.current) {
            return getGroupSize(group)
        } else {
            return 0
        }
    }
};

useGroupHeight.propTypes = {
    group: {current: Object3D}
  }