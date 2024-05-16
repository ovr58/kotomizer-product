import PropTypes from 'prop-types'
import { useSnapshot } from 'valtio'

import state from '../store'

import { getContrastingColor } from '../config/helpers'

const CustomButton = ({ type, title, customStyles, handleClick}) => {
    const snap = useSnapshot(state)
    const generateStyle = (type) => {
        if (type === 'filled') {
            return {
                backgroundColor: snap.color,
                color: getContrastingColor(snap.color)
            }
        } else if  (type === 'outline') {
            return {
                borderWidth: "1px",
                borderColor: snap.color,
                color: snap.color
            }
        } else if (type === 'blocked') {
            return {
                borderWidth: "1px",
                borderColor: 'grey',
                color: 'white',
                backgroundColor: 'grey'
            }
        }
    }
  return (
    <button
        className={`px-2 py-1.5 flex-1 rounded-md ${customStyles}`}
        style={generateStyle(type)}
        onClick={handleClick}
    >   
        {title}
    </button>
  )
}

CustomButton.propTypes = {
    type: PropTypes.string,
    title: PropTypes.string,
    customStyles: PropTypes.string,
    handleClick: PropTypes.func
}

export default CustomButton