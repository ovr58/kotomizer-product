import React, { useEffect, useState } from 'react'

import PropTypes from 'prop-types'

import appState from '../store'
import KnobControl from './KnobControl'

const Tab = ({ tab, isActive, isTransformTab, handleClick }) => {

  const [ value, setValue ] = useState(0)
  
  useEffect(() => {
    if (isActive && tab.name === 'rotate') {
      handleClick(value)
    } 
  }, [value])

  const activeStyles = isTransformTab && isActive ? 
    { backgroundColor: "transparent", opacity: 1 } :
    { backgroundColor: appState.color, }

  return (
    <>
      {tab.name == 'rotate' ? 
        <div 
          key={tab.name} 
          className='tab-btn rounded-full glassmorphism rounded-4' 
        >
          <KnobControl setValue={setValue} value={value} customStyle={isActive ? 'opacity-100 fill-black' : 'opacity-50 fill-yellow-100 pointer-events-none'} />
        </div> :
        <div 
          key={tab.name} 
          className={`tab-btn rounded-full glassmorphism rounded-4 ${isActive ? 'opacity-100': isTransformTab ? 'opacity-50 pointer-events-none' : 'opacity-50'}`}
          onClick={() => handleClick(value)}
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
  isActive: PropTypes.bool,
  isTransformTab: PropTypes.bool,
  handleClick: PropTypes.func,
}