import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSnapshot } from 'valtio'

import state from '../store'

import config from '../config/config'

import { download } from '../assets'

import { downloadCanvasToImage, positions, reader } from '../config/helpers'
import { EditorTabs,  DecalTypes, TransformTabs, alerts } from '../config/constants'

import { fadeAnimation, slideAnimation } from '../config/motion'

import {CustomButton, ColorPicker, FilePicker, PartsPicker, Tab} from '../components'

const Customizer = () => {

  const snap = useSnapshot(state)

  const assemblyMap = JSON.parse(JSON.stringify(snap.assemblyMap))
  
  const [file, setFile] = useState('')

  const freeCons = snap.parts.length>0 ? positions(assemblyMap, snap.parts).freeCons : []

  const [conNumber, setConNumber] = useState(0)

  console.log(conNumber)

  const hasParts = Boolean(assemblyMap.length > 0)
  const hasNimbedPart = hasParts ? assemblyMap[assemblyMap.length-1].id < 0 : false
  const hasFreeCons = snap.parts.length>0 ? Boolean(freeCons[0]) : false

  const [partPickerButtonsStatus, setPartPickerButtonsStatus] = useState({
    undoButton: hasNimbedPart,
    addButton: !hasNimbedPart && hasFreeCons,
    deleteLastButton: !hasNimbedPart && hasParts
  })

  const [activeEditorTab, setActiveEditorTab] = useState("")

  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
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
                    setPosition={setNewPosition}
                    placeDetail={placeDetail}
               />
      default:
        return null
    }
  }

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type]

    state[decalType.stateProperty] = result

    // if (!activeFilterTab[decalType.filterTab]) {
    //   handleActiveFilterTab(decalType.filterTab)
    // }
  }

  const handleActiveTransformTab = (tabName) => {
    switch (tabName) {
      case "changePosition":
        setNewPosition(freeCons.filter(freeCon => freeCon.id >= 0))
        break
      case "place":
        placeDetail()
        break
      case "rotate":
        // rotateDetail()
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
    const firstFreeCon = positions(assemblyMap, snap.parts).freeCons[0]
    const hasNimbedPart = partIndex !=0 ? assemblyMap[assemblyMap.length-1].id < 0 : false
    
    setPartPickerButtonsStatus({
      undoButton: true,
      addButton: false,
      deleteLastButton: false
    })

    if (partIndex != 0) {
      !hasNimbedPart && state.assemblyMap.push({
        id: -partIndex,
        name: part,
        connectedTo: [{ id: firstFreeCon.id,
                        connector: {name: firstFreeCon.conName}
        }]
      })
    } else {
      state.assemblyMap.push({
        id: partIndex,
        name: part,
        connectedTo: []
      })
      setPartPickerButtonsStatus({
        undoButton: false,
        addButton: true,
        deleteLastButton: true
      })
    }
  }

  const unDoAdd = () => {
    
    if (partPickerButtonsStatus.addButton || assemblyMap.length <= 0) {
      alert(alerts.cantUndo.ru)
      return
    }

    const hasNimbedPart = assemblyMap[assemblyMap.length-1].id < 0

    setPartPickerButtonsStatus({
      undoButton: false,
      addButton: true,
      deleteLastButton: true
    })

    if (assemblyMap.length > 0 && hasNimbedPart) {
      state.assemblyMap.pop()
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
    
    const hasNimbedPart = assemblyMap[assemblyMap.length-1].id < 0
    
    if (hasNimbedPart && freeCons[0]) {
      // get there connectedTo new
      state.assemblyMap[assemblyMap.length-1].connectedTo = [{
        id: freeCons[conNumber].id,
        connector: {name: freeCons[conNumber].conName}
      }]
      conNumber + 1 > freeCons.length - 1 ? setConNumber(0) : setConNumber(conIndex + 1) 
    } else {
      alert(alerts.onlyOnePositionsAvalable.ru)
    }

  }

  const placeDetail = () => {

    const hasNimbedPart = assemblyMap[assemblyMap.length-1].id < 0

    if (hasNimbedPart) {
      state.assemblyMap[assemblyMap.length-1].id = -state.assemblyMap[assemblyMap.length-1].id
      
      setPartPickerButtonsStatus({
        undoButton: false,
        addButton: true,
        deleteLastButton: true
      })
    }

  }

  const rotateDetail = () => {

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
                    handleClick = {()=>setActiveEditorTab(tab.name === activeEditorTab ? "" : tab.name)}
                  />
                ))}

                {generateTabContent()}
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
                    isTransformTab
                    handleClick = {()=> handleActiveTransformTab(tab.name)}
                  />
                ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer