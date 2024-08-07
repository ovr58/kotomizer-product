import React, { createContext, useContext, useMemo } from 'react'
import { Parts } from '../config/constants';
import { useGLTF } from '@react-three/drei';

import * as THREE from 'three'
import { OBB } from 'three/addons/math/OBB.js' // OBB - oriented bounding box отдельный плагин для коробок (есть пример на threejs)
import { useTextures } from './TextureContext';

const AssembledContext = createContext()

export const useAssembled = () => useContext(AssembledContext);

export const AssembledProvider = ({ snap, children }) => {

  const stateString = JSON.stringify(snap.assemblyMap)
  const textures = useTextures()
  const objects = useMemo(() => Object.keys(Parts).map(
      (name) => useGLTF(`/${name}.glb`)
  ), [Parts.toString()])

  const objectArray = (objects) => {
  
      const userDataArray = [] // массив данных для OBB, и коннекторов каждой детали
      const objectGeometryArray = [] // массив всех геометрий
      let objectMaterialArray = [] // массив всех материалов (возможна смена материалов)
      const meshOBB = []
  // если успели загрузить объекты из файла и получить карту сборки не пустую
      if (objects.length>0 && snap.assemblyMap.length>0) {
        snap.assemblyMap.forEach((instruction, _i) => {
          const index = Number(instruction.name.replace('part', ''))-1 // индекс в массиве загруженных деталей
          const objectNodes = objects[index].nodes // создаем ССЫЛКУ на все ноды объекта
          // const objectCons = {} // пустой объект для хранения информации о коннекторах данной детали
          const detailsArray = []
          const detailsMaterialArray = []
          for (let node of Object.keys(objectNodes)) {
            if (node.includes('Detail')) {
              console.log(node)
              const objectGeometry = new THREE.BufferGeometry() // новая буфергеометрия для mesh
              objectGeometry.copy(
                objectNodes[node].geometry // создаем независимую копию геометрии для mesh
              )
              objectGeometry.computeBoundingBox() // вычисляем коробку с размерами геометрии
              objectGeometry.userData.obb = new OBB().fromBox3(
                objectGeometry.boundingBox // пишем в userData геометрии новый OBB созданный из его коробки
              )
              detailsArray.push(objectGeometry)
              const detailIndex = detailsArray.length - 1
              const matArray = [...textures, objectNodes[node].material]
              let detailMaterial
              if (instruction.material[detailIndex]) {
                detailMaterial = Object.assign({}, matArray.filter((mat) => mat.name == instruction.material[detailIndex])[0])
              } else {
                detailMaterial = objectNodes[node].material.clone()
              }
              if (instruction.scale) {
                console.log(instruction.scale, instruction.type)

                const u = instruction.scale[1]
                const v = instruction.scale[0]
                console.log('UV', u, v)
                detailMaterial.map && detailMaterial.map.repeat.set(u, v)
                detailMaterial.normalMap && detailMaterial.normalMap.repeat.set(u, v)
                detailMaterial.roughnessMap && detailMaterial.roughnessMap.repeat.set(u, v)
                detailMaterial.aoMap && detailMaterial.aoMap.repeat.set(u, v)
                detailMaterial.map && (
                  () => 
                    detailMaterial.map.wrapS = 
                    detailMaterial.map.wrapT = 
                    THREE.RepeatWrapping
                  )
                detailMaterial.normalMap && (
                  () => 
                    detailMaterial.normalMap.wrapS = 
                    detailMaterial.normalMap.wrapT = 
                    THREE.RepeatWrapping
                  )
                detailMaterial.roughnessMap && (
                  () => 
                    detailMaterial.roughnessMap.wrapS = 
                    detailMaterial.roughnessMap.wrapT = 
                    THREE.RepeatWrapping
                  )
                detailMaterial.aoMap && (
                  () => 
                    detailMaterial.aoMap.wrapS = 
                    detailMaterial.aoMap.wrapT = 
                    THREE.RepeatWrapping
                  )
              }
              detailsMaterialArray.push(detailMaterial)
            }
          }
          meshOBB.push(detailsArray.reduce((acc, _val) => acc = [...acc, {obb: new OBB()}], []))
  // и получим все ключи коннекторов
          const consNames = Object.keys(objectNodes).filter((name) => name.includes('con'))
  // записывем в objectCons все пары ключ (имя коннектора) значение (ССЫЛКА на объект коннектора)
          const objectConsGeometry = new THREE.BufferGeometry()
          const points = []
          const pointsNames = []
          consNames.forEach((key) => {
            objectNodes &&
            points.push(objectNodes[key].position) && 
            pointsNames.push(objectNodes[key].name)
          })
          if (points.length > 0) {
            objectConsGeometry.setFromPoints(points)
            const consRotation = new THREE.Euler().setFromVector3(new THREE.Vector3().fromArray(instruction.rotation), 'XYZ')
            const consMatrix = new THREE.Matrix4().makeRotationFromEuler(consRotation)
            objectConsGeometry.applyMatrix4(consMatrix)
            userDataArray.push({
              objectCons: objectConsGeometry,
              consNames: pointsNames
            }) // записали 
          } else {
            userDataArray.push({})
          }
          objectGeometryArray.push(detailsArray) // записали
          objectMaterialArray.push(detailsMaterialArray) // ССЫЛКА на материал
        })
      }
      return {userDataArray, objectGeometryArray, objectMaterialArray, meshOBB, textures}
  }
    
  const positions = (assemblyMap, userDataArray) => {
    
    let freeCons = []

    for (let instruction of assemblyMap) {

      let partId = Math.abs(instruction.id)
      let positionClone = []

      if (instruction.type != 'jumper') {
        let consNames = userDataArray[partId].consNames
        if (consNames.length > 0) {
          let vertexCoord = userDataArray[partId].objectCons.getAttribute('position')
          let nameIndex = 0 
          for (let coordIndex = 0; coordIndex < vertexCoord.count; coordIndex+=1) {
            let vertexVector = new THREE.Vector3()
            vertexVector.fromBufferAttribute(vertexCoord, coordIndex)
            freeCons.push({
              id: instruction.id,
              conName: userDataArray[partId].consNames[nameIndex],
              position: vertexVector.toArray()
            })
            nameIndex ++ 
          }
        }

        if (partId === 0) {
          positionClone = [0, 0, 0]
        } else {
          for (let conToPartIndex = 0; conToPartIndex < instruction.connectedTo.length; conToPartIndex++) {
            let conToPart = instruction.connectedTo[conToPartIndex]
            let conToPartId = conToPart.id
            let fixVector = assemblyMap[conToPartId].position
            let conName = conToPart.connector.name
            let conPosition = freeCons.filter((freeCon) => (freeCon.id == conToPartId && freeCon.conName == conName))[0].position
            let xOfBase = conPosition[0]
            let yOfBase = conPosition[1]
            let zOfBase = conPosition[2]
            positionClone[0] = xOfBase + fixVector[0]
            positionClone[1] = yOfBase + fixVector[1]
            positionClone[2] = zOfBase + fixVector[2]
            if (instruction.id >= 0) {
              freeCons = freeCons.filter(
                (freeCon) => !(conToPart.id == freeCon.id &&
                conToPart.connector.name == freeCon.conName)
              )
            }
          }
        }
      } else {
        console.log('POSITION', instruction.position)
        positionClone[0] = instruction.position[0]
        positionClone[1] = instruction.position[1]
        positionClone[2] = instruction.position[2]
      }
        assemblyMap[partId].position = positionClone
    }
    return {assemblyMap, freeCons}
  }

    const setObjectArray = useMemo(() => objectArray(objects), [stateString])
    
    const setPositions = useMemo(() => positions(
      JSON.parse(JSON.stringify(snap.assemblyMap)), 
      setObjectArray.userDataArray), [stateString])
    
    const assembledObj = {
      stateString: stateString,
      assemblyMap: setPositions.assemblyMap,
      freeCons: setPositions.freeCons,
      setObjectArray: setObjectArray
    }
    console.log('ASSEMBLED CONTEXT - ', assembledObj)

  return (
    <AssembledContext.Provider value={assembledObj}>
      {children}
    </AssembledContext.Provider>
  )
}