import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useSnapshot } from 'valtio'
import appState from '../store'

import { downloadFile, reader } from '../config/helpers'
import { EditorTabs, TransformTabs, Parts, alerts } from '../config/constants'

import { fadeAnimation, slideAnimation } from '../config/motion'

import {CustomButton, ColorPicker, FilePicker, PartsPicker, Tab} from '../components'
import { Vector3 } from 'three'

const Customizer = () => {

  const snap = useSnapshot(appState)
  // глубокое копирование карты сборки
  const assemblyMap = snap.assemblyMap
  const placedDetail = assemblyMap[assemblyMap.length-1]

  // свободных коннекторов, номера свободного коннектора для перемещения на него
  const freeCons = snap.freeCons
  // свободные колонны для установки джута - в последствии можно отсевиать по диаметру placedDetail
  const freeColumns = assemblyMap.filter((instruction) => instruction.type === 'column' && instruction.id >= 0)

  // состояние для файла загрузки
  // есть ли детали в сборке, есть ли свободные коннекторы, есть ли деталь с которой работаем
  const intersectedState = snap.intersected
  const hasFreeCons = Boolean(freeCons[0])
  const hasParts = Boolean(assemblyMap.length > 0)
  const [hasNimbedPart, setHasNimbedPart] = useState(
    assemblyMap.length>1 ? Boolean(placedDetail.id < 0) : false)
  const hasBackground = Boolean(snap.backgroundObj.backgroundImg)
  const hasBackgroundMode = snap.backgroundObj.mode

  const [file, setFile] = useState(null)
// функция для получения свойства поворачиваемости из каталога деталей
  const isRotatable = (partName) => {

    const isRotatable = Parts[partName].rotatable

    return isRotatable
  }
// начальное состояние кнопок отменить, добавить и удалить палитры деталей
  const [partPickerButtonsStatus, setPartPickerButtonsStatus] = useState({
    undoButton: hasParts && hasNimbedPart,
    addButton: !hasNimbedPart,
    deleteLastButton: !hasNimbedPart && hasParts
  })
// устанавливаем состояние кнопок в зависимости от изменения сосотяний свободных коннекторов,
// имеем ли хоть одну деталь и имеем ли деталь с которой работаем
  useEffect(() => {
    setPartPickerButtonsStatus({
      undoButton: hasParts && hasNimbedPart,
      addButton: !hasNimbedPart,
      deleteLastButton: !hasNimbedPart && hasParts
    })
  }, [hasFreeCons, hasParts, hasNimbedPart])
// состояние для имени активной вкладки конструктора
  const [activeEditorTab, setActiveEditorTab] = useState("")
// состояние для активации или деактивации кнопок палитры трансформации
  const [activeTransformTab, setActiveTransformTab] = useState({
    changePosition: false,
    place: false,
    rotate:false
  })

// функция генерации содержимого вкладок конструктора в зависимости от имени активной вкладки в состоянии
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker /> // 
      case "filepicker":
        return <FilePicker // вкладка загрузки готовых сборок
                  file={file}
                  setFile={setFile}
                  handleDownLoad={handleDownLoad}
                />
      case "partspicker":
        return <PartsPicker // вкладка палитры деталей
                  partPickerButtonsStatus={partPickerButtonsStatus}
                  addToMap={addToMap}
                  unDoAdd={unDoAdd}
                  deleteLast={deleteLast}
               />
      default:
        return null
    }
  }
  const handleDownLoad = (opType, file) => {
    switch (opType) {
      case "Save The Cat Post":
        const date = new Date()
        downloadFile(`${date.toString().replace(/[' ':GMT+.*$]/g, "")}catpost`, JSON.stringify(assemblyMap))
        break
      case "Upload The Cat Post":
        readFile(file)
        break
      case "Photo The Cat Post":
        downloadFile('mainCanvas')
        break
      case "Set Background":
        if (!hasNimbedPart) {
          readFile(file)
          setActiveTransformTab({
            changePosition: true,
            place: false,
            rotate:false
          })
        } else {
          alert('Закончите установку детали...')
        }
        break
      default:
        return
    }
  }
// функция обработки нажатий на кнопки трансформаций
  const handleActiveTransformTab = (tabName, value=0) => {
    switch (tabName) {
      case "changePosition":
        setNewPosition(freeCons)
        break
      case "place":
        placeDetail()
        break
      case "rotate":
        rotateDetail(value)
        break
      default:
        return
    }
  }
// функция чтения файла ПОКА В РАЗРАБОТКЕ
  const readFile = (file) => {
    try {
      reader(file).then((result) => {
        if (file.type == 'image/jpeg') {
          const img = new Image()
          img.src = result
          appState.backgroundObj = {
            backgroundImg: result,
            width: img.width/Math.min(img.width, img.height),
            height: img.height/Math.min(img.width, img.height),
            position: [0,0,0],
            rotation: [0,0,0],
            mode: 'translate'
          }
        } else {
          appState.assemblyMap = JSON.parse(result)
        }
      }).catch((error) => {
        console.log(error.message)
      })
    } catch (error) {
      console.log(error.message)
    }
    setFile(null)
    setActiveEditorTab('')
  }
// функция обработки нажатия на копку добавить в палитре деталей
  const addToMap = (part) => {
// передали имя выбранной детали
// если деталь уже в сцене (статус кнопки отмены трушный) или нет имени детали 
// вывести сообщение о невозможности добавить деталь
    if (partPickerButtonsStatus.undoButton || !part) {
      alert(alerts.cantAdd.ru)
      return
    }

// получим индекс добавляемой детали в карте сборки
    const partIndex = assemblyMap.length
// получим первый свободный коннектор
    const firstFreeCon = snap.freeCons[0]
// определеим тип детали
    const partType = Parts[part].type
// изменим статус кнопок вкладки до начала работы с деталью
    setPartPickerButtonsStatus({
      undoButton: true,
      addButton: false,
      deleteLastButton: false
    })
// проверим поворачивается ли деталь, поставим статусы кнопок трансформации
    setActiveTransformTab({
      changePosition: true,
      place: true,
      rotate: isRotatable(part)
    })
// если индекс добавляемой детали не равен нулю
    if (partIndex != 0) {
      // если это не джампер по типу
      if (partType != 'jumper' && partType != 'jut') {
        // функция может выдать ошибку если деталь уже с сцене а кнопка 
        // была нажата поэтому проверим что нет детали в сцене
        !hasNimbedPart && appState.assemblyMap.push({
          id: -partIndex,
          name: part,
          type: partType,
          connectedTo: [{ id: firstFreeCon.id,
                          connector: {name: firstFreeCon.conName}
          }],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          material: {}
        })
      } else {
        // добавим запись о джампере или джуте
        if (!hasNimbedPart) {
          switch (partType) {
          case 'jumper':
            appState.assemblyMap.push({
             id: -partIndex,
             name: part,
             type: partType,
             connectedTo: [{
               id:0,
               connector: {name: 'jumper1start'},
               position: [0,0,0]
            },{
              id:3,
              connector: {name: 'jumper1end'},
              position: [0,0,0]
              }],
             position: [0, 0, 0],
             rotation: [0, 0, 0],
             scale: [1, 1, 1],
             maxScale: 1,
             material: {}
            } )
            break;
          case 'jut':
            if (freeColumns.length > 0) {
              appState.assemblyMap.push({
                id: -partIndex,
                name: part,
                type: partType,
                connectedTo: [{
                  id: freeColumns[0].id,
                  connector: {name: 'jutconnector'},
                  position: freeColumns[0].position,
                }],
                position: [
                  freeColumns[0].position[0], 
                  freeColumns[0].position[1], 
                  freeColumns[0].position[2]
                ],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                repeat: 1,
                height: Parts[part].height,
                material: {}
              } )
            } else {
              alert('Нет доступных деталей для установки...')
              setPartPickerButtonsStatus({
                undoButton: false,
                addButton: true,
                deleteLastButton: true
              })
              setActiveTransformTab({
                changePosition: false,
                place: false,
                rotate:false
              })
              setHasNimbedPart(false)
            }
            break
          default:
            break;
        }
        }
      }
      // изменим статусы так чтобы вкладка не мешала редактированию и статус наличия детали с которой работаем
      setActiveEditorTab('') 
      setHasNimbedPart(true)
    } else {
      // если индекс равен нулю то добавили базу - ее можно только удалить
      // поэтому вкладка остается видимой, кнопки встают в начальное состояние с кнопкой удалить активной
      // вкладки трансформации не активны а деталь минует статус детали с которой работаем
      appState.assemblyMap.push({
        id: partIndex,
        name: part,
        connectedTo: [],
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        material: {}
      })
      setPartPickerButtonsStatus({
        undoButton: false,
        addButton: true,
        deleteLastButton: true
      })
      setActiveTransformTab({
        changePosition: false,
        place: false,
        rotate:false
      })
      setHasNimbedPart(false)
    }
  }

  const unDoAdd = () => {
// функция отмены добавления детали в сцену
// если статус кнопки добавить трушный или карта сборки пуста или на сцене только база - ошибка
    if (partPickerButtonsStatus.addButton || assemblyMap.length <= 0 || !hasNimbedPart) {
      alert(alerts.cantUndo.ru)
      return
    }
// задаем состояния кнопок палитры деталей и кнопок трансформации
    setPartPickerButtonsStatus({
      undoButton: false,
      addButton: true,
      deleteLastButton: true
    })

    setActiveTransformTab({
      changePosition: false,
      place: false,
      rotate:false
    })
    appState.assemblyMap.pop() // удаляем последний элемент карты сборки
    // если последняя деталь которая осталась с нулевым индексом - меняем статус кнопок
    assemblyMap.length - 1 == 0 && setPartPickerButtonsStatus({
      addButton: true,
      undoButton: false,
      deleteLastButton: false
    })
    setHasNimbedPart(false) // нет детали с которой работаем
    
  }

  const deleteLast = () => {
    // функция удаления последней детали которую добавили
    if (partPickerButtonsStatus.undoButton || assemblyMap.length <= 0) {
      alert(alerts.cantDeleteLast.ru)
      return
    }
    appState.assemblyMap.pop()
    // если последняя деталь которая осталась с нулевым индексом - меняем статус кнопок
    assemblyMap.length - 1 == 0 && setPartPickerButtonsStatus({
      addButton: false,
      undoButton: false,
      deleteLastButton: false
    })

  }

  const setNewPosition = () => {

    if (hasBackground && hasNimbedPart == false) {
      console.log('MODE CHANGED', hasNimbedPart, hasBackground)
      const modes = ['none', 'translate', 'scale', 'rotate']
      const currModeIndex = modes.indexOf(hasBackgroundMode)
      const nextModeIndex = currModeIndex + 1 >= modes.length - 1 ? 0 : currModeIndex + 1
      appState.backgroundObj.mode = modes[nextModeIndex]
      console.log('MODE - ', modes[nextModeIndex])
    }
  
// функция установки детали с которой работаем на сборку в новой позиции (при нажатии кнопки перемещения на вкладке трансформации)
// отсеим свободные коннекторы с отрицательным индексом то есть те которые относятся к детали с которой работаем
    let freeConsToPlace = freeCons.filter(freeCon => freeCon.id >= 0)
// индекс детали с которой работаем в карте сборки
    const index = assemblyMap.length-1
    if (hasNimbedPart && placedDetail.type == 'jumper') {
    // работаем если устанавливаем джампер
    // начала и конец рельсы перемещения джампера
      const start = new Vector3()
      const end = new Vector3()
      start.copy(placedDetail.connectedTo[0].position)
      end.copy(placedDetail.connectedTo[1].position)
      // вектор рельсы и длина джампера по факту
      const rail = new Vector3().subVectors(start, end)
      const length = rail.length() * placedDetail.scale[0]
      // начальная позиция джампера
      const position = new Vector3()
      position.fromArray(placedDetail.position)
      position.lerp(end.clone(), 0.1) // не надо нормализовать
      // вектора от позиции до конца релься и до начала рельсы
      const toEnd = new Vector3().subVectors(position, end)
      const toStart = new Vector3().subVectors(start, position)
      // если в конце рельсы с учетом половины длины джампера по оси рельсы 
      if ((toEnd.length()-length/2) <= 0) {
        // поставить в начало рельсы с учетом половины длины джампера по оси рельсы
        position.copy(start.clone().sub(rail.clone().normalize().multiplyScalar(length/2)))
      }
      // добавить в состояние новый максимальный скэйл фактор по оси рельсы - чем ближе к краям тем меньше
      appState.assemblyMap[index].maxScale = (Math.min(toStart.length(), toEnd.length())*2)/rail.length()
      // добавить массив с новыми коорднатами в карту сборки
      appState.assemblyMap[index].position = position.toArray()
      return
    }
    if (hasNimbedPart && placedDetail.type === 'jut') {
      if (freeColumns.length > 0) {
        const idArr = freeColumns.map((column) => column.id)
        let currIndex = idArr.indexOf(placedDetail.connectedTo[0].id)
        let nextIndex = (currIndex + 1) > (freeColumns.length - 1) ? 0 : currIndex + 1
        appState.assemblyMap[index].connectedTo = [{
          id: freeColumns[nextIndex].id,
          connector: {name: 'jutconnector'},
          position: freeColumns[nextIndex].position,
        }]
        appState.assemblyMap[index].position = [
          freeColumns[nextIndex].position[0], 
          freeColumns[nextIndex].position[1], 
          freeColumns[nextIndex].position[2]
        ]
        return
      } else {
        alert(alerts.onlyOnePositionsAvalable.ru)
      }
    }
    // если работаем с другой деталью не с джампером
    if (hasNimbedPart && freeConsToPlace[0]) {
      console.log(freeConsToPlace)
      // если номер свободного коннектора больше последнего из всех свободных коннекторов то назначим первый из свободных
      const idArr = freeConsToPlace.map((freeCon) => freeCon.id)
      let currIndex = idArr.indexOf(placedDetail.connectedTo[0].id)
      let nextIndex = (currIndex + 1) > (freeConsToPlace.length - 1) ? 0 : currIndex + 1
      appState.assemblyMap[index].connectedTo = [{
        id: freeConsToPlace[nextIndex].id,
        connector: {name: freeConsToPlace[nextIndex].conName}
      }]
      // если этот коннектор последний то назначим номер нулем иначе следующим номером свободного коннектора
      // countIndex + 1 > freeConsToPlace.length - 1 ? setConNumber(0) : setConNumber(conNumber + 1) 
    } else if (hasNimbedPart) {
      alert(alerts.onlyOnePositionsAvalable.ru)
    }

  }

  const placeDetail = () => {
    if (hasNimbedPart) {
      const trueIntersections = intersectedState.filter((state) => state[2])
      if (trueIntersections.length<2 && placedDetail.type !== 'jumper') {
        appState.assemblyMap[assemblyMap.length-1].id = -placedDetail.id
        setHasNimbedPart(false)
      } else if (
        trueIntersections.length == 2 &&  
        trueIntersections[0][0].includes('column') &&
        trueIntersections[1][0].includes('column') && 
        trueIntersections[0][1].includes('hause') &&
        trueIntersections[1][1].includes('hause')
      ) {
        placedDetail.id = -placedDetail.id
        setHasNimbedPart(false)
      } else if (placedDetail.type == 'jumper' && placedDetail.position.toString().replace(/\D/g, '') !== '000') {
        console.log('PLACED DETAI POSITION ', placedDetail.position.toString().replace(/\D/g, ''))

        if (trueIntersections.length == 2)
          {
            appState.assemblyMap[assemblyMap.length-1].id = -placedDetail.id
            setHasNimbedPart(false)
          }  else if (
            trueIntersections.length == 3 && 
            trueIntersections.reduce(
              (accum, val) => 
                accum += val.filter(
                  (name) => name.toString().includes('hause')
                ).length, 0) == 2
            ) 
          {
            appState.assemblyMap[assemblyMap.length-1].id = -placedDetail.id
           setHasNimbedPart(false)
        } 
      } else {
        alert(alerts.intersectionDetected.ru)
        return
      }
      
      
      setPartPickerButtonsStatus({
        undoButton: false,
        addButton: true,
        deleteLastButton: true
      })

      setActiveTransformTab({
        changePosition: Boolean(snap.backgroundObj.backgroundImg),
        place: false,
        rotate:false
      })
    }
  }

  const rotateDetail = (value) => {

    if (hasNimbedPart) {

      if (isRotatable(placedDetail.name)) {
        if (placedDetail.type == 'jumper') {
          const maxScale = assemblyMap[assemblyMap.length-1].maxScale
          appState.assemblyMap[assemblyMap.length-1].scale[0] = (Math.abs(value)/360)*(maxScale-0.2) + 0.2
        } else if (placedDetail.type === 'jut') {
          const maxRepeat = placedDetail.maxRepeat
          console.log('MAX REPEAT - ', maxRepeat, value)
          appState.assemblyMap[assemblyMap.length-1].repeat = Number(((Math.abs(value)/360)*(maxRepeat-1)).toFixed(0)) + 1 
        } else {
          appState.assemblyMap[assemblyMap.length-1].rotation = [0, value*(Math.PI/180), 0]
        }
      } else {
        alert(alerts.arentRotatable.ru)
      }
      
    }
    
  }

  return (
    <AnimatePresence key = {'customizerPage'}>
      <motion.div
        key='customTabContent'
        className='absolute top-0 left-0 z-10'
        {...slideAnimation('left')}
      >
        <div className='flex items-center min-h-screen'>
          <div className='editortabs-container tabs'>
            {EditorTabs.map((tab,i) => (
              <Tab 
                key={`${tab.name}/${i}`}
                tab={tab}
                isActive={activeEditorTab === tab.name}
                handleClick = {()=>setActiveEditorTab(tab.name === activeEditorTab ? "" : tab.name)}
              />
            ))}
            {generateTabContent()}
          </div>
        </div>
      </motion.div>

      <motion.div
        key='customButtons'
        className='absolute z-10 top-5 right-5'
        {...fadeAnimation}
      >
        <CustomButton 
          type='filled'
          title='Go Back'
          handleClick={() => appState.intro = true}
          customStyles='w-fit px-4 py-2.5 font-bold text-sm'
        />
      </motion.div>

      <motion.div
        key='customTransformTabs'
        className='filtertabs-container'
        {...slideAnimation('up')}
      >
        {TransformTabs.map((tab, i) => (
              <Tab 
                key={`${tab.name}/${i}`}
                tab={tab}
                isActive = {activeTransformTab[tab.name]}
                isTransformTab
                handleClick = {(value)=> handleActiveTransformTab(tab.name, value)}
              />
            ))}
      </motion.div>
    </AnimatePresence>
  )
}

export default Customizer