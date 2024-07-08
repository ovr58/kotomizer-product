import React, { useEffect, useState } from 'react'

import { Parts } from '../config/constants'

import { useSnapshot } from 'valtio'
import appState from '../store'

import CustomButton from './CustomButton'
import PartPreview from '../canvas/PartPreview'

function PartsPicker({ 
  partPickerButtonsStatus, 
  addToMap, 
  unDoAdd, 
  deleteLast, 
  freeCons, 
}) {
  
  const snap = useSnapshot( appState )

  const [ clicked, setClicked ] = useState('')

  const getClickedIndexChanged = (arrow) => {
    if (clicked != '') {
      const partsAvailable = Parts.filter((part) => part.available == true)
      if (partsAvailable && partsAvailable.length>1) {
        const indexOfClicked = partsAvailable.indexOf(partsAvailable.filter((part) => part.name == clicked)[0])
        if (arrow == 'right') {
            if (indexOfClicked < (partsAvailable.length - 1)) {
              setClicked(partsAvailable[indexOfClicked+1].name)
            } else {
              setClicked(partsAvailable[0].name)
            }
          } else if (arrow == 'left') {
          if (indexOfClicked > 0) {
            setClicked(partsAvailable[indexOfClicked-1].name)
          } else {
            setClicked(partsAvailable[partsAvailable.length-1].name)
          }
        }
      }
    }
  }

  if (freeCons[0] && snap.assemblyMap.length == 0) {
    Parts.forEach((part) => part.type != 'base' ? part.available = true : part.available = false)
  } else if (freeCons[0] && snap.assemblyMap.length !=0) {
    Parts.forEach((part) => part.type == 'base' ? part.available=false : part.available = true)
  } else if (!freeCons[0] && snap.assemblyMap.length !=0) {
    Parts.forEach((part) => part.type == 'jumper' ? part.available=true : part.available = false)
  } else {
    Parts.forEach((part) => part.type == 'base' ? part.available = true : part.available = false)
  }
  return (
    <div
      className='partpicker-container'
    >
      <div className='flex flex-1 flex-wrap gap-1 min-h-10 max-h-20'>
        <p className='mt-2 text-gray-500 text-xs truncate'>
          {clicked === "" ? "No part selected" : 
            `${Parts.filter((part => Object.values(part).indexOf(clicked)>-1))[0].description} price $
            ${Parts.filter((part => Object.values(part).indexOf(clicked)>-1))[0].price}`
          }
        </p>
      </div>
      <div className='flex flex-2 flex-wrap left-full h-full'>
        <PartPreview setClicked={setClicked} clicked={clicked} />
      </div>
      <CustomButton 
          type={"filled"}
          title=""
          handleClick={() => {getClickedIndexChanged('left')}}
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
          handleClick={() => {getClickedIndexChanged('right')}}
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
          title="Add"
          handleClick={() => {addToMap(clicked)}}
          customStyles='text-xs'
        />
        <CustomButton 
          type={partPickerButtonsStatus.undoButton ? "filled" : "blocked"}
          title="Undo"
          handleClick={() => {unDoAdd()}}
          customStyles='text-xs'
        />
        <CustomButton 
          type={partPickerButtonsStatus.deleteLastButton ? "filled" : "blocked"}
          title="Delete"
          handleClick={() => {deleteLast()}}
          customStyles='text-xs'
        />
      </div>
    </div>
  )
}

export default PartsPicker