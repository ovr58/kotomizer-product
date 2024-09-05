import { motion, AnimatePresence } from 'framer-motion'

import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion'

import appState from '../store'
import { CustomButton, LoginPage, RegistrationForm } from '../components'

import Cookies from 'js-cookie'
import { useSnapshot } from 'valtio'
import { useEffect, useMemo, useState } from 'react'

const Home = () => {

    const snap = useSnapshot(appState)

    const userSessionToken = useMemo(() => {return Cookies.get('kotomizerUserToken') || snap.userToken}, [snap.userToken])

    const [registerForm, setRegisterForm] = useState(false)

    const [rightPanelStatus, setRightPanelStatus] = useState(null)

    useEffect(() => {
        appState.userToken = userSessionToken
    }, [userSessionToken])
  return (
    <AnimatePresence key = {'HomePage'}>
        <motion.section className='home group' {...slideAnimation('left')}>
            <motion.header {...slideAnimation('down')}>
                <img 
                    src='./Logomiddle.svg'
                    alt='logo'
                    className='w-24 h-auto object-contain'
                />
            </motion.header>
            <motion.div key='home-content' className='home-content' {...headContainerAnimation}>
                <motion.div key='headText1' {...headTextAnimation}>
                    <div className="word">
                        <span className='group-hover:animate-custom-toplong'>K</span>
                        <span className='group-hover:animate-custom-shrinkjump origin-bottom'>O</span>
                        <span className='group-hover:animate-custom-falling origin-bottom'>T</span>
                        <span className='group-hover:animate-custom-balance origin-bottom-left'>O</span>
                        <span className='group-hover:animate-custom-rotate'> mizer!</span>
                    </div>
                </motion.div>
                <motion.div key='headText2' {...headContentAnimation} className='flex flex-col gap-5'>
                    <p className='max-w-md font-normal text-gray-600 text-base'>
                    Индивидуальный подход к каждому коту! Создайте идеальный домик или когтеточку с нашим конструктором и узнайте стоимость мгновенно.. <strong>Оформите заказ в Telegram!</strong>{" "}Получите Вашу скидку и консультацию.
                    </p>
                    <CustomButton 
                        type='filled'
                        title='Начать...'
                        handleClick={() => appState.intro = false}
                        customStyles='w-fit px-4 py-2.5 font-bold text-sm'
                    />
                </motion.div>
            </motion.div>
        </motion.section>
        {
            rightPanelStatus === 'close' && 
            <CustomButton 
                type={"filled"}
                title=""
                handleClick={() => setRightPanelStatus(null)}
                customStyles='
                    absolute 
                    top-0 
                    sm:-right-7
                    right-0
                    h-full 
                    z-50
                    sm:hover:-translate-x-7
                    sm:transition-all
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
                    d="M13 5H1M1 5L5 1M1 5L5 9"
                />
                </svg>
            </CustomButton>
        }
        <motion.div
            key='orderDetailTab'
            className='absolute top-[60px] right-0 z-10 group'
            {...slideAnimation('right', rightPanelStatus)}
        >
                
            {
                registerForm ? 
                    <RegistrationForm setRegisterForm={setRegisterForm} /> 
                : 
                    <LoginPage 
                        token={userSessionToken} 
                        setRegisterForm={setRegisterForm}
                        setRightPanelStatus={setRightPanelStatus}
                    />
            }
      </motion.div>
    </AnimatePresence>
  )
}

export default Home