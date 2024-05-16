import React, { useState } from 'react'

import PropTypes from 'prop-types'

import { useSnapshot } from 'valtio'

import state from '../store'
import KnobControl from './KnobControl'

const Tab = ({ tab, isTransformTab, handleClick }) => {

  const snap = useSnapshot(state)

  const [ value, setValue ] = useState(0)

  const activeStyles = isTransformTab ? //добавить интерактив на активность?
    { backgroundColor: snap.color, opacity: 0.5 } :
    { backgroundColor: "transparent", opacity: 1 }

  return (
    <>
      {tab.name == 'rotate' ? 
        <div 
          key={tab.name} 
          className='tab-btn rounded-full glassmorphism rounded-4' >
          <KnobControl setValue={setValue} value={value} customStyle='object-contain' />
        </div> :
        <div 
          key={tab.name} 
          className='tab-btn rounded-full glassmorphism rounded-4'
          onClick={handleClick}
          style={activeStyles}
        >
          <img 
            src={tab.icon}
            alt={tab.name}
            className='object-contain'
          />
        </div>
      }
    </>
  )
}

export default Tab

Tab.propTypes = {
  tab: PropTypes.object,
  isTransformTab: PropTypes.bool,
  handleClick: PropTypes.func,
}