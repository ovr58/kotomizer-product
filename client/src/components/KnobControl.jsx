import PropTypes from 'prop-types'

import { useDraggable } from '../hook'
import { useEffect } from 'react'

const KnobControl = ({ indicator, setValue, customStyle }) => {

    const [ draggableRef, dx, dy ] = useDraggable()

    const knobL = 2*Math.PI*44

    useEffect(() => {
      let radian = dx !=50 ? Math.atan((dy-10)/(dx-50)) : dy != 10 ? 1.57 : Math.PI
      let l = 2*radian*44
      let change = Math.floor((360*(0.5-l/knobL))/10) * 10
      setValue(change)
    }, [dx, dy])
    
  return (
    <div>
      <svg aria-hidden="true" className={`inline w-[60px] h-[60px] text-gray-500 ${customStyle}`}  viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="50" y="55" textAnchor="middle" className="font-extrabold">{`${indicator}`}</text>
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <circle className='hover:cursor-move' ref={draggableRef} cx={dx} cy={dy} r="10" />
      </svg>
    </div>
  )
}

KnobControl.propTypes = {
    
}

export default KnobControl