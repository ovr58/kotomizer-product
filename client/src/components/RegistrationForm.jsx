import React, { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { whatsup, telegram } from '../assets'

const telNumber = import.meta.env.VITE_TELNUMBER

function RegistrationForm({setRegisterForm}) {

  const formRef = useRef()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    INN: '',
    city: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm({ ...form, [name]: value })
  }

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

  return (
    <div className="right-container">
      <p className='text-[14px] tracking-wider'>
        Есть магазин, ты самозанятый? Заполни форму ниже и стань нашим официальным партнером и предлагай своим клиентам самые разнообразные когтеточки, собирая их в конструкторе, либо выбирая готовые варианты из каталога.
        <br />После отправки формы наш менеджер свяжется с Вами для дальнейших консультаций...
        <br />Данная регистрация только для потенциальных партнеров, если Вы хотите приобрести когтеточку, Вы можете воспользоваться доступным магазином выбрав ближайший город и оформив заказ.
      </p>
      <button
        key='goBackButton2'
        type="button"
        className="bg-yellow-400 py-2 px-4 m-3 outline-none w-auto text-black font-bold shadow-md shadow-primary rounded-xl"
        title="Вернуться назад..."
        onClick={() => setRegisterForm(false)}
      >
        Назад
      </button>
      <h3 className="text-black font-black xs:text-[40px] text-[30px]">
        Форма для партнера:
      </h3>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-8"
      >
        <label className="flex flex-col">
          <span className="text-black font-medium mb-4">
            Фамилия:
          </span>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder='Фамилия контактного лица...'
            autoComplete="on"
            className="bg-tertiary py-4 px-6  text-black rounded-lg outline-none border-none font-medium placeholder:text-red-800"
            required
          />
        </label>
        <label className="flex flex-col">
          <span className="text-black font-medium mb-4">
            Имя:
          </span>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder='Имя контактного лица...'
            autoComplete="on"
            className="bg-tertiary py-4 px-6  text-black rounded-lg outline-none border-none font-medium placeholder:text-red-800"
            required
          />
        </label>
        <label className="flex flex-col">
          <span className="text-black font-medium mb-4">
            ИНН:
          </span>
          <input
            type="text"
            name="INN"
            value={form.INN}
            onChange={handleChange}
            placeholder='ИНН организации или самозанятого...'
            autoComplete="on"
            className="bg-tertiary py-4 px-6  text-black rounded-lg outline-none border-none font-medium placeholder:text-red-800"
            required
          />
        </label>
        <label className="flex flex-col">
          <span className="text-black font-medium mb-4">
            Город (основной):
          </span>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder='основной город ведения деятельности...'
            autoComplete="on"
            className="bg-tertiary py-4 px-6  text-black rounded-lg outline-none border-none font-medium placeholder:text-red-800"
            required
          />
        </label>
        <label className="flex flex-col">
          <span className="text-black font-medium mb-4">
            Дополнительная информация
          </span>
          <textarea
            rows={4}
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder='кратко о Вашем предприятии...'
            className="bg-tertiary py-4 px-6 placeholder:text-red-800 text-black rounded-lg outline-none border-none font-medium resize-none"
            required
          />
        </label>
        <div className="flex flex-wrap w-full justify-around">
          <button
            key='submitButton'
            type="submit"
            className="bg-yellow-400 py-2 px-4 m-3 outline-none w-auto text-black font-bold shadow-md shadow-primary rounded-xl"
            title="Отправить форму..."
          >
            {loading
              ? 'Отправляем форму...'
              : 'Отправить запрос'}
          </button>
          <button
            key='goBackButton1'
            type="button"
            className="bg-yellow-400 py-2 px-4 m-3 outline-none w-auto text-black font-bold shadow-md shadow-primary rounded-xl"
            title="Вернуться назад..."
            onClick={() => setRegisterForm(false)}
          >
            Назад
          </button>
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

export default RegistrationForm