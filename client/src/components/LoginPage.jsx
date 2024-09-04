import React, { useEffect, useState } from 'react'
import { CustomButton } from '../components'
import { supabase } from '../client'

import Cookies from 'js-cookie'
import appState from '../store'


function LoginPage({token, setRegisterForm, setRightPanelStatus}) {

  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: ''
  })
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    console.log(rememberMe)
  }, [rememberMe])

  const handleChange = (e) => {
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [e.target.name]: e.target.value
      }
    })
  }

  async function handleResetPassword (event) {

    event.preventDefault()

    const { error } = await supabase.auth.resetPasswordForEmail(formData.userEmail)

    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Password reset email sent!')
    }
  }

  const logOut = () => {
    supabase.auth.signOut()
    Cookies.remove('kotomizerUserToken')
    appState.userToken = null
  }

  async function handleSubmit (e) {
    e.preventDefault()
    try {
      console.log(formData)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.userEmail,
        password: formData.userPassword,
      })
      if (error) {
        alert(error)
        return
      } else if (data.user) {
        appState.userToken = JSON.stringify(data)
        if (rememberMe) {
          Cookies.set('kotomizerUserToken', JSON.stringify(data), { expires: 7 })
        }
      }
    } catch (error) {
      alert(error)
    }
    
  }
 
  return (
    <div className="right-container">
      <div className='w-[20px] h-full cursor-pointer'>
        <CustomButton 
          type={"filled"}
          title=""
          handleClick={() => setRightPanelStatus('close')}
          customStyles='
            absolute 
            top-0 
            -left-7
            h-full 
            hover:left-0
            hover:outline-none 
            font-medium 
            rounded-lg 
            text-sm 
            text-center 
            inline-flex 
            items-center
            animate-pulse
          '
        >
          <svg className="w-5 h-5" 
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 14 10"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M1 5H13M13 5L9 1M13 5L9 9"
            />
          </svg>
        </CustomButton>
      </div>
      <div className="flex-none w-full mt-2 text-sm font-medium text-black">
        {!token ? 'Войдите в Ваш аккаунт': 'Рады видеть Вас снова!'}
      </div>
      {!token ? <form onSubmit={handleSubmit}>
      <div className="w-full p-2">
        <div key='email' className='relative bg-white w-full'>
          <input 
            type="email" 
            id="email" 
            name="userEmail"
            onChange={handleChange} 
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
              placeholder="Ваш e-mail..."
          />
          <label 
            htmlFor="email" 
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
            Ваш email...
          </label>
        </div>
        <div key='password' className='relative bg-white my-4 w-full'>
          <input 
            type="password" 
            id="password" 
            name="userPassword" 
            onChange={handleChange}
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
              placeholder="Ваш пароль..."
          />
          <label 
            htmlFor="password" 
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
            Ваш пароль...
          </label>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center hover:cursor-pointer">
          <input type="checkbox" value={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="sr-only peer" id="exampleCheck3" />
          <label
            className='
              relative
              mr-2
              ml-2
              sm:w-6
              sm:h-11
              w-6
              h-7
              bg-gray-200
              peer-focus:outline-none 
              peer-focus:ring-4 
              peer-focus:ring-yellow-300 
              rounded-full peer 
              peer-checked:after:translate-y-full 
              peer-checked:after:border-white 
              peer-checked:after:bg-white 
              after:content-[""] 
              after:absolute 
              after:top-[2px] 
              after:start-[2px]
              after:bg-yellow-600
              after:border-gray-300
              after:border 
              after:rounded-full
              sm:after:h-5
              sm:after:w-5 
              after:h-3
              after:w-3 
              after:transition-all 
              peer-checked:bg-yellow-600
              hover:cursor-pointer'
              htmlFor='exampleCheck3'
          ></label>
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer mr-3"
            htmlFor='exampleCheck3'
          >
            Запомнить меня...
          </label>
        </div>

        {/* <!-- Forgot password link --> */}
        <a
          href="#!"
          onClick={(e) => handleResetPassword(e)}
          className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700"
        >
          Забыли пароль?
        </a>
      </div>

      <div className="p-2">
        <CustomButton  
          type="filled"
          title='Войти'
          customStyles="py-2 px-4 w-full transition ease-in duration-200 text-center text-base font-semibold" 
        />
      </div>
      <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
        <p className="mx-4 mb-0 text-center font-semibold">
          ИЛИ
        </p>
      </div>
      <div className="p-2">
        <CustomButton  
          type="filled"
          title='Регистрация'
          customStyles="py-2 px-4 w-full transition ease-in duration-200 text-center text-base font-semibold" 
          handleClick={() => setRegisterForm(true)}
        />
      </div>         
    </form> : 
    <div>
      <div>Добро пожаловать, </div>
      <div>{JSON.parse(token).user.user_metadata.full_name}</div>
      <div className="p-2">
        <CustomButton  
          type="filled"
          title='Выйти из аккаунта'
          customStyles="py-2 px-4 w-full transition ease-in duration-200 text-center text-base font-semibold" 
          handleClick={logOut}
        />
      </div>       
    </div>
  }
  </div>
  )
}

export default LoginPage