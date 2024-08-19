import React, { useEffect, useState } from 'react'
import { downloadFile } from '../config/helpers';
import CustomButton from './CustomButton';
import { useSnapshot } from 'valtio';
import appState from '../store';
import { Parts } from '../config/constants';

function OrderDetail() {

  const [ img, setImg ] = useState(null)
  const [ price, setPrice ] = useState(0)
  const [ tableContent, setTableContent ] = useState({})

  const snap = useSnapshot(appState)
  useEffect(() => {
    let tableObj = {}
    let totalPrice = 0
    snap.assemblyMap.forEach((instruction, i) => {
      const description = `${Parts[instruction.name].description} Материал: ${instruction.material.name || 'стандарт'}`
      const detailPrice = Parts[instruction.name].price * (instruction.scale ? instruction.scale[0]*instruction.scale[1] : 1)
      tableObj[i] = [description, detailPrice.toFixed(2)]
      totalPrice += Math.round(100*detailPrice)/100
    })
    setPrice(totalPrice)
    setTableContent(tableObj)
  }, [snap.assemblyMap])
  console.log('RENDERED - ORDER CARD')
  useEffect(() => {

    (document.querySelector('.mainCanvas canvas') && img === null) && setImg(downloadFile('mainCanvas', 'getImg'))
          
  }, [])

  return (
    <div className="right-container">
      <div className="flex flex-col w-full justify-between items-center">
        {
          img && <img src={img} alt="shopping image"
            className="h-auto rounded-t-lg" />
        }
        <div className="text-xl text-center font-semibold text-red-500">{`Стоимость - ${price} руб.`}</div>
      </div>
      <form className="w-full p-6">
        <div className="flex flex-wrap">
            <div className="flex-none w-full mt-2 text-sm font-medium text-black">Дополнительная информация:</div>
        </div>
        <div className="flex flex-wrap items-baseline mt-4 mb-6 text-gray-700">
          <div className="flex flex-wrap w-full h-auto max-h-24 justify-center overflow-y-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                      <th scope="col" className="px-6 py-3">
                          Описание
                      </th>
                      <th scope="col" className="px-6 py-3">
                          Цена
                      </th>
                  </tr>
              </thead>
              <tbody>
                {Object.keys(tableContent).map((key, i) => (
                  <tr key={`tRow${i}`} className="bg-white border-b">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 wrap">
                          {tableContent[key][0]}
                      </th>
                      <td className="px-6 py-4">
                          {`Р${tableContent[key][1]}`}
                      </td>
                      
                  </tr>
                ))}
             </tbody>
            </table>
          </div>                
        <div className="flex w-full justify-center aign-center m-4 text-sm font-medium">
          <CustomButton 
            type="filled"
            title='Заказ'
            customStyles="py-2 px-4 w-full transition ease-in duration-200 text-center text-base font-semibold" 
          />
        </div>
        </div>
      </form>
    </div>
  )
}

export default OrderDetail