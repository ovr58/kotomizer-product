import React, { Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useSnapshot } from 'valtio'
import appState from '../store'

import config from '../config/config'
import { Parts } from '../config/constants'

import { download } from '../assets'

import { reader } from '../config/helpers'
import { EditorTabs,  DecalTypes, TransformTabs, alerts } from '../config/constants'

import { fadeAnimation, slideAnimation } from '../config/motion'

import {CustomButton, ColorPicker, FilePicker, PartsPicker, Tab} from '../components'
import { Vector3 } from 'three'

const Customizer = () => {

  const snap = useSnapshot(appState)
  // глубокое копирование карты сборки
  const assemblyMap = JSON.parse(JSON.stringify(snap.assemblyMap)) 
  // состояние для файла загрузки карты сборки
  const [file, setFile] = useState('')
// состояния для свободных коннекторов, номера свободного коннектора для перемещения на него
// есть ли детали в сборке, есть ли свободные коннекторы, есть ли деталь с которой работаем
  const [freeCons, setFreeCons] = useState(snap.freeCons)
  const [conNumber, setConNumber] = useState(freeCons.length)
  const [hasParts, setHasParts] = useState(Boolean(assemblyMap.length > 0))
  const [hasFreeCons, setHasFreeCons] = useState(Boolean(freeCons[0]))
  const [hasNimbedPart, setHasNimbedPart] = useState(
    assemblyMap.length>1 ? Boolean(assemblyMap[assemblyMap.length-1].id < 0) : false)
// устанавливаем все состояния при изменении глобальных состояний
  useEffect(() => {
    setFreeCons(snap.freeCons)
  }, [snap.freeCons.toString()])

  useEffect(() => {
    setHasFreeCons(Boolean(freeCons[0]))
  }, [freeCons.toString()])

  useEffect(() => {
    setHasParts(Boolean(assemblyMap.length > 0))
  }, [assemblyMap.toString()])

  useEffect(() => {
    setHasNimbedPart(assemblyMap.length>1 ? Boolean(assemblyMap[assemblyMap.length-1].id < 0) : false)
  }, [hasParts])
// функция для получения свойства поворачиваемости из каталога деталей
  const isRotatable = (partName) => {

    const nimbedPartName = hasNimbedPart ? assemblyMap[assemblyMap.length-1].name : partName

    const isRotatable = Parts.filter((part) => part.name==nimbedPartName)[0].rotatable

    return isRotatable
  }
// функция для получения типа детали из каталога деталей
  const getPartType = (partName) => {
    return Parts.filter((part) => part.name==partName)[0].type
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
        return <ColorPicker /> // ЗАМЕНИТЬ НА ВЫБОР СКИНОВ ДЛЯ ДЕТАЛЕЙ
      case "filepicker":
        return <FilePicker // вкладка загрузки готовых сборок
                  file={file}
                  setFile={setFile}
                  readFile={readFile}
                />
      case "partspicker":
        return <PartsPicker // вкладка палитры деталей
                  partPickerButtonsStatus={partPickerButtonsStatus}
                  addToMap={addToMap}
                  unDoAdd={unDoAdd}
                  deleteLast={deleteLast}
                  freeCons={freeCons.filter(freeCon => freeCon.id >= 0)} // отсевиваем свободные коннекторы с положительным id 
               />
      default:
        return null
    }
  }
// функция для работы с скинами деталей ПОКА В РАЗРАБОТКЕ
  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type]

    appState[decalType.stateProperty] = result
  }
// функция обработки нажатий на кнопки трансформаций
  const handleActiveTransformTab = (tabName, value=0, intersectedState, freeCons) => {
    console.log(intersectedState, 'from handleActiveTransformTab')
    switch (tabName) {
      case "changePosition":
        setNewPosition(freeCons)
        break
      case "place":
        placeDetail(intersectedState)
        break
      case "rotate":
        rotateDetail(value)
        break
      default:
        return
    }
  }
// функция чтения файла ПОКА В РАЗРАБОТКЕ
  const readFile = (type) => {
    reader(file)
    .then((result) => {
      handleDecals(type, result)
      setActiveEditorTab("")
    })
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
    const partType = getPartType(part)
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
      if (partType != 'jumper') {
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
          rotation: [0, 0, 0]
        })
      } else {
        // добавим запись о джампере
        !hasNimbedPart && appState.assemblyMap.push({
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
          maxScale: 1
          } )
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
        rotation: [0, 0, 0]
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
    setHasParts(true)
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
      addButton: true,
      undoButton: false,
      deleteLastButton: false
    })

  }

  const setNewPosition = (freeCons) => {
// функция установки детали с которой работаем на сборку в новой позиции (при нажатии кнопки перемещения на вкладке трансформации)
// отсеим свободные коннекторы с отрицательным индексом то есть те которые относятся к детали с которой работаем
    freeCons = freeCons.filter(freeCon => freeCon.id >= 0)
// индекс детали с которой работаем в карте сборки
    const index = assemblyMap.length-1
    if (hasNimbedPart && assemblyMap[index].type == 'jumper') {
    // работаем если устанавливаем джампер
    // начала и конец рельсы перемещения джампера
      const start = new Vector3()
      const end = new Vector3()
      start.copy(assemblyMap[index].connectedTo[0].position)
      end.copy(assemblyMap[index].connectedTo[1].position)
      // вектор рельсы и длина джампера по факту
      const rail = new Vector3().subVectors(start, end)
      const length = rail.length() * assemblyMap[assemblyMap.length-1].scale[0]
      // начальная позиция джампера
      const position = new Vector3()
      position.fromArray(assemblyMap[index].position)
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
    // если работаем с другой деталью не с джампером
    if (hasNimbedPart && freeCons[0]) {
      // если номер свободного коннектора больше последнего из всех свободных коннекторов то назначим первый из свободных
      if (conNumber > freeCons.length - 1) {
        setConNumber(0)
        return
      }
      // в объекте детали в карте сборке присвоим новый коннектор 
      appState.assemblyMap[assemblyMap.length-1].connectedTo = [{
        id: freeCons[conNumber].id,
        connector: {name: freeCons[conNumber].conName}
      }]
      // если этот коннектор последний то назначим номер нулем иначе следующим номером свободного коннектора
      conNumber + 1 > freeCons.length - 1 ? setConNumber(0) : setConNumber(conIndex + 1) 
    } else {
      alert(alerts.onlyOnePositionsAvalable.ru)
    }

  }

  const placeDetail = (intersectedState) => {
    
    if (hasNimbedPart) {
      console.log(snap.intersected, intersectedState)
      if (intersectedState.filter(state => state).length<2) {
        appState.assemblyMap[assemblyMap.length-1].id = -appState.assemblyMap[assemblyMap.length-1].id
        setHasNimbedPart(false)
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
        changePosition: false,
        place: false,
        rotate:false
      })
    }
  }

  const rotateDetail = (value) => {

    if (hasNimbedPart) {

      if (isRotatable()) {
        if (assemblyMap[assemblyMap.length-1].type == 'jumper') {
          const maxScale = assemblyMap[assemblyMap.length-1].maxScale
          appState.assemblyMap[assemblyMap.length-1].scale[0] = (value/360)*(maxScale-0.2) + 0.2
        } else {
          appState.assemblyMap[assemblyMap.length-1].rotation = [0, value*(Math.PI/180), 0]
        }
      } else {
        alert(alerts.arentRotatable.ru)
      }
      
    }
    
  }

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key='custom'
            className='absolute top-0 left-0 z-10'
            {...slideAnimation('left')}
          >
            <div className='flex items-center min-h-screen'>
              <div className='editortabs-container tabs'>
                {EditorTabs.map((tab) => (
                  <Tab 
                    key={tab.name}
                    tab={tab}
                    isActive={activeEditorTab === tab.name}
                    handleClick = {()=>setActiveEditorTab(tab.name === activeEditorTab ? "" : tab.name)}
                  />
                ))}
                <Suspense>
                  {generateTabContent()}
                </Suspense>
              </div>
            </div>
          </motion.div>

          <motion.div
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
            className='filtertabs-container'
            {...slideAnimation('up')}
          >
            {TransformTabs.map((tab) => (
                  <Tab 
                    key={tab.name}
                    tab={tab}
                    isActive = {activeTransformTab[tab.name]}
                    isTransformTab
                    handleClick = {(value, intersectedState, freeCons)=> handleActiveTransformTab(tab.name, value, intersectedState, freeCons)}
                  />
                ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer