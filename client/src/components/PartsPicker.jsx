import React, { useState } from 'react'

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
}) {
  
  const snap = useSnapshot( appState )

  const freeCons = snap.freeCons.filter((freeCon) => freeCon.id>=0)

  const [ clicked, setClicked ] = useState('')

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
    if (clicked != '') {
      const indexOfClicked = Number(clicked.replace('part', '')) - 1
      const clickedAvailable = Parts[clicked].available
      console.log(clickedAvailable, indexOfClicked)
      if (partsAvailable && partsAvailable.length>1 && clickedAvailable) {
        if (arrow == 'right') {
          if (indexOfClicked < (partsAvailable.length - 1)) {
            for (let i = (indexOfClicked + 1); i <= (partsAvailable.length - 1); i++) {
              if (partsAvailable[i] != 'unavailable') {
                setClicked(partsAvailable[i].filename.split('.')[0].replace('/', ''))
                return
              }
            }
          }
          setClicked(partsAvailable.filter(
            (part) => part != 'unavailable'
          )[0] ? partsAvailable.filter(
            (part) => part != 'unavailable'
          )[0].filename.split('.')[0].replace('/', '') : '')
          return
        } else if (arrow == 'left') {
          if (indexOfClicked > 0) {
            for (let i = (indexOfClicked - 1); i >= 0; i--) {
              if (partsAvailable[i] != 'unavailable') {
                setClicked(partsAvailable[i].filename.split('.')[0].replace('/', ''))
                return
              }
            }
          }
          setClicked(partsAvailable.filter(
            (part) => part != 'unavailable'
          )[0] ? partsAvailable.filter(
            (part) => part != 'unavailable'
          )[0].filename.split('.')[0].replace('/', '') : '')
        }
      } else if (partsAvailable && partsAvailable.length>0) {
        setClicked(partsAvailable.filter(
          (part) => part != 'unavailable'
        )[0] ? partsAvailable.filter(
          (part) => part != 'unavailable'
        )[0].filename.split('.')[0].replace('/', '') : '')
      }
    } 
  }

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