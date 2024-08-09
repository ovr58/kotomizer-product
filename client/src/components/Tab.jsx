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
          <div className="relative group">
            <KnobControl 
              indicator={tab.indicator}
              setValue={setValue}
              customStyle={
                isActive ? 'opacity-100 fill-black' : 'opacity-50 fill-yellow-100 pointer-events-none'
              } 
            />
            <div className="absolute hidden px-2 py-1 text-sm text-center text-white bg-gray-700 rounded opacity-0 group-hover:block group-hover:opacity-100 transition-opacity duration-300 -top-10 left-1/2 transform -translate-x-1/2">
              {tab.label}
            <div className="absolute w-3 h-3 bg-gray-700 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </div> :
        <div 
          key={tab.name} 
          className={`tab-btn rounded-full glassmorphism rounded-4 ${isActive ? 'opacity-100': isTransformTab ? 'opacity-50 pointer-events-none' : 'opacity-50'}`}
          onClick={() => handleClick(value)}
          style={activeStyles}
        >
          <div className="relative group">
            <img 
              src={tab.icon}
              alt={tab.name}
              className='object-contain'
            />
            <div className={
              `absolute 
              hidden 
              px-2 
              py-1 
              text-sm 
              text-center
              text-white
              bg-gray-700 
              rounded 
              opacity-0 
              group-hover:block 
              group-hover:opacity-100 
              transition-opacity 
              duration-300 
              -top-10 
              left-1/2 
              ${!isTransformTab ? 'transform -translate-x-1/4' : 'transform -translate-x-1/2'}`
              }
            >
              {tab.label}
            <div className={`absolute w-3 h-3 bg-gray-700 transform rotate-45 -bottom-1 ${!isTransformTab ? 'left-1/4' : 'left-1/2'} -translate-x-1/2`}></div>
            </div>
          </div>
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