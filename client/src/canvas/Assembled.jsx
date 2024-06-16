import React, { useEffect, useMemo, useRef, useState } from 'react'

import * as THREE from 'three'
import { OBB } from 'three/addons/math/OBB.js'

import { useSnapshot } from 'valtio';
import state from '../store'

import { getDistance, positions, isAtPlaces } from '../config/helpers'; // вычисление позиций сборки assemblyMap
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Parts } from '../config/constants';

// назначим материал для детали, с которой работаем
const glowRed = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true, color: new THREE.Color(7, 0, 0.5), toneMapped: false })

const Assembled = ({ setDist }) => {

  const snap = useSnapshot(state)
  const stateString = JSON.stringify(snap.assemblyMap) // назначаем сроку для уникального ключа группы объектов иначе не обновляется
  const assemblyMap = JSON.parse(stateString) // глубокое копирование объкта карта сборки
  const objects = useMemo(() => Parts.map((part) => useGLTF(`/${part.name}.glb`)))

  const objectArray = (objects) => {
    
    const userDataArray = []
    const objectGeometryArray = []
    const objectMaterialArray = []

    if (objects.length>0 && assemblyMap.length>0) {
      assemblyMap.forEach((instruction) => {
        const objectCons = {}
        const objectGeometry = new THREE.BufferGeometry()
        objectGeometry.copy(objects[Number(instruction.name.replace('part', ''))-1].nodes.Detail1.geometry)
        objectGeometry.computeBoundingBox()
        objectGeometry.userData.obb = new OBB().fromBox3(
          objectGeometry.boundingBox
        )
        const objectNodes = objects[Number(instruction.name.replace('part', ''))-1].nodes
        const consNames = Object.keys(objectNodes).filter((name) => name.includes('con'))
        objectCons.obb = new OBB()
        consNames.forEach((key) => {
          objectCons[key] = objectNodes[key]
        })
        userDataArray.push(objectCons)
        objectGeometryArray.push(objectGeometry)
        objectMaterialArray.push(objects[Number(instruction.name.replace('part', ''))-1].nodes.Detail1.material)
      })
    }
    return {userDataArray, objectGeometryArray, objectMaterialArray}
  }

  const setObjectArray = useMemo(() => objectArray(objects))

  const { scene } = useThree()

  const findIntersections = () => {
    let intersections = []
    placedDetail.current.geometry.computeBoundingBox()
    placedDetail.current.geometry.userData.obb.fromBox3(
      placedDetail.current.geometry.boundingBox
    )
    placedDetail.current.userData.obb.copy(placedDetail.current.geometry.userData.obb)
    placedDetail.current.userData.obb.applyMatrix4(placedDetail.current.matrixWorld)
    details.current.forEach((detail) => {
      if (detail) {
        if (detail.type == 'Mesh') {
          detail.geometry.computeBoundingBox()
          detail.geometry.userData.obb.fromBox3(
            detail.geometry.boundingBox
          )
          detail.userData.obb.copy(detail.geometry.userData.obb)
          detail.userData.obb.applyMatrix4(detail.matrixWorld)
          console.log(placedDetail.current, detail)
          intersections.push(placedDetail.current.userData.obb.intersectsOBB(detail.userData.obb))
        }
      }
    })
    console.log(intersections)
    return intersections
  }
// ref на группу
  const groupAssembled = useRef()
// ref детали в DOM с которой работаем
  const placedDetail = useRef()
  const details = useRef([])
// state для анимации материала детали с которой работаем
  const [animationVector, setAnimationVector] = useState(0.6)
// state для хранения состояния деталей (поворот, положение) до изменений
  const [prevMeshCount, setPrevMeshCount] = useState(0)
// покадровая анимация материала и контроль изменений объекта с которым работаем
  useFrame((state, delta) => {
    
    const opacity = glowRed.opacity // получаем прозрачность материала
    if (opacity > 0.99) {setAnimationVector(-0.6)} //если значение больше
    else if (opacity <0.6) {setAnimationVector(0.6)} // или меньше границ разворачиваем вектор анимации
    glowRed.opacity += animationVector * delta // назначаем актуальную прозрачность сдвинутую на вектор и дельту
// получаем состояние объектов актуальное
    const countMeshes = () => {
      let a=[]
      let parts = []
      state.scene.traverse((object) => {
        if (object.type == 'Mesh' || (object.type == 'Group' && object.name == 'groupAssembled')) {
          a.push(...object.position.toArray(), ...object.rotation.toArray())
          parts.push(object)
      }
      })
      return {a, parts}
    }

    // const findIntersections = () => {
    //   let intersections = []
    //   placedDetail.current.geometry.computeBoundingBox()
    //   placedDetail.current.geometry.userData.obb.fromBox3(
    //     placedDetail.current.geometry.boundingBox
    //   )
    //   placedDetail.current.userData.obb.copy(placedDetail.current.geometry.userData.obb)
    //   placedDetail.current.userData.obb.applyMatrix4(placedDetail.current.matrixWorld)
    //   details.current.forEach((detail) => {
    //     if (detail) {
    //       if (detail.type == 'Mesh') {
    //         detail.geometry.computeBoundingBox()
    //         detail.geometry.userData.obb.fromBox3(
    //             detail.geometry.boundingBox
    //         )
    //         detail.userData.obb.copy(detail.geometry.userData.obb)
    //         detail.userData.obb.applyMatrix4(detail.matrixWorld)
    //         console.log(placedDetail.current, detail, 'useFrame')
    //         intersections.push(placedDetail.current.userData.obb.intersectsOBB(detail.userData.obb))
    //       }
    //     }
    //   })
    //   return intersections
    // }
// сравниваем с предыдущим состоянием по качеству и кол-ву если есть изменения
// назначаем новое состояние для пересечений и высоты и меняем состояние до изменений
  let sceneDetails = countMeshes()
  let stateOfGroup = sceneDetails.a
  let partsOfGroup = sceneDetails.parts  
  if (
      prevMeshCount.length != stateOfGroup.toString().length || 
      prevMeshCount != stateOfGroup.toString()) 
      {
        setPrevMeshCount(stateOfGroup.toString())
        if (partsOfGroup.length>1) {
          console.log('from useFrame', partsOfGroup)
          setDist(getDistance(partsOfGroup))
          if (placedDetail.current && isAtPlaces(assemblyMap, partsOfGroup)) {
            state.intersected = findIntersections(partsOfGroup)      
          }
        }
        // setJumperRailsPointsArray(jumperRailsPoints())
      }
  })
  
  // useEffect (() => {
  //   const sphereGroupObj = scene.getObjectByName('sphereGroup')
  //   console.log(sphereGroupObj.name)
  //   if (sphereGroupObj.name) {
  //     sphereGroupObj.traverse((object) => {
  //       if (object.name.includes('point')) {
  //         object.removeFromParent()
  //         object.geometry.dispose()
  //         if (Array.isArray(object.material)) {
  //           object.material.forEach(material => {
  //               material.dispose();
  //               if (material.map) material.map.dispose();
  //               if (material.lightMap) material.lightMap.dispose();
  //               if (material.bumpMap) material.bumpMap.dispose();
  //               if (material.normalMap) material.normalMap.dispose();
  //               if (material.specularMap) material.specularMap.dispose();
  //               if (material.envMap) material.envMap.dispose();
  //           });
  //       } else {
  //           object.material.dispose();
  //           if (object.material.map) object.material.map.dispose();
  //           if (object.material.lightMap) object.material.lightMap.dispose();
  //           if (object.material.bumpMap) object.material.bumpMap.dispose();
  //           if (object.material.normalMap) object.material.normalMap.dispose();
  //           if (object.material.specularMap) object.material.specularMap.dispose();
  //           if (object.material.envMap) object.material.envMap.dispose();
  //       }
  //       console.log('удалил', object)
  //       object = null
  //       }
  //     })

  //     const sphereGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  //     const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      
  //     jumperRailsPointsArray.forEach((pointVector) => {
  //           const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  //           sphere.position.copy(pointVector)
  //           sphere.name = `point${pointVector.toArray().toString()}`
  //           sphereGroupObj.add(sphere)
  //       })
  //   }
  //     console.log('do')

  // }, [jumperRailsPointsArray.map(
  //   vector => `${vector.x.toFixed(2)} ${vector.y.toFixed(2)} ${vector.z.toFixed(2)}`
  // ).toString()]) // добавим точки пути на сцену и удалим старые точки
  
  const listOfChanges = [assemblyMap.length, 0, 0, 0] // массив изменений которые отслеживаем в карте сборки чтобы переназанчить вектора объектов в сцене
// если длина карты сборки больше нуля то помещаем в массив отслеживаемых изменений id последнего объекта он же тот объект с которым работаем если он уже на что-то установлен (уже добавился объект connectedTo) в массив добавим id детали к которой присоединен и имя коннектора на этой детали
  if (listOfChanges[0]>0) {
    listOfChanges[1] = assemblyMap[listOfChanges[0]-1].id
    if (assemblyMap[listOfChanges[0]-1].connectedTo.length > 0) {
      listOfChanges[2] = assemblyMap[listOfChanges[0]-1].connectedTo[0].id
      listOfChanges[3] = assemblyMap[listOfChanges[0]-1].connectedTo[0].connector.name
    } 
  }
// при изменении списка отслеживаемых изменений перерасчитываем позиции деталей в сцене 
  useEffect(() => {

    const countMeshes = () => {
      let parts = []
      scene.traverse((object) => {
        if (object.type == 'Mesh' || (object.type == 'Group' && object.name == 'groupAssembled')) {
          parts.push(object)
      }
      })
      return {parts}
    }

    let sceneDetails = countMeshes()
    if (sceneDetails.parts.length>0) {
      setDist(getDistance(sceneDetails.parts))
      const getAssemble = positions(assemblyMap, sceneDetails.parts)
      state.assemblyMap = getAssemble.newAssemblyMap 
      state.freeCons = getAssemble.freeCons
      if (placedDetail.current && isAtPlaces(getAssemble.newAssemblyMap, sceneDetails.parts)) {
        state.intersected = findIntersections(sceneDetails.parts)
      }
    }
    }, listOfChanges)
// получаем все объекты из файлов в соответствии с картой сборки, при изменении карты сборки и в первый раз
  
  return (
    <group
      ref={groupAssembled}
      key={stateString}
      name={'groupAssembled'}
      dispose={null}
    >
      {(objects.length > 0 && setObjectArray) && //если успели получить объекты
       assemblyMap.map((instruction, i) => {
        return(//получаем инструкции последовательно из карты сборки
         <mesh
            ref={instruction.id<0 ? placedDetail : (el) => (details.current[i] = el)} //если id отрицательный - назначаем ссылку 
            key={Math.abs(instruction.id)} //уникальный ключ
            name={instruction.id<0 ? 'placedDetail' : `${instruction.name}/${instruction.id}` } //использовать для получения типа
            castShadow 
            receiveShadow 
            position={instruction.position}
            rotation={instruction.rotation}
            geometry={setObjectArray.objectGeometryArray[i]}
            userData={setObjectArray.userDataArray[i]}
  // работаем с материалом либо назначаем светящийся
            material={instruction.id >= 0 ? setObjectArray.objectMaterialArray[i] : glowRed}
            visible={true}
         >
        </mesh>
      )})}
    </group>
  )
}

export default Assembled

// 



// pointsToMoveAlong.forEach((pointVector) => {
//     sphere.position.copy(pointVector)
//     scene.add(sphere)
// })