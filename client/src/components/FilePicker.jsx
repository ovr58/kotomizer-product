import React from 'react'

import PropTypes from 'prop-types'

import CustomButton from './CustomButton'
import { FilePreview } from '../canvas'
import appState from '../store'

const FilePicker = ({ file, setFile, handleDownLoad }) => {
  appState.camRotation = false
  console.log('FILEPICKER RENDERED')
  return (
    <div
      className='filepicker-container'
    >
      <div className='flex-1 flex flex-col'>
        <input 
          id='file-upload'
          type='file'
          accept='.cpi,image/*'
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label
          htmlFor='file-upload' className='filepicker-label'
        >
          Upload File
        </label>

        <p>{file ? file.name : "No file selected"}</p>
      </div>
      
      {file &&
       <FilePreview file={file} setFile={setFile}/>
      }

      <div className='mt-4 flex flex-wrap gap-3'>
        <CustomButton 
          type={file && file.type != 'image/jpeg' ? "filled" : "blocked"}
          title="Upload The Model"
          handleClick={() => handleDownLoad('Upload The Cat Post', file)}
          customStyles='text-xs'
        />
        <CustomButton 
          type={file && file.type == 'image/jpeg' ? "filled" : "blocked"}
          title="Set The Background"
          handleClick={() => handleDownLoad('Set Background', file)}
          customStyles='text-xs'
          // добавить подсказки
        />
        <CustomButton 
          type="filled"
          title="Save The Cat Post"
          handleClick={() => handleDownLoad('Save The Cat Post')}
          customStyles='text-xs'
        />
        <CustomButton 
          type="filled"
          title="Photo The Cat Post"
          handleClick={() => handleDownLoad('Photo The Cat Post')}
          customStyles='text-xs'
        />
      </div>
    </div>
  )
}

export default FilePicker

FilePicker.propTypes = {
  file: PropTypes.object,
  setFile: PropTypes.func,
  readFile: PropTypes.func,
}