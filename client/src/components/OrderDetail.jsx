import React, { useEffect, useState } from 'react'
import { downloadFile, getPriceAndSpecs } from '../config/helpers'
import CustomButton from './CustomButton'
import { useSnapshot } from 'valtio'
import appState from '../store'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import emailjs from '@emailjs/browser'
import { whatsup, telegram } from '../assets'

const telNumber = import.meta.env.VITE_TELNUMBER

function OrderDetail() {

  const snap = useSnapshot(appState)

  const token = snap.userToken
  const data = snap.shopModelData
  const assemblyMap = snap.assemblyMap

  const [ img, setImg ] = useState(null)
  const [ price, setPrice ] = useState(0)
  const [ tableContent, setTableContent ] = useState({})
  const [ formName, setFormName ] = useState('')
  const [ formPhone, setFormPhone ] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!data && !token) {
      alert('Выберете подходящую по когтеточку в магазине и повторите попытку...')
      return
    }

    let orderDetails = null

    if (token) {
      orderDetails = {
        from_name: JSON.parse(token).user.user_metadata.full_name,
        to_name: 'Nataly',
        from_email: JSON.parse(token).user.email,
        to_email: 'nm2413027@gmail.com',
        message: `USER_ID: ${JSON.parse(token).user.id}, СПЕЦИФИКАЦИЯ ${JSON.stringify(assemblyMap)} ЦЕНА ${price} руб.` ,
      }
    } else {
      if (!formName) {
        alert ('Нужно заполнить строку Имя.')
        return
      }
      if (!formPhone) {
        alert ('Нужно заполнить строку Номер телефона.')
        return
      }
      orderDetails = {
        from_name: formName,
        to_name: data.seller_id,
        from_email: 'physical entity',
        to_email: 'nm2413027@gmail.com',
        message: `USER_PHONE: ${formPhone}, СПЕЦИФИКАЦИЯ ${JSON.stringify(assemblyMap)} ЦЕНА ${price} руб.` ,
      }
    }

    setLoading(true)

    orderDetails && emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        orderDetails,
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false)

          alert('Ваша заказ отправлен. Наш менеджер свяжется с Вами в ближайшее время!')
          setFormName('')
          setFormPhone('')
        },
        (error) => {
          setLoading(false)

          console.error(error)

          alert(contact_text.alert_message_sent)
        }
      )
  }

  useEffect(() => {
    const priceAndSpecs = getPriceAndSpecs(assemblyMap)
    setPrice(priceAndSpecs.totalPrice)
    setTableContent(priceAndSpecs.tableObj)
    document.querySelector('.mainCanvas canvas') && 
      setImg(downloadFile('mainCanvas', 'getImg'))
  }, [JSON.stringify(assemblyMap)])

  return (
    <div className="right-container">
      <div className="flex flex-col sm:h-auto h-[200px] w-full justify-between items-center">
        {
          img && <img src={img} alt="shopping image"
            className="block sm:h-auto h-[200px] rounded-t-lg" />
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
        {
          !token ? 
          <div className="w-full p-2 mt-6">
            <div key='phoneNumber' className='relative bg-white w-full'>
              <PhoneInput
                id="phoneNumber" 
                name="phoneNumber"
                value={formPhone}
                onChange={setFormPhone} 
                className="
                  peer 
                  bg-transparent 
                  h-10 
                  w-full 
                  rounded-lg
                  text-black 
                  placeholder-transparent 
                  ring-2 
                  px-2 
                  ring-gray-500 
                  focus:ring-yellow-600 
                  focus:outline-none 
                  focus:border-rose-600" 
                  placeholder="Ваш телефон.."
              />
              <label 
                htmlFor="phoneNumber" 
                className="
                  absolute 
                  cursor-text 
                  left-0 
                  -top-3 
                  text-sm 
                  text-black 
                  bg-white   
                  mx-1 
                  px-1 
                  peer-placeholder-shown:text-base 
                  peer-placeholder-shown:text-gray-500 
                  peer-placeholder-shown:top-2 
                  peer-focus:-top-3 
                  peer-focus:text-yellow-600 
                  peer-focus:text-sm 
                  transition-all"
              >
                Ваш сотовый телефон...
              </label>
            </div>
            <div key='name' className='relative bg-white my-4 w-full'>
              <input 
                type="text" 
                id="name" 
                name="name" 
                onChange={(e) => setFormName(e.target.value)}
                className="
                  peer 
                  bg-transparent 
                  h-10 
                  w-full 
                  rounded-lg
                  text-black 
                  placeholder-transparent 
                  ring-2 
                  px-2 
                  ring-gray-500 
                  focus:ring-yellow-600 
                  focus:outline-none 
                  focus:border-rose-600" 
                  placeholder="Вашe имя..."
              />
              <label 
                htmlFor="name" 
                className="
                  absolute 
                  cursor-text 
                  left-0 
                  -top-3 
                  text-sm 
                  text-gray-500 
                  bg-white
                  mx-1 
                  px-1 
                  peer-placeholder-shown:text-base 
                  peer-placeholder-shown:text-gray-500 
                  peer-placeholder-shown:top-2 
                  peer-focus:-top-3 
                  peer-focus:text-yellow-600 
                  peer-focus:text-sm 
                  transition-all"
              >
                Ваше имя...
              </label>
            </div>
          </div> :
          <div className='mt-3'>
          <div>Заказ будет отправлен от Вас, </div>
            <div>{JSON.parse(token).user.user_metadata.full_name}</div>
          </div>
        }                 
        <div className="flex w-full justify-center aign-center m-4 text-sm font-medium">
          <CustomButton 
            type="filled"
            title={loading
              ? 'Отправляем заказ...'
              : 'Отправить заказ'}
            customStyles="py-2 px-4 w-full transition ease-in duration-200 text-center text-base font-semibold" 
            handleClick={handleSubmit}
          />
        </div>
        <div className="flex justify-start ">
          <a
            href={`https://wa.me/${telNumber}`}
            target="_blank"
            className="px-2 py-2 shadow-primary hover:animate-ping"
            rel="noreferrer"
            aria-label="message via whatsapp"
          >
            <img
              src={whatsup}
              alt="whatsup"
              className=" h-[30px] w-[30px]"
              title='Связаться с менеджером по Ватсап...'
            />
          </a>
          <a
            href={`https://t.me/natatulia84`}
            target="_blank"
            className="px-2 py-2 shadow-primary hover:animate-ping"
            rel="noreferrer"
            aria-label="message via telegram"
          >
            <img
              src={telegram}
              alt="telegram"
              className=" h-[30px] w-[30px]"
              title='Связаться с менеджером по Телеграм...'
            />
          </a>
        </div>
        </div>
      </form>
    </div>
  )
}

export default OrderDetail