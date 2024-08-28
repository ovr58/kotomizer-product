import React, { useEffect, useState } from 'react'
import { downloadFile, getPriceAndSpecs } from '../config/helpers'
import CustomButton from './CustomButton'
import { useSnapshot } from 'valtio'
import appState from '../store'
import emailjs from '@emailjs/browser'

function OrderDetail() {

  const [ img, setImg ] = useState(null)
  const [ price, setPrice ] = useState(0)
  const [ tableContent, setTableContent ] = useState({})
  const [loading, setLoading] = useState(false)

  const formVerification = () => {
    let verificationResult = true
    if (Object.values(form).includes('')) {
      alert('Все поля должны быть заполнены!')
      verificationResult = false
    }
    if (/^\d+$/.test(form.INN)) {
      alert('Поле ИНН должно содеражать только цифры!')
      verificationResult = false
    }
    return verificationResult
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formVerification()) {
      return
    }

    setLoading(true)

    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: `${form.firstName} ${form.lastName}`,
          to_name: 'Nataly',
          from_email: form.email,
          to_email: 'nm2413027@gmail.com',
          message: `ИНН: ${form.INN}, город: ${form.city}, ${form.message}`,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false)

          alert('Ваша форма отправлена. Наш менеджер свяжется с Вами в ближайшее время!')
          setForm({
            firstName: '',
            lastName: '',
            email: '',
            INN: '',
            city: '',
            message: ''
          })
        },
        (error) => {
          setLoading(false)

          console.error(error)

          alert(contact_text.alert_message_sent)
        }
      )
  }

  const snap = useSnapshot(appState)

  useEffect(() => {
    const priceAndSpecs = getPriceAndSpecs(snap.assemblyMap)
    setPrice(priceAndSpecs.totalPrice)
    setTableContent(priceAndSpecs.tableObj)
  }, [snap.assemblyMap])
  console.log('RENDERED - ORDER CARD')
  useEffect(() => {

    (document.querySelector('.mainCanvas canvas') && img === null) && setImg(downloadFile('mainCanvas', 'getImg'))
          
  }, [])

  const handleMakeAnOrder = () => {
    return
  }

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
            handleClick={handleMakeAnOrder}
          />
        </div>
        </div>
      </form>
    </div>
  )
}

export default OrderDetail