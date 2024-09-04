import React, { useEffect, useState } from 'react'

import PropTypes from 'prop-types'

import CustomButton from './CustomButton'
import CustomList from './CustomList'

import { FilePreview } from '../canvas'
import { supabase } from '../client'

import { v4 as uuidv4 } from 'uuid'
import appState from '../store'
import { getPriceAndSpecs } from '../config/helpers'

const CatpostShop = () => {
  console.log('CATPOSTSHOP RENDERED')

  const [data, setData] = useState(null)
  const [city, setCity] = useState(null)
  const [allFiles, setAllFiles] = useState([])
  const [file, setFile] = useState(null)
  const [indexInFiles, setIndexInFiles] = useState(0)
  const [price, setPrice] = useState(0)

    useEffect(() => {
      getData()
    }, [])

    useEffect(() => {
      getFiles()
      
    }, [city])

    useEffect(() => {
      allFiles.length > 0 && (
        setFile(getFile(Object.values(allFiles[indexInFiles])[0])),
        setPrice(getPriceAndSpecs(JSON.parse(Object.values(allFiles[indexInFiles])[0])).totalPrice)
      )
    }, [indexInFiles])

    function handleChoice(mode) {
      switch (mode) {
        case 'forward':
          setIndexInFiles((prevIndexInFiles) => {
            return prevIndexInFiles === (allFiles.length - 1) ? 0 : prevIndexInFiles+1
          })
          break;
          case 'back':
            setIndexInFiles((prevIndexInFiles) => {
            return prevIndexInFiles === 0 ? (allFiles.length - 1) : prevIndexInFiles-1
          })
          break;
        case 'select':
          appState.shopModelData = data[Object.keys(allFiles[indexInFiles])[0]]
          appState.assemblyMap = JSON.parse(Object.values(allFiles[indexInFiles])[0])
          break;
      
        default:
          break;
      }
    }

    function getFile(data) {
      const blob = new Blob([data], { type: "application/json" })
      const file = new File([blob], `${uuidv4()}.json`, { type: "application/json" })
      return file
    }

    async function getFiles() {
      const { data, error } = await supabase.from('catPostShop').select()
      if (error) {
        console.log('ERROR')
      }
      const allFiles = city ? 
        Object.keys(data).filter((key) => data[key].seller_city === city).map((key) => {return {[key]: data[key].seller_stock}}) : []
      console.log('ALL FILES - ', allFiles)
      setAllFiles(allFiles)
      setFile(allFiles.length>0 ? getFile(Object.values(allFiles[0])[0]) : null)
      setPrice(getPriceAndSpecs(JSON.parse(Object.values(allFiles[0])[0])).totalPrice)
      setIndexInFiles(0)
    }

    async function getData() {
      const { data, error } = await supabase.from('catPostShop').select()
      if (error) {
        console.log('ERROR')
        return
      }
      setData(data)
    }

  return (
    <div
      className='filepicker-container'
    >
      {allFiles[0] && 
      <div className='waviy-price z-50 top-1/3 right-10'>
        <span 
          className='
            shadow-sm 
            shadow-slate-800 
            text-[40px]
          ' 
          key={`rubSign`} 
          style={{'--i':`${1}`}}
        >
          ₽
        </span>
        {
          price.split('').map((letter, i, arr) => (
              <span 
                className={
                  `shadow-sm 
                  shadow-slate-800 
                  ${i>=arr.indexOf('.') ? 'text-[20px] align-top' : 'text-[40px] w-7 text-center'}`
                }
                key={`${letter}/${i}`} style={{'--i':`${i+2}`}}
              >
                {letter}
              </span>
            ))
        }
      </div>}
      <div className='flex-1 flex flex-col'>
        {data && <CustomList 
          id='cities-list'
          title={city ? city : 'Выбрать город...'}
          list={[...new Set(Object.keys(data).map((key) => data[key].seller_city))]}
          setOption={setCity}
        />}
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