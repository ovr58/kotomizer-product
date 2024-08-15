import React, { useEffect, useState } from 'react'
import { downloadFile } from '../config/helpers';
import CustomButton from './CustomButton';
import { useSnapshot } from 'valtio';
import appState from '../store';

function OrderDetail() {

  const [ img, setImg ] = useState(null)
  const [ price, setPrice ] = useState(0)
  const [ tableContent, setTableContent ] = useState('')

  const snap = useSnapshot(appState)
  useEffect(() => {
    snap.assemblyMap.forEach((instruction) => {

    })
  }, [])
  console.log('RENDERED - ORDER CARD')
  useEffect(() => {

    (document.querySelector('.mainCanvas canvas') && img === null) && setImg(downloadFile('mainCanvas', 'getImg'))
          
  }, [])

  return (
    <div className="orderdetail-container scroll-auto">
      <div className="relative w-full md:w-48 flex justify-between items-center">
        {
          img && <img src={img} alt="shopping image"
            className="object-cover w-full h-48 md:h-full rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
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
                <tr className="bg-white border-b">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        Apple MacBook Pro 17"
                    </th>
                    <td className="px-6 py-4">
                        Silver
                    </td>
                    
                </tr>
                <tr className="bg-white border-b">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        Microsoft Surface Pro
                    </th>
                    <td className="px-6 py-4">
                        $1999
                    </td>
                </tr>
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