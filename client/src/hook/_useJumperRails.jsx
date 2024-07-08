import { useThree } from '@react-three/fiber'
import { Object3D } from 'three'
import * as THREE from 'three'

import { Parts } from '../config/constants'

export const useJumperRails = (obj) => {

    const scene = useThree(state => state.scene)

    const traverseScene = () => {          //take all meshes in the scene
        let a = []
        scene.traverse((object) => {
            if (object.type == 'Mesh') {
                a.push(object)
            }
        })

        return a
    }

    const getAllVertexesSortedByY = (obj) => {
        
        const pointVector = new THREE.Vector3()

        const jumperableParts = Parts.filter((part) => !'jumperperfo'.includes(part.type)).map(
            (part) => part.name
        )
        
        const allMeshesExeptPlaced = traverseScene().filter(
            (object) => object.uuid != obj.uuid // all exept one that is placed
        ).filter(
            (object) => jumperableParts.toString().includes(object.name.split('-')[0])
        )
        let vertexesByMeshesArray = {}
console.log(allMeshesExeptPlaced)
        for (let mesh of allMeshesExeptPlaced) {
            let vertexArray = []
            let geometry = mesh.geometry
            let vertexCoord = geometry.getAttribute('position')
            for (let coordIndex = 0; coordIndex < vertexCoord.count; coordIndex+=3) {
                let vertexVector = pointVector.clone()
                vertexVector.fromBufferAttribute(vertexCoord, coordIndex)
                vertexVector.add(mesh.position)
                // mesh.localToWorld(vertexVector)
                vertexArray.push(vertexVector)
            }
            vertexArray.sort((a,b) => a.y-b.y)

            const uniqVertexesArray = getUniqOnly(vertexArray)

            let vertexesForThisMesh = {}

            for (let vertex of uniqVertexesArray) {
                vertexesForThisMesh[vertex.y.toFixed(2)]  ? 
                vertexesForThisMesh[vertex.y.toFixed(2)] = [...vertexesForThisMesh[vertex.y.toFixed(2)], vertex] : 
                vertexesForThisMesh[vertex.y.toFixed(2)] = [vertex]
            }
            
            vertexesByMeshesArray[mesh.uuid] = vertexesForThisMesh
        }
        
        return vertexesByMeshesArray
    }

    const getVectorsByDistance = (obj) => {

        const box = new THREE.Box3().setFromObject(obj)

        const objSize = new THREE.Vector3()

        box.getSize(objSize) // взяли размеры джампера

        const vertexesVectors = getAllVertexesSortedByY(obj)
        
        let pointsToMoveAlong = []
        
        for (let vertexesLevels of Object.values(vertexesVectors)) {
            for (let vertexesLevel of Object.values(vertexesLevels)) {
                    let vertexes = vertexesLevel
                    vertexes.push(vertexes[0])
                    for (let vertexI = 0; vertexI < vertexes.length - 1; vertexI++) {
                        pointsToMoveAlong = [
                            ...pointsToMoveAlong, 
                            ...getIntermediatePoints(
                                vertexes[vertexI], vertexes[vertexI+1], Math.max(objSize.x, objSize.z)/4
                            )]
                    }
                }
            }
        
        // for (let point of pointsToMoveAlong) {
        //     pointsToMoveAlong.forEach((pointEl) => {
        //         if (pointEl.y > point.y) {
        //             if (pointEl.x >= point.x*0.90 && pointEl.x <= point.x*1.1) {
        //                 pointEl.x = point.x
        //             }
        //             if (pointEl.z >= point.z*0.90 && pointEl.z <= point.z*1.1) {
        //                 pointEl.z = point.z
        //             }
        //         }
        //     })
        // }

        pointsToMoveAlong = getUniqOnly(pointsToMoveAlong)
        
        // pointsToMoveAlong = getByDistance(pointsToMoveAlong, objSize.y)

        console.log(pointsToMoveAlong)

        return pointsToMoveAlong
    }

    const getIntermediatePoints = (start, end, step) => {
        
        const points = []

        const distance = start.distanceTo(end)
        const numberOfPoints = Math.floor(distance / step)

        for (let i = 1; i <= numberOfPoints; i++) {
            const t = i/numberOfPoints
            const intermediatePoint = new THREE.Vector3().lerpVectors(start, end, t)
            points.push(intermediatePoint)
        }

        return points
    }

    const getUniqOnly = (vertexesArray) => {

        let hasSeenArray = new Set()

        let uniqVertexesArray = []

        vertexesArray.forEach((vertex, _i) => {
            const coordinatKey = `${vertex.x},${vertex.y},${vertex.z}`
            if (!hasSeenArray.has(coordinatKey)) {
                uniqVertexesArray.push(vertex)
                hasSeenArray.add(coordinatKey)
            }
        })

        return uniqVertexesArray
    }

    const getByDistance = (vertexesArray, distance) => {
        let filteredPoints = [];
        let pointSet = new Set();

        for (let i = 0; i < vertexesArray.length; i++) {
            for (let j = i + 1; j < vertexesArray.length; j++) {
                let distanceToPoint = parseFloat(vertexesArray[i].distanceTo(vertexesArray[j]).toFixed(2))
                let distanceToControl = parseFloat(distance.toFixed(2))
                console.log(distanceToControl, distanceToPoint)
                if (
                    distanceToPoint <= distanceToControl*1.05 &&
                    distanceToPoint >= distanceToControl*0.95 &&
                    vertexesArray[i].y > vertexesArray[j].y
                ) {
                    if (!pointSet.has(vertexesArray[i].toArray().toString())) {
                    filteredPoints.push(vertexesArray[i]);
                    pointSet.add(vertexesArray[i].toArray().toString());
                    }
                    if (!pointSet.has(vertexesArray[j].toArray().toString())) {
                    filteredPoints.push(vertexesArray[j]);
                    pointSet.add(vertexesArray[j].toArray().toString());
                    }
                }
            }
        }

        return filteredPoints;

    }


// sort by levels
// const levels = Object.values(vertexesVectorsByLevels).map(
//             (obj) => Object.keys(obj)
//         ).reduce(
//             (prev, cur, _i, _a) => [...prev, ...cur]
//         ).filter((level, _i, a) => {
//             // console.log(level, a.map(p => Number(level) - Number(p)))
//             return a.some((l) => Math.abs((Number(level) - Number(l))) >= (objSize.y*0.95) &&
//                                  Math.abs((Number(level) - Number(l))) <= (objSize.y*1.05)) // отсортировали те между которыми плюс минус 5% длины джампера
//         })

// // Создайте линию между точками
// const start = new THREE.Vector3(x1, y1, z1);
// const end = new THREE.Vector3(x2, y2, z2);
// const lineGeometry = new THREE.Geometry();
// lineGeometry.vertices.push(start, end);
// const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
// const line = new THREE.Line(lineGeometry, lineMaterial);
// scene.add(line);

// // Создайте копию детали
// const detailClone = detailMesh.clone();

// // Вычислите вектор направления
// const direction = end.clone().sub(start).normalize();

// // Поверните деталь
// detailClone.lookAt(end);

// // Установите позицию детали
// const distance = start.distanceTo(end);
// detailClone.position.copy(start).add(direction.multiplyScalar(distance / 2));

// scene.add(detailClone);

// const centerOfMass = new THREE.Vector3() сортировка по часовой
            
// console.log('not clockwise', vertexesForThisMesh)

// for (let i = 0; i < Object.values(vertexesForThisMesh).length; i++) {

//     let centerOfMassClone = centerOfMass.clone()
//     let vertexes = Object.values(vertexesForThisMesh)[i]
//     vertexes.forEach(v => centerOfMassClone.add(v))
//     centerOfMassClone.divideScalar(vertexes.length)
//     const angles = vertexes.map(
//         v => Math.atan2(v.z - centerOfMassClone.z, v.x - centerOfMassClone.x)
//     )
//     const sortedVertices = vertexes.slice().sort(
//         (a, b) => 
//             angles[vertexes.indexOf(a)] - angles[vertexes.indexOf(b)]
//     )

//     vertexesForThisMesh[i] = sortedVertices

// }

// console.log('sorted', vertexesForThisMesh)

    return () => {
        if (obj.current) {
            return getVectorsByDistance(obj.current)
        } else {
            return []
        }
}};

useJumperRails.propTypes = {
    obj: {current: Object3D}
  }