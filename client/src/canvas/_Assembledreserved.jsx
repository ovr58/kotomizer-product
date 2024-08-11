
import React, { useEffect, useMemo, useRef, useState } from 'react'

import * as THREE from 'three'
import { OBB } from 'three/addons/math/OBB.js' // OBB - oriented bounding box отдельный плагин для коробок (есть пример на threejs)

import { useSnapshot } from 'valtio';
import appState from '../store'

// найти расстояние до объекта при настройке камеры, настроить позиции деталей, проверить что детали на местах
import { getPartSize, getDistance, positions, isAtPlaces } from '../config/helpers'
// линии для подсветки и выбора граней при установке jumper, загрузка моделей
import { Line, useGLTF } from '@react-three/drei'
// проверки в каждом кадре и состояние сцены и камеры для вычислений
import { useThree } from '@react-three/fiber'
// каталог деталей
import { Parts } from '../config/constants'
import MaterialChanger from '../components/MaterialChanger'



const Assembled = ({ setDist }) => {
  const snap = useSnapshot(appState)
  const stateString = JSON.stringify(snap.assemblyMap) // назначаем сроку для уникального ключа группы объектов иначе не обновляется
  const assemblyMap = JSON.parse(stateString) // глубокое копирование объкта карта сборки
  // грузим все объекты из каталога
  const objects = useMemo(() => Parts.map((part) => useGLTF(`/${part.name}.glb`)), [Parts.toString()])
  
  const s = useTextures()
  // возвращаем массивы объектов и материалов для каждой инструкции в карте сборки
  // ref на группу
  const groupAssembled = useRef()
  // ref детали в DOM с которой работаем
  const placedDetail = useRef([])
  // ref деталей в сцене остальных
  const details = useRef([])
  // ссылки на линии для подсветки и обозначения ребер
  const lines = useRef([])
  const highLightLine = useRef()
  const [ assembledSize, setAssembledSize ] = useState(0)
  // состояния точек ребер для подсветки места и установки джампера
  const [pointsArray, setPointsArray] = useState([])
  const [hlinePoints, setHlinePoints] = useState([])
  // покадровая анимация материала и контроль изменений объекта с которым работаем
  const [objectToChange, setObjectToChange] = useState(null)
  const [materialChangerState, setMaterialChangerState] = useState(false)
  const [texture, setTexture] = useState('default')
  
  // назначим материал для детали, с которой работаем
  
  const objectArray = (objects) => {
    
    const userDataArray = [] // массив данных для OBB, и коннекторов каждой детали
    const objectGeometryArray = [] // массив всех геометрий
    let objectMaterialArray = [] // массив всех материалов (возможна смена материалов)
    const meshOBB = []
// если успели загрузить объекты из файла и получить карту сборки не пустую
    if (objects.length>0 && assemblyMap.length>0) {
      assemblyMap.forEach((instruction, i) => {
        const index = Number(instruction.name.replace('part', ''))-1 // индекс в массиве загруженных деталей
        const objectNodes = objects[index].nodes // создаем ССЫЛКУ на все ноды объекта
        // const objectCons = {} // пустой объект для хранения информации о коннекторах данной детали
        const detailsArray = []
        const detailsMaterialArray = []
        for (let node of Object.keys(objectNodes)) {
          if (node.includes('Detail')) {
            const objectGeometry = new THREE.BufferGeometry() // новая буфергеометрия для mesh
            objectGeometry.copy(
              objectNodes[node].geometry // создаем независимую копию геометрии для mesh
            )
            objectGeometry.computeBoundingBox() // вычисляем коробку с размерами геометрии
            objectGeometry.userData.obb = new OBB().fromBox3(
              objectGeometry.boundingBox // пишем в userData геометрии новый OBB созданный из его коробки
            )
            detailsArray.push(objectGeometry)
            detailsMaterialArray.push(objectNodes[node].material)
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
    return {userDataArray, objectGeometryArray, objectMaterialArray, meshOBB}
  }

const setObjectArray = useMemo(() => objectArray(objects), [objects, stateString]) // вызвали и записали "памятку"

const { scene, camera } = useThree() // получили состояние сцены и камеры

const findIntersections = () => {
// поиск наложений (постоянного оверлапа) объектов в сцене
let intersections = [] // будем возвращать массив с объектами с информацией о пересечении
placedDetail.current[0] && placedDetail.current.forEach((detail) => {
  const placedDetailBBCenter = new THREE.Vector3()
  detail.geometry.computeBoundingBox() // вычисляем актуальный бокс для геометрии объекта с которым работаем
  detail.geometry.userData.obb.fromBox3(
    detail.geometry.boundingBox // обновляем OBB в геометрии из этой коробки 
  )
  detail.geometry.boundingBox.getCenter(placedDetailBBCenter)
  detail.userData.obb.copy(detail.geometry.userData.obb)
  detail.userData.obb.applyMatrix4(detail.matrixWorld)
  detail.localToWorld(placedDetailBBCenter)
  detail.userData.obb.center.copy(placedDetailBBCenter)
  })
  // // помещаем независимый OBB в данные mesh
  // // применяем матрицы глобальных изменений данного объекта к ориентированной коробке
  // делаем все тоже самое для всех остальных объектов сцены по ссылкам
  details.current.forEach((detail) => {
    if (detail) {
      if (detail.type == 'Mesh') { // нужны только mesh
        const detailBBCeneter = new THREE.Vector3()
        detail.geometry.computeBoundingBox()
        detail.geometry.userData.obb.fromBox3(
          detail.geometry.boundingBox
        )
        detail.geometry.boundingBox.getCenter(detailBBCeneter)
        detail.userData.obb.copy(detail.geometry.userData.obb)
        detail.userData.obb.applyMatrix4(detail.matrixWorld)
        detail.localToWorld(detailBBCeneter)
        detail.userData.obb.center.copy(detailBBCeneter)
        
        // пишем результат в массив
        if (placedDetail.current[0] && isAtPlaces(assemblyMap, groupAssembled.current)) {
          intersections.push([
            placedDetail.current[0].parent.name, detail.parent.name, 
            placedDetail.current.map((detailToCheck) => detail.userData.obb.intersectsOBB(detailToCheck.userData.obb)).includes(true)
          ])
        }
      }
    }
  })

  return intersections
}

const placeJumperOnPosition = (pointsArray) => {
// функция этапа трансформации джампера на выбранных ребер передали массив объектов {имя mesh: [Vector3 вертекса начала, конца]}
// нужны все имена объектов на которых лежат выбранные ребра и ССЫЛКИ на точки начала и конца ребер 
  const namesOfObjects = Object.keys(pointsArray[0]).concat(Object.keys(pointsArray[1]))
  const pointStart1 = Object.values(pointsArray[0])[0][0]
  const pointEnd1 = Object.values(pointsArray[0])[0][1]
  const pointStart2 = Object.values(pointsArray[1])[0][0]
  const pointEnd2 = Object.values(pointsArray[1])[0][1]
  
// вектора ребер
  const rails = [
    new THREE.Vector3().subVectors(
      pointStart1, pointEnd1
    ),
    new THREE.Vector3().subVectors(
      pointStart2, pointEnd2
    )
  ]

// проверяем направление векторов ребер (из начала в конец) - 
// если разное (отрицательный дот продукт) меняем местами координаты начала и конца одного из ребер

  if (rails[0].dot(rails[1])<0) {
    const tempVector = pointStart2.clone()
    pointStart2.copy(pointEnd2)
    pointEnd2.copy(tempVector)
  }
// вычисляем кросс вектор обоих векторов ребер
  const crossVectors = 
    new THREE.Vector3().crossVectors(rails[0], rails[1])
// проверяем на параллельность выбранные ребра но с погрешностью до меньшего целого (при повороте деталей вылезал баг непараллельности)
// возможно надо будет сделать округление более точным!!!
  if (Math.floor(crossVectors.length()) === 0) {

// назначение линий нужны для вычислений
    
    const line1 = new THREE.Line3()
    const line2 = new THREE.Line3()
// основание джампера (место его точки привязки) будет всегда ниже
    if (pointStart1.y <= pointStart2.y) {
      line1.set(pointStart1, pointEnd1)
      line2.set(pointStart2, pointEnd2)
    } else {
      line1.set(pointStart2, pointEnd2)
      line2.set(pointStart1, pointEnd1)
      namesOfObjects.reverse() // если меняем местами то и имена деталей в массиве перевернем местами
    }

// определение точек ближайших к pointStart1 ... pointEnd2 на соответствующих линиях
// либо перпендикуляр либо прямая большей длины - результат поиска - для вычисления наложений ребер 

    const closestFromStart1 = new THREE.Vector3()
    const closestFromStart2 = new THREE.Vector3()
    const closestFromEnd1 = new THREE.Vector3()
    const closestFromEnd2 = new THREE.Vector3()
    line2.closestPointToPoint(line1.start, true, closestFromStart1)
    line2.closestPointToPoint(line1.end, true, closestFromEnd1)
    line1.closestPointToPoint(line2.start, true, closestFromStart2)
    line1.closestPointToPoint(line2.end, true, closestFromEnd2)

// проверка дистанций и выбор кратчайших

    const distLine1StartToLine2 = new THREE.Line3(line1.start, closestFromStart1)
    const distLine2StartToLine1 = new THREE.Line3(line2.start, closestFromStart2)
    const distLine1EndToLine2 = new THREE.Line3(line1.end, closestFromEnd1)
    const distLine2EndToLine1 = new THREE.Line3(line2.end, closestFromEnd2)
// если ребра в пространстве не накладываются при параллельном переносе - то джампер не установить
// возможно далее будет вид джампера с дуговым соедениением
    if (closestFromStart1.equals(closestFromEnd1) || closestFromStart2.equals(closestFromEnd2)) {
      alert('Нет возможности установить данный элемент!')
      return
    }

// присвоение точкам кратчайших дистанций статуса началов и концов нужных рельс 
// для перемешения и масштабирования джампера
    
    const startOnLine1 = new THREE.Vector3()
    const startOnLine2 = new THREE.Vector3()
    const endOnLine1 = new THREE.Vector3()
    const endOnLine2 = new THREE.Vector3()

    if (distLine1StartToLine2.distance()<=distLine2StartToLine1.distance()) {
      startOnLine1.copy(line1.start)
      startOnLine2.copy(closestFromStart1)
    } else {
      startOnLine1.copy(closestFromStart2)
      startOnLine2.copy(line2.start)
    }
    if (distLine1EndToLine2.distance()<=distLine2EndToLine1.distance()) {
      endOnLine1.copy(line1.end)
      endOnLine2.copy(closestFromEnd1)
    } else {
      endOnLine1.copy(closestFromEnd2)
      endOnLine2.copy(line2.end)
    }

// задаем центры отрезков
    const center1 = new THREE.Vector3()
    const center2 = new THREE.Vector3()
    const railLength = new THREE.Line3(startOnLine1, endOnLine1)
    railLength.getCenter(center1)
    new THREE.Line3(startOnLine2, endOnLine2).getCenter(center2)
// настроим райкастер для определения препятствий на пути джампера
    const raycaster = new THREE.Raycaster()
// сначала от камеры в сцене из useThree выше иначе дает ошибку
    raycaster.setFromCamera(new THREE.Vector2(), camera)
// настроим новый луч из "нижнего" центра в верхний
    raycaster.set(center1, center2.clone().sub(center1).normalize())
// запишем все на пути луча
    let intersects = raycaster.intersectObjects(scene.children)
// запишем дистанцию от "нижнего" центра до верхнего (до сотых)
    const distance = Number(center1.distanceTo(center2).toFixed(2))

// отфильтруем сначала все пересечения с нулевой дистанцией или дистанцией равное расстоянию между центрами
// И все пересечения с объектами содержащими наши ребра или если луч почему то задел что то дальше нашего верхнего ребра
// эта ошибка было до того как правильно настроили луч - потом возможно данный фильтре не нужен
    intersects = intersects.filter(
      (obj) => Number(obj.distance.toFixed(2)) == 0 && namesOfObjects.indexOf(obj.object.name)>=0)
      .filter(
      (obj) => Number(obj.distance.toFixed(2)) >= distance && namesOfObjects.indexOf(obj.object.name)>=0)
      .filter(
      (obj) => Number(obj.distance.toFixed(2)) > distance)
      .filter(
        intersect => !intersect.object.name.includes('jumper')
      )
// если ничего не осталось ничего в массиве продолжим
    if (intersects.length === 0) {
// определяем вектора направлений по координатным осям
      const y = new THREE.Vector3().subVectors(center2, center1).normalize()
      const x = new THREE.Vector3().subVectors(startOnLine1, center1).normalize()
      const z = new THREE.Vector3().crossVectors(x, y)
// создаем матрицу из векторов направлений
      const matrix = new THREE.Matrix4().makeBasis(x, y, z)
// получаем трансформацию поворота из матрицы
      const euler = new THREE.Euler().setFromRotationMatrix(matrix)
// индекс объекта с которым работаем в карте сборки (модуль)
      const index = Math.abs(Number(placedDetail.current[0].name.split('/')[0]))
// для получения размерностей детали обновим OBB детали и получим из него размеры по Y и X
      findIntersections()
      const lengthY = placedDetail.current[0].userData.obb.halfSize.y*2
      const lengthX = placedDetail.current[0].userData.obb.halfSize.x*2
// настроим скалярный множитель по Y и X на отношение расстояния между центрами и размера по Y и X соотцетственно
      placedDetail.current[0].scale.y = distance/lengthY
      placedDetail.current[0].scale.x = railLength.distance()/lengthX
// позиционируем в центр 1
      placedDetail.current[0].position.copy( center1 )
// присваиваем ейлер поворота
      placedDetail.current[0].rotation.copy( euler )
// записываем все в глобальное состояние карты сборки
      appState.assemblyMap[index].position = center1.toArray()
      appState.assemblyMap[index].rotation = placedDetail.current[0].rotation.toArray()
      appState.assemblyMap[index].scale = placedDetail.current[0].scale.toArray()
      appState.assemblyMap[index].maxScale = railLength.distance()/lengthX
      appState.assemblyMap[index].connectedTo[0] = {
        id: namesOfObjects[0].split('/')[0],
        connector: {name: 'jumper1start'},
        position: railLength.start
      }
      appState.assemblyMap[index].connectedTo[1] = {
        id: namesOfObjects[0].split('/')[0],
        connector: {name: 'jumper1start'},
        position: railLength.end
      }
    } else {
      alert('Препятствия недопустимы!')
      return
    }
  } else {
    alert('Грани должны быть параллельны!')
    const newPoints = {}
    newPoints[Object.keys(pointsArray[0])[0]] = hlinePoints
    setPointsArray([newPoints])
  }
 
}

const placeOnEdge = (e) => {
// функция размещения на ребре обозначающих линий и передачи обработки двух линий на placeJumperOnPosition
// кликнули по самому джамперу или по детали типа перфо (на них нельзя ставить джамперы) возвращаем
  if ('jumpercolumn'.includes(e.eventObject.name.split('/')[2])) {
    return
  }
// имя точки обозначаем именем объекта по которому кликнули
  const pointName = e.eventObject.name
// индекс детали с которой работаем в карте сборки
  const index = Math.abs(Number(placedDetail.current[0].name.split('/')[0]))
// обнуляем состояние джампера в карте сборки для задания нового положения и трансформации
  appState.assemblyMap[index].position = [0, 0, 0]
  appState.assemblyMap[index].rotation = [0, 0, 0]
  appState.assemblyMap[index].scale = [1, 1, 1]
  appState.assemblyMap[index].maxScale = 1
  appState.assemblyMap[index].connectedTo[0] = {
    id: 0,
    connector: {name: 'jumper1start'},
    position: [0, 0, 0]
  }
  appState.assemblyMap[index].connectedTo[1] = {
    id: 0,
    connector: {name: 'jumper1start'},
    position: [0, 0, 0]
  }
// если в массиве точек только одна запись (один объект с точками) будем записывать второй и запускать placeJumperOnPosition
  if (pointsArray.length === 1) {
    // если в массиве точек еще нет данного имени объекта добавляем новый объект с точками ребер
    if (!pointsArray[0].hasOwnProperty(pointName)) {
      const newPoints = {}
      newPoints[pointName] = hlinePoints
      setPointsArray([pointsArray[0], newPoints])
      placeJumperOnPosition([pointsArray[0], newPoints])
    // иначе добавляем заменяем объект с точками ребер в локальном состоянии
    } else {
      const newPoints = {}
      newPoints[pointName] = hlinePoints
      setPointsArray([newPoints])
    }
// если нет ниодного объекта с точками ребер или их больше одного то начинаем новый цикл добавления ребер
  } else {
    const newPoints = {}
    newPoints[pointName] = hlinePoints
    setPointsArray([newPoints])
  }
}

const highlightEdge = (e) => {
// функция подсветки ребер линиями
// если наведено на объект джампер или перво типа то обнуляем длину линии подсветки ребра и возврат
  if ('jumpercolumn'.includes(e.eventObject.name.split('/')[2])) {
    setHlinePoints([0,0,0],[0,0,0])
    return
  }
// получаем все пересечения курсора с объектами сцены
  const intersections = e.intersections
// ничего нет - возврат
  if (intersections.length == 0) return
// локальная точка пересечения и ближайшая точка к точке пересечения на ребре
  let localPoint = new THREE.Vector3()
  let closestPoint = new THREE.Vector3();

// позиция геометрии объекта на который навели для корректировки локальных координат
  const pos = e.eventObject.geometry.attributes.position

// индексы вертексов фэйса на который попал курсор
  let faceIdx = intersections[0].face;
// вектор направления по оси Y нормаль
  let yVector = new THREE.Vector3().set(0, 1, 0)
// массив линий всех ребер фэйса на который попал курсор
  let lines = [
    new THREE.Line3(
      new THREE.Vector3().fromBufferAttribute(pos, faceIdx.a),
      new THREE.Vector3().fromBufferAttribute(pos, faceIdx.b)
    ),
    new THREE.Line3(
      new THREE.Vector3().fromBufferAttribute(pos, faceIdx.b),
      new THREE.Vector3().fromBufferAttribute(pos, faceIdx.c)
    ),
    new THREE.Line3(
      new THREE.Vector3().fromBufferAttribute(pos, faceIdx.c),
      new THREE.Vector3().fromBufferAttribute(pos, faceIdx.a)
    )
  ].filter((line) => new THREE.Vector3().subVectors(line.start, line.end).normalize().dot(yVector) === 0) 
// отфильтровали массив линий по вертикальности к оси Y ,МОЖЕТ ЛИ БЫТЬ У ФЭЙСОВ БОЛЬШЕ ТРЕХ ЛИНИЙ?
  
  let edgeIdx = 0
// корректируем локальные координаты точки пересечения в мировые по отношению к объекту наведения курсора
  e.eventObject.worldToLocal(localPoint.copy(intersections[0].point))
// задаем минимальную дистанцию от курсора до ребра
  let minDistance = 1  
  for (let i = 0; i < lines.length; i++) {
// ближайшая точка к локал поинт на ребре i
    lines[i].closestPointToPoint(localPoint, true, closestPoint)
// расстояние до ближайшей точки от точки курсора
    let dist = localPoint.distanceTo(closestPoint)
// если расстояние до курсора меньше минимального то минимальное расстояние теперь равно расстоянию до курсора
// индекс ребра равен индексу линии
    if (dist < minDistance) {
      minDistance = dist
      edgeIdx = i
    }
  }
// если линия с таким индексом существует и у нее есть начало и конец то присваиваем состоянию массив точек начала и конца этой линии
  if (lines[edgeIdx] && lines[edgeIdx].start && lines[edgeIdx].end) {
    let pStart = e.eventObject.localToWorld(lines[edgeIdx].start)
    let pEnd = e.eventObject.localToWorld(lines[edgeIdx].end)
// если точки заданы в трехмерном пространстве - задаем состояние
    if (pStart.x && pStart.y && pStart.z && pEnd.x && pEnd.y && pEnd.z) {
      setHlinePoints([pStart, pEnd])
      }
  }
}

let stateOfGroup = ''

if (groupAssembled.current) {
  stateOfGroup = groupAssembled.current.children.reduce(
    (acc, child) => 
      [...acc, child.position.toArray(), child.rotation.toArray(), child.scale.toArray()], []
  ).toString()
}
  
const listOfChanges = [assemblyMap.length, 0, 0, 0, stateOfGroup] // массив изменений которые отслеживаем в карте сборки чтобы переназанчить вектора объектов в сцене
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
// если есть деталь с которой работаем останавливаем вращение камеры иначе восстанавливаем вращение
// так же обнуляем массивы для подсветки ребер 
  if (placedDetail.current[0]) {
    appState.camRotation = !placedDetail.current[0].name.includes('jumper')
  } else {
    appState.camRotation = true
    setPointsArray([])
    setHlinePoints([])
  }

  const sceneDetails = groupAssembled.current
  if (sceneDetails) {
    setAssembledSize(getPartSize(sceneDetails))
    setDist(getDistance(sceneDetails))
    const getAssemble = positions(assemblyMap, sceneDetails)
    appState.assemblyMap = getAssemble.newAssemblyMap 
    appState.freeCons = getAssemble.freeCons
      const intersected = findIntersections()
      appState.intersected = intersected
  }
  }, listOfChanges)
    
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
          <group
            key={Math.abs(instruction.id)} //уникальный ключ
            name={`${instruction.id}/${instruction.name}/${instruction.type}/details` } //использовать для получения типа
            position={instruction.position}
            rotation={instruction.rotation}
            scale={instruction.scale ? instruction.scale : [1,1,1]}
            userData={setObjectArray.userDataArray[i]}
            castShadow 
            receiveShadow
            dispose={null}
          >
            {setObjectArray.objectGeometryArray[i].map((detailOfGroup, iOfDetail) => (
              <mesh
                ref={instruction.id<0 ? ((el) => (placedDetail.current[iOfDetail] = el)) : ((el) => (details.current[Number(`${i}${iOfDetail}`)] = el))} //если id отрицательный - назначаем ссылку 
                key={`${Math.abs(instruction.id)}/${iOfDetail}`}
                name={`${i}/${iOfDetail}/${instruction.type}`}
                castShadow 
                receiveShadow 
                geometry={detailOfGroup}
      // работаем с материалом либо назначаем светящийся
                userData={setObjectArray.meshOBB[i][iOfDetail]}
                visible={true}
                onPointerMove={placedDetail.current[0] && placedDetail.current[0].name.includes('jumper') ? 
                  (e) => (e.stopPropagation(), highlightEdge(e)) : null}
                onPointerOut={placedDetail.current[0] && placedDetail.current[0].name.includes('jumper') ? 
                  (e) => e.intersections.length === 0 && setHlinePoints([0,0,0],[0,0,0]) : null}
                onClick={placedDetail.current[0] && placedDetail.current[0].name.includes('jumper') ? 
                  ((e) => (e.stopPropagation(), placeOnEdge(e))) : 
                  ((e) => (
                    e.stopPropagation(), 
                    setObjectToChange(e.object), 
                    setMaterialChangerState(!materialChangerState)
                  ))}
              >
                {instruction.id>=0 ? 
                  <meshStandardMaterial {...(instruction.material[iOfDetail] ? 
                    textures.filter(material => material.name == instruction.material[iOfDetail])[0] :
                    setObjectArray.objectMaterialArray[i][iOfDetail])} /> :
                  <meshBasicMaterial 
                    opacity={0.5}
                    transparent={true}
                    color={new THREE.Color(7, 0, 0.5)}
                    toneMapped={false} 
                  />
                }
              </mesh>
            ))}
          </group>
  )})}
      {(objectToChange && !placedDetail.current[0]) && 
        <MaterialChanger 
          objectToChange={objectToChange}
          setObjectToChange={setObjectToChange} 
          size={assembledSize}
          openState={materialChangerState}
          setOpenState={setMaterialChangerState}
          texture={texture}
          setTexture={setTexture}
        />}
      {details.current[0] && details.current.map((detail, i) => {
        if (detail && isAtPlaces(assemblyMap, groupAssembled.current)) {
          return (
            <mesh
              key={`${detail.name}wireframeOBB/${i}`}
              position={detail.userData.obb.center}
              rotation={new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().setFromMatrix3(
                detail.userData.obb.rotation
              ))}
            >
              <boxGeometry args={[
                detail.userData.obb.halfSize.x*2, 
                detail.userData.obb.halfSize.y*2, 
                detail.userData.obb.halfSize.z*2
                ]} />
              <meshBasicMaterial color={'red'} wireframe wireframeLinewidth={0.15}/>
            </mesh>
        )} else {return null}})
      }
      {placedDetail.current[0] &&
        placedDetail.current.map((detail, i) => {
          if (detail && isAtPlaces(assemblyMap, groupAssembled.current)) {
            return (
              <mesh 
                key={`placedDetail${detail.name}wireframeOBB/${i}`}
                position={detail.userData.obb.center}
                rotation={new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().setFromMatrix3(
                  detail.userData.obb.rotation
                ))}
              >
                <boxGeometry args={[
                  detail.userData.obb.halfSize.x*2, 
                  detail.userData.obb.halfSize.y*2,
                  detail.userData.obb.halfSize.z*2]} />
                <meshBasicMaterial color={'red'} wireframe wireframeLinewidth={0.15}/>
              </mesh>
          )
          } else {return null}
        })
      }
      {hlinePoints.length > 0 &&
        <Line 
          ref={highLightLine} 
          key={hlinePoints.toString()} 
          points={hlinePoints} 
          color="red"
          lineWidth={4} 
        />
      } 
      {pointsArray.length > 0 && pointsArray.map((points, i) => (
        <Line 
          ref={(el) => (lines.current[i] = el)} 
          key={`rail${JSON.stringify(points)}`} 
          points={Object.values(points)[0]} 
          color="blue"
          lineWidth={4} 
        />
        ))
      }
    </group>
  )
}

export default Assembled