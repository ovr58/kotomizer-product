import React from 'react'

import { SketchPicker } from 'react-color'

import { useSnapshot } from 'valtio'
import appState from '../store'

const ColorPicker = () => {

  const snap = useSnapshot(appState)

  return (
    <div 
      className='absolute left-full ml-3'
    >
      <SketchPicker 
        color={snap.color}
        disableAlpha
        presetColors={[
          "#a6cee3",
          "#1f78b4",
          "#b2df8a",
          "#33a02c",
          "#fb9a99",
          "#e31a1c",
          "#fdbf6f",
          "#ff7f00",
          "#cab2d6",
          "#6a3d9a",
          "#ffff99",
          snap.color
        ]}
        onChange={(color) => appState.color = color.hex}
      />
    </div>
  )
}

export default ColorPicker