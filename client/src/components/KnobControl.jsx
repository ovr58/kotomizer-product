import PropTypes from 'prop-types'

import { useDraggable } from '../hook'
import { useEffect } from 'react'

const KnobControl = ({ setValue, value, customStyle }) => {

    const [ draggableRef, dx, dy, angle ] = useDraggable()

    useEffect(() => {
      setValue(angle)
    }, [angle])
    
  return (
    <div className={`'circle '`}>
      <div ref={draggableRef} className='dot' style={{
              transform: `translate(${dx}px, ${dy}px)`,
          }}
      >
      </div>
      <p>{value}</p>
    </div>
  )
}

KnobControl.propTypes = {
    
}

export default KnobControl