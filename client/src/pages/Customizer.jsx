import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useSnapshot } from 'valtio'
import state from '../store'

import config from '../config/config'
import { Parts } from '../config/constants'

import { download } from '../assets'

import { reader } from '../config/helpers'
import { EditorTabs,  DecalTypes, TransformTabs, alerts } from '../config/constants'

import { fadeAnimation, slideAnimation } from '../config/motion'

import {CustomButton, ColorPicker, FilePicker, PartsPicker, Tab} from '../components'

const Customizer = () => {

  const snap = useSnapshot(state)

  const assemblyMap = JSON.parse(JSON.stringify(snap.assemblyMap))
  
  const [file, setFile] = useState('')

  const [freeCons, setFreeCons] = useState(snap.freeCons)
  const [conNumber, setConNumber] = useState(freeCons.length)
  const [hasParts, setHasParts] = useState(Boolean(assemblyMap.length > 0))
  const [hasFreeCons, setHasFreeCons] = useState(Boolean(freeCons[0]))
  const [hasNimbedPart, setHasNimbedPart] = useState(
    assemblyMap.length>1 ? Boolean(assemblyMap[assemblyMap.length-1].id < 0) : false)

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

  const isRotatable = (partName) => {

    const nimbedPartName = hasNimbedPart ? assemblyMap[assemblyMap.length-1].name : partName

    const isRotatable = Parts.filter((part) => part.name==nimbedPartName)[0].rotatable

    return isRotatable
  }

  const getPartType = (partName) => {
    return Parts.filter((part) => part.name==partName)[0].type
  }

  const [partPickerButtonsStatus, setPartPickerButtonsStatus] = useState({
    undoButton: hasParts && hasNimbedPart,
    addButton: !hasNimbedPart && hasFreeCons,
    deleteLastButton: !hasNimbedPart && hasParts
  })

  useEffect(() => {
    setPartPickerButtonsStatus({
      undoButton: hasParts && hasNimbedPart,
      addButton: !hasNimbedPart && hasFreeCons,
      deleteLastButton: !hasNimbedPart && hasParts
    })
  }, [hasFreeCons, hasParts, hasNimbedPart])

  const [activeEditorTab, setActiveEditorTab] = useState("")

  const [activeTransformTab, setActiveTransformTab] = useState({
    changePosition: false,
    place: false,
    rotate:false
  })

  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />
      case "filepicker":
        return <FilePicker 
                  file={file}
                  setFile={setFile}
                  readFile={readFile}
                />
      case "partspicker":
        return <PartsPicker 
                  partPickerButtonsStatus={partPickerButtonsStatus}
                  addToMap={addToMap}
                  unDoAdd={unDoAdd}
                  deleteLast={deleteLast}
                  freeCons={freeCons.filter(freeCon => freeCon.id >= 0)}
               />
      default:
        return null
    }
  }

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type]

    state[decalType.stateProperty] = result
  }

  const handleActiveTransformTab = (tabName, value=0, intersectedState, freeCons) => {
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

  const readFile = (type) => {
    reader(file)
    .then((result) => {
      handleDecals(type, result)
      setActiveEditorTab("")
    })
  }

  const addToMap = (part) => {

    if (partPickerButtonsStatus.undoButton || !part) {
      alert(alerts.cantAdd.ru)
      return
    }
    
    const partIndex = assemblyMap.length
    const firstFreeCon = snap.freeCons[0]
    const partType = getPartType(part)
    
    setPartPickerButtonsStatus({
      undoButton: true,
      addButton: false,
      deleteLastButton: false
    })

    setActiveTransformTab({
      changePosition: true,
      place: true,
      rotate: isRotatable(part)
    })
    
    if (partIndex != 0) {
      if (partType != 'jumper') {
        !hasNimbedPart && state.assemblyMap.push({
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
        !hasNimbedPart && state.assemblyMap.push({
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
          rotation: [0, 0, 0]
          } )
        } 
      setHasNimbedPart(true)
    } else {
      state.assemblyMap.push({
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
    }
    setHasParts(true)
  }

  const unDoAdd = () => {
    
    if (partPickerButtonsStatus.addButton || assemblyMap.length <= 0) {
      alert(alerts.cantUndo.ru)
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

    if (assemblyMap.length > 0 && hasNimbedPart) {
      state.assemblyMap.pop()
      setHasNimbedPart(false)
    }
  }

  const deleteLast = () => {

    if (partPickerButtonsStatus.undoButton || assemblyMap.length <= 0) {
      alert(alerts.cantDeleteLast.ru)
      return
    }

    if (assemblyMap.length > 0) {
      state.assemblyMap.pop()
      assemblyMap.length - 1 == 0 && setPartPickerButtonsStatus({
        addButton: true,
        undoButton: false,
        deleteLastButton: false
      })
    }

  }

  const setNewPosition = (freeCons) => {
    freeCons = freeCons.filter(freeCon => freeCon.id >= 0)
    
    if (hasNimbedPart && freeCons[0]) {
      if (conNumber > freeCons.length - 1) {
        setConNumber(0)
        return
      }
      console.log(conNumber, freeCons[conNumber])
      state.assemblyMap[assemblyMap.length-1].connectedTo = [{
        id: freeCons[conNumber].id,
        connector: {name: freeCons[conNumber].conName}
      }]
      conNumber + 1 > freeCons.length - 1 ? setConNumber(0) : setConNumber(conIndex + 1) 
    } else {
      alert(alerts.onlyOnePositionsAvalable.ru)
    }

  }

  const placeDetail = (intersectedState) => {
    
    if (hasNimbedPart) {
      console.log(intersectedState)
      if (intersectedState.filter(state => state).length<2) {
        state.assemblyMap[assemblyMap.length-1].id = -state.assemblyMap[assemblyMap.length-1].id
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
        state.assemblyMap[assemblyMap.length-1].rotation = [0, value*(Math.PI/180), 0]
      } else {
        alert(alerts.arentRotatable.ru)
      }
      
    }
    return
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
              handleClick={() => state.intro = true}
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