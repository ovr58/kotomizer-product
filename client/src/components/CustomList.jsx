import PropTypes from 'prop-types'
import { useSnapshot } from 'valtio'

import appState from '../store'

import { getContrastingColor } from '../config/helpers'
import { useState } from 'react'

const CustomList = ({ title, list = [], setOption }) => {

    const snap = useSnapshot(appState)
    
    const [isOpened, setIsOpened] = useState(false)

    const customStyle = {
        backgroundColor: snap.color,
        color: getContrastingColor(snap.color)
    }
    
  return (
    <div className='relative inline-block text-left'>
        <div>
            <button
                className='
                    inline-flex 
                    w-full 
                    justify-center 
                    gap-x-1.5 
                    rounded-md
                    px-3 
                    py-2 
                    text-sm 
                    font-semibold
                    shadow-sm 
                    ring-1 
                    ring-inset
                    ring-gray-300 
                    hover:bg-gray-50
                    '
                style={customStyle}
                id="menu-button" 
                onClick={() => setIsOpened(!isOpened)}
            >   
                {title}
                <svg 
                    className="-mr-1 h-5 w-5" 
                    style={{
                        color: customStyle.color,
                        transform: isOpened ? 'rotate(-180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }} 
                    viewBox="0 0 20 20" 
                    aria-hidden="true"
                >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        <div className="
            absolute 
            right-0 
            z-10 
            mt-1
            w-20 
            origin-top-right 
            rounded-md 
            shadow-lg 
            focus:outline-none
            text-center
            "
            style={{
                borderColor: customStyle.backgroundColor,
                borderWidth: "1px",
                color: customStyle.backgroundColor,
                backgroundColor: 'white',
                opacity: isOpened ? '1' : '0',
                transform: isOpened ? 'scale(1)' : 'scale(0)',
                transition: 'all 0.6s ease-in',
            }}
        >   
            <div className="py-1">
                {list.map((opt) => (
                    <label 
                        className='
                                block 
                                w-full 
                                px-4 
                                py-2 
                                border-b 
                                border-gray-200 
                                cursor-pointer 
                                hover:bg-gray-100
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-blue-700' 
                        onClick={() => setOption(opt.position)}
                    >
                        {opt.conName}
                    </label>
                ))}
            </div>
        </div>
    </div>
  )
}

CustomList.propTypes = {
    title: PropTypes.string,
    list: PropTypes.array,
    handleChoice: PropTypes.func,
}

export default CustomList