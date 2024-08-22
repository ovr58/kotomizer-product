import React, { useEffect, useState } from 'react'

import PropTypes from 'prop-types'

import CustomButton from './CustomButton'
import CustomList from './CustomList'

import { FilePreview } from '../canvas'
import { supabase } from '../client'

const CatpostShop = ({ }) => {
  console.log('CATPOSTSHOP RENDERED')

  const [city, setCity] = useState(null)
  const [citiesList, setCitiesList] = useState([])
  const [file, setFile] = useState(null)
  const [indexInAllFiles, setIndexInAllFiles] = useState(0)
  const [allFiles, setAllFiles] = useState([])

    useEffect(() => {
      getCities()
    }, [])

    useEffect(() => {
      getFiles()
    }, [city])

    useEffect(() => {
      setFile(getFile(allFiles[indexInAllFiles]))
    }, [indexInAllFiles])

    function handleChoice(mode) {
      switch (mode) {
        case 'forward':
          setIndexInAllFiles((prevIndexInAllFiles) => {
            console.log('SET FILE - ', allFiles)
            return prevIndexInAllFiles === (allFiles.length - 1) ? 0 : prevIndexInAllFiles++
          })
          break;
        case 'back':
          setIndexInAllFiles((prevIndexInAllFiles) => {
            return prevIndexInAllFiles === 0 ? allFiles.length-- : prevIndexInAllFiles--
          })
          break;
        case 'select':
          
          break;
      
        default:
          break;
      }
    }

    function getFile(data) {
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
      const file = new File([blob], "data.json", { type: "application/json" })
      return file
    }

    async function getFiles() {
      const { data, error } = await supabase.from('catPostShop').select()
      if (error) {
        console.log('ERROR')
      }
      const allFiles = city ? 
        Object.keys(data).filter((key) => data[key].seller_city === city).map((key) => data[key]) : []
      setAllFiles(allFiles)
      setFile(allFiles.length>0 ? getFile(allFiles[0]) : null)
    }

    async function getCities() {
      const { data, error } = await supabase.from("catPostShop").select()
      if (error) {
        console.log('ERROR')
      }
      setCitiesList([...new Set(Object.keys(data).map((key) => data[key].seller_city))])
    }

  return (
    <div
      className='filepicker-container'
    >
      <div className='flex-1 flex flex-col'>
        <CustomList 
          id='cities-list'
          title={city ? city : 'Выбрать город...'}
          list={citiesList}
          setOption={setCity}
        />
      </div>
      
      {file &&
       <FilePreview file={file} setFile={setFile}/>
      }

      <div className='mt-4 flex flex-wrap gap-3'>
        <CustomButton 
          type={file ? "filled" : "blocked"}
          title="Выбрать модель"
          handleClick={() => handleChoice('select')}
          customStyles='text-xs'
        />
        <CustomButton 
          type={file ? "filled" : "blocked"}
          title="Предыдущая  модель"
          handleClick={() => handleChoice('back')}
          customStyles='text-xs'
          // добавить подсказки
        />
        <CustomButton 
          type={file ? "filled" : "blocked"}
          title="Следующая модель"
          handleClick={() => handleChoice('forward')}
          customStyles='text-xs'
        />
      </div>
    </div>
  )
}

export default CatpostShop

CatpostShop.propTypes = {
  file: PropTypes.object,
  setFile: PropTypes.func,
  readFile: PropTypes.func,
}