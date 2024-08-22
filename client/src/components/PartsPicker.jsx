import React, { useEffect, useMemo, useState } from 'react'

import { Parts } from '../config/constants'

import { useSnapshot } from 'valtio'
import appState from '../store'

import CustomButton from './CustomButton'
import PartPreview from '../canvas/PartPreview'
import { useGLTF } from '@react-three/drei'

function PartsPicker({ 
  partPickerButtonsStatus, 
  addToMap, 
  unDoAdd, 
  deleteLast, 
}) {
  
  const snap = useSnapshot( appState )

  const freeCons = snap.freeCons.filter((freeCon) => freeCon.id>=0)

  const [ clicked, setClicked ] = useState('')

  const objects = useMemo(() => Object.keys(Parts).map((name) => useGLTF(`/${name}.glb`)), [])
  console.log('CLICKED - ', clicked)
  if (freeCons[0] && snap.assemblyMap.length == 0) {
    Object.keys(Parts).forEach(
      (name) => Parts[name].type != 'base' ? Parts[name].available = true : Parts[name].available = false)
  } else if (freeCons[0] && snap.assemblyMap.length !=0) {
    Object.keys(Parts).forEach(
      (name) => Parts[name].type == 'base' ? Parts[name].available=false : Parts[name].available = true)
  } else if (!freeCons[0] && snap.assemblyMap.length !=0) {
    Object.keys(Parts).forEach(
      (name) => Parts[name].type == 'jumper' ? Parts[name].available=true : Parts[name].available = false)
  } else {
    Object.keys(Parts).forEach(
      (name) => Parts[name].type == 'base' ? Parts[name].available = true : Parts[name].available = false)
  }

  const partsAvailable = Object.keys(Parts).map(
    (name) => Parts[name].available ? Parts[name] : 'unavailable'
  )
  
  const getClickedIndexChanged = (arrow) => {
    const indexOfClicked = Number(clicked.replace('part', '')) - 1
    if (partsAvailable && partsAvailable.length>0) {
      if (arrow == 'right') {
        const indexOfNeeded = (indexOfClicked) => {
          return (indexOfClicked + 1) > (partsAvailable.length - 1) ? 0 : (indexOfClicked + 1)
        }
        let index = indexOfClicked
        if (!partsAvailable.every((part) => part === 'unavailable')) {
          do {
            index = indexOfNeeded(index)
            console.log('INDEX -', index, indexOfClicked)
            if (partsAvailable[index] != 'unavailable') {
              setClicked(partsAvailable[index].filename.split('.')[0].replace('/', ''))
              return 'CHANGED RIGHT'
            }
          } while (index !== indexOfClicked)
        }
        return 'CHANGED RIGHT'
      } else if (arrow == 'left') {
        const indexOfNeeded = (indexOfClicked) => {
          console.log(partsAvailable)
          return indexOfClicked > 0 ? (indexOfClicked - 1) : (partsAvailable.length - 1) 
        }
        let index = indexOfClicked
        
        if (!partsAvailable.every((part) => part === 'unavailable')) {
          do {
            index = indexOfNeeded(index)
              console.log('INDEX -', index)
              if (partsAvailable[index] != 'unavailable') {
                setClicked(partsAvailable[index].filename.split('.')[0].replace('/', ''))
                return
              }
          } while (index !== indexOfClicked)
        }
        return
      }
    } 
  }

  useEffect(() => {
    clicked === '' && getClickedIndexChanged('right')
    console.log('EFFECT')
  }, [])


  return (
    <div
      className='partpicker-container'
    >
      <div className='flex flex-1 flex-wrap gap-1 min-h-10 max-h-20'>
        <p className='mt-2 text-gray-500 text-xs truncate'>
          {clicked === "" ? "No part selected" : 
            `${Parts[clicked].description} price $
            ${Parts[clicked].price}`
          }
        </p>
      </div>
      <div className='flex flex-2 flex-wrap left-full h-full'>
        {objects[0] && clicked !='' && <PartPreview clicked={clicked} object={objects[Number(clicked.replace('part', ''))-1]} />}
      </div>
      <CustomButton 
          type={"filled"}
          title=""
          handleClick={() => getClickedIndexChanged('left')}
          customStyles='
            absolute top-1/2 
            left-10 
            hover:ring-4 
            hover:outline-none 
            hover:ring-white 
            font-medium 
            rounded-lg 
            text-sm 
            p-2.5 
            text-center 
            inline-flex 
            items-center
            me-2
            animate-pulse'
      >
        <svg className="w-5 h-5" 
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 14 10"
        >
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M13 5H1M1 5L5 1M1 5L5 9"
          />
        </svg>
      </CustomButton>
      <CustomButton 
          type={"filled"}
          title=""
          handleClick={() => getClickedIndexChanged('right')}
          customStyles='
            absolute top-1/2 
            right-10 
            hover:ring-4 
            hover:outline-none 
            hover:ring-white 
            font-medium 
            rounded-lg 
            text-sm 
            p-2.5 
            text-center 
            inline-flex 
            items-center
            me-2
            animate-pulse'
      >
        <svg className="w-5 h-5" 
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 14 10"
        >
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M1 5H13M13 5L9 1M13 5L9 9"
          />
        </svg>
      </CustomButton>
      <div className='flex flex-wrap gap-3'>
        <CustomButton 
          type={partPickerButtonsStatus.addButton ? "filled" : "blocked"}
          title="Добавить"
          handleClick={() => addToMap(clicked, setClicked)}
          customStyles='text-xs'
        />
        <CustomButton 
          type={partPickerButtonsStatus.undoButton ? "filled" : "blocked"}
          title="Отменить"
          handleClick={unDoAdd}
          customStyles='text-xs'
        />
        <CustomButton 
          type={partPickerButtonsStatus.deleteLastButton ? "filled" : "blocked"}
          title="Удалить"
          handleClick={() => deleteLast(setClicked)}
          customStyles='text-xs'
        />
      </div>
    </div>
  )
}

export default PartsPicker

Object.keys(Parts).forEach((name) => {
  useGLTF.preload(`/${name}.glb`)
})