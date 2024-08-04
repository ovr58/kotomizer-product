import { Html, useProgress } from "@react-three/drei";
import CustomButton from "./CustomButton";


const CanvasLoader = ({ error, resetErrorBoundary }) => {
  console.log('CanvasLoader - ', error)
  const { progress } = useProgress();
  return (
    <Html
      as='div'
      center
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {!error ? 
        <div>
          <span className='canvas-loader'>Loading...</span>
          <p
            style={{
              fontSize: 14,
              color: "#F1F1F1",
              fontWeight: 800,
              marginTop: 40,
            }}
          >
            {progress.toFixed(2)}%
          </p> 
        </div>
        : 
        <div className='annotation'>
          Что-то пошло не так...
          <CustomButton 
            type='filled'
            title='Сбросить'
            customStyles='text-red'
            handleClick={resetErrorBoundary}
          />
        </div>
      }
    </Html>
  );
};

export default CanvasLoader;