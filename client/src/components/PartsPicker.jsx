import React, { useState } from 'react'

import { Parts } from '../config/constants'

import CustomButton from './CustomButton'
import PartPreview from '../canvas/PartPreview'

function PartsPicker({ 
  partPickerButtonsStatus, 
  addToMap, 
  unDoAdd, 
  deleteLast, 
  freeCons, 
}) {
  
  const [ clicked, setClicked ] = useState('')

  if (freeCons[0]) {
    Parts.forEach((part) => part.type != 'base' ? part.available = true : part.available = false)
  } else if (partPickerButtonsStatus.deleteLastButton) {
    Parts.forEach((part) => part.available = false)
  } else {
    Parts.forEach((part) => part.type == 'base' ? part.available = true : part.available = false)
  }
  return (
    <div
      className='partpicker-container'
    >
      <div className='flex flex-1 flex-wrap gap-1'>
        <p className='mt-2 text-gray-500 text-xs truncate'>
          {clicked === "" ? "No part selected" : 
            `${Parts.filter((part => Object.values(part).indexOf(clicked)>-1))[0].description} price $
            ${Parts.filter((part => Object.values(part).indexOf(clicked)>-1))[0].price}`
          }
        </p>
      </div>
      <div className='grid grid-cols-3 gap-4'>
        {Parts.map((partModel, _i) => (
          <div className='w-28 h-28' key={partModel.name} >
            <PartPreview partModel={partModel} setClicked={setClicked} clicked={clicked} />
          </div>
        ))}
      </div>
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