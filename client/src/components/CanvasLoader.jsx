import { Html, useProgress } from "@react-three/drei";
import CustomButton from "./CustomButton";


const CanvasLoader = ({ error, resetErrorBoundary }) => {
  console.log('CanvasLoader - ', error)
  const { progress } = useProgress();
  return (
    <Html
      as='div'
      center
    >
      {!error ? 
        <>
        <div className="flex justify-center items-center w-[400px] h-auto">
          <div className='waviy'>
            <span className='text-[60px]' style={{'--i':1}}>
              L
            </span><span className='text-[60px]' style={{'--i':2}}>
              o
            </span><span className='text-[60px]' style={{'--i':3}}>
              a
            </span><span className='text-[60px]' style={{'--i':4}}>
              d
            </span><span className='text-[60px]' style={{'--i':5}}>
              i
            </span><span className='text-[60px]' style={{'--i':6}}>
              g
            </span>
          </div>
        </div>
        <p
          className="flex justify-center items-center text-center text-black"
        >
          {progress.toFixed(2)}%
        </p> 
        </>
        : 
        <div className='group block top-1/3 p-5 w-[400px] place-items-center text-center align-center rounded-xl bg-slate-600'>
          <div className='waviy group-hover:animate-custom-falling origin-bottom '>
            {'Что-то пошло не так...'.split('').map((letter, i) => (
              <span className='text-[30px]' style={{'--i':`${i+1}`}}>{letter}</span>
            ))}
          </div>
          <CustomButton 
            type='filled'
            title='Сбросить'
            customStyles='text-red'
            handleClick={() => resetErrorBoundary()}
          />
        </div>
      }
    </Html>
  );
};

export default CanvasLoader;