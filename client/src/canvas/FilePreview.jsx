import React, { Suspense, useEffect, useRef, useState } from 'react'
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary'
import { CanvasLoader } from '../components';
import { Image as  DreiImage, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { getDistance, reader } from '../config/helpers';
import { ObjectsProvider } from '../contexts/ObjectsContext';
import { AssembledProvider, useAssembled } from '../contexts/AssembledContext';
import { Canvas } from '@react-three/fiber';

function Fallback({ error, resetErrorBoundary }) {

  return <CanvasLoader error={error} resetErrorBoundary={resetErrorBoundary} />
}

const PreviewAssembled = ({ setDist }) => {
  console.log('RENDERED preview assembled')
  const previewAssembled = useRef()
  const detailsPreview = useRef([])

  const assembledObj = useAssembled()

  useEffect(() => {
    if (previewAssembled.current) {
      const dist = getDistance(previewAssembled.current)
      setDist(dist)
    }
  }, [detailsPreview.current.length])

  return (
    <group
        ref={previewAssembled}
        name={'previewAssembled'}
      >
        {assembledObj.assemblyMap.map((instruction, i) => {
          return(//получаем инструкции последовательно из карты сборки
            <group
              key={`${Math.abs(instruction.id)}/preview`} //уникальный ключ
              name={`${instruction.id}/${instruction.name}/${instruction.type}/details/preview` } //использовать для получения типа
              position={instruction.position}
              rotation={instruction.rotation}
            >
              {assembledObj.setObjectArray.objectGeometryArray[i].map((detailOfGroup, iOfDetail) => (
                <mesh
                  ref={(el) => (detailsPreview.current[Number(`${i}${iOfDetail}`)] = el)}  
                  key={`${Math.abs(instruction.id)}/${iOfDetail}/preview`}
                  name={`${i}/${iOfDetail}/${instruction.type}/preview`}
                  scale={instruction.scale || [1,1,1]}
                  castShadow 
                  receiveShadow 
                  geometry={detailOfGroup}
                  visible={true}
                >
                  <meshPhysicalMaterial {...assembledObj.setObjectArray.objectMaterialArray[i][iOfDetail]} />
                </mesh>
              ))}
            </group>
    )})}
    </group>
  )
}

const FilePreview = ({file, setFile}) => {

  const [ dist, setDist] = useState({dist: 1, height: 1})
  
  const [fileData, setFileData] = useState({
    image: null,
    imageScale: [0,0],
    map: null,
  })

  useEffect(() => {
    readFile(file)
  }, [file.name, fileData.image, fileData.map])
  
  console.log('FILE NAME - ', fileData)
  function readFile(file) {
    try {
      reader(file).then((result) => {
        if (file.type.includes('image')) {
          console.log('FILE READ AS IMAGE')
          const img = new Image()
          img.src = result
          console.log(img.width)
          setFileData({
            image: result,
            imageScale: [img.width/Math.min(img.width, img.height), img.height/Math.min(img.width, img.height)],
            map: null
          })
          setDist({dist: 1, height: img.height/2})
        } else {
          setFileData({
            image: null,
            imageScale: [0, 0],
            map: JSON.parse(result)
          })
        }
      }).catch((error) => {
        console.log(error.message)
        setFile(null)
      })
    } catch (error) {
      console.log(error.message)
      setFile(null)
    }
  }

  if (fileData.image || fileData.map) {
    return (
      <Canvas
        name={'previewCanvas'}
        frameloop='demand'
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: false }}
      >
          <ErrorBoundary FallbackComponent={Fallback} onReset={() => setFile(null)}>
            <ambientLight intensity={1.25} />
            <PerspectiveCamera 
              makeDefault 
              position = {[dist.dist, dist.height, dist.dist]} 
              fov={25}
            />
            <OrbitControls
              autoRotate={file.type.includes('image') ? false : true}
              enableZoom={true} 
              target={[0,dist.height,0]} 
            />
            <directionalLight position={[dist.dist, dist.height, dist.dist]} />
            <Suspense fallback={<CanvasLoader />}>
              {fileData.image &&
                <DreiImage url={fileData.image} position={[0,dist.height,0]} rotation={[0,Math.PI/4,0]} scale={fileData.imageScale}/>
              } 
              {fileData.map && 
                <ObjectsProvider>
                  <AssembledProvider snap = {{assemblyMap: fileData.map}}>
                    <PreviewAssembled setDist={setDist}/>
                  </AssembledProvider>
                </ObjectsProvider>
              }
            </Suspense>
          </ErrorBoundary>
      </Canvas>
    );
  } else {
    return (
    <Canvas
      name={'someThingWrong'}
    >
      <CanvasLoader />
    </Canvas>
    )
  }
}

export default FilePreview

