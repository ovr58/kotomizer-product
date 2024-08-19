import { motion, AnimatePresence } from 'framer-motion'

import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion'

import appState from '../store'
import { CustomButton, LoginPage } from '../components'

import Cookies from 'js-cookie'
import { useSnapshot } from 'valtio'
import { useEffect, useMemo } from 'react'

const Home = () => {

    const snap = useSnapshot(appState)

    const userSessionToken = useMemo(() => {return Cookies.get('kotomizerUserToken') || snap.userToken}, [snap.userToken])

    useEffect(() => {
        appState.userToken = userSessionToken
    }, [userSessionToken])
  return (
    <AnimatePresence key = {'HomePage'}>
        <motion.section className='home' {...slideAnimation('left')}>
            <motion.header {...slideAnimation('down')}>
                <img 
                    src='./Logomiddle.svg'
                    alt='logo'
                    className='w-24 h-auto object-contain'
                />
            </motion.header>
            <motion.div className='home-content' {...headContainerAnimation}>
                <motion.div {...headTextAnimation}>
                    <h1 className='head-text'>
                        КОТО <br className='xl:block hidden' /> <span className='text-xl'>МАЙЗЕР</span>!
                    </h1>
                </motion.div>
                <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
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
        <motion.div
            key='orderDetailTab'
            className='absolute top-[60px] right-0 z-10'
            {...slideAnimation('right')}
        >
            <LoginPage token={userSessionToken}/>
      </motion.div>
    </AnimatePresence>
  )
}

export default Home