import React, { useEffect, useRef, useState } from 'react'
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary'
import { CanvasLoader } from '../components';
import { Image as  DreiImage, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { getDistance, reader } from '../config/helpers';
import { TextureProvider, useTextures } from '../contexts/TextureContext';
import { AssembledProvider, useAssembled } from '../contexts/AssembledContext';
import { Canvas } from '@react-three/fiber';

function Fallback({ error }) {

  const resetBoundary = useErrorBoundary()

  return <CanvasLoader error={error} resetErrorBoundary={resetBoundary} />
}

const PreviewAssembled = ({ setDist }) => {
  console.log('RENDERED preview assembled')
  const previewAssembled = useRef()
  const detailsPreview = useRef([])

  const assembledObj = useAssembled()
  const textures = useTextures()

  useEffect(() => {
    if (previewAssembled.current) {
      setDist(getDistance(previewAssembled.current))
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
              scale={instruction.scale || [1,1,1]}
            >
              {assembledObj.setObjectArray.objectGeometryArray[i].map((detailOfGroup, iOfDetail) => (
                <mesh
                  ref={(el) => (detailsPreview.current[Number(`${i}${iOfDetail}`)] = el)}  
                  key={`${Math.abs(instruction.id)}/${iOfDetail}/preview`}
                  name={`${i}/${iOfDetail}/${instruction.type}/preview`}
                  castShadow 
                  receiveShadow 
                  geometry={detailOfGroup}
                  visible={true}
                >
                  <meshStandardMaterial {
                    ...(instruction.material[iOfDetail] ? 
                    [...textures, assembledObj.setObjectArray.objectMaterialArray[i][iOfDetail]].filter(
                      material => material.name == instruction.material[iOfDetail]
                    )[0] :
                    assembledObj.setObjectArray.objectMaterialArray[i][iOfDetail])} 
                  /> 
                </mesh>
              ))}
            </group>
    )})}
    </group>
  )
}

const FilePreview = ({file, setFile}) => {

  const [fileData, setFileData] = useState(null)
  const [renderWhat, setRenderWhat] = useState(null)
  const [imgScale, setImgScale] = useState([1,1])
  const [dist, setDist] = useState({dist: 1, height: 1})

  console.log('FILE PREVIEW RENDERED - ', fileData)
  useEffect(() => {
    try {
      reader(file).then((result) => {
        if (file.type == 'image/jpeg') {
          const img = new Image()
          img.src = result
          setImgScale([img.width/Math.min(img.width, img.height), img.height/Math.min(img.width, img.height)])
          setFileData(result)
          setDist({dist: 1, height: 1})
          setRenderWhat('image')
        } else {
          console.log(file.type)
          setFileData(JSON.parse(result))
          setRenderWhat('map')
        }
      }).catch((error) => {
        console.log(error.message)
        setFile(null)
        setRenderWhat(null)
      })
    } catch (error) {
      console.log(error.message)
      setFile(null)
      setRenderWhat(null)
    }
    }, [file.name])

  console.log('FilePreview - ', file)

  if (renderWhat) {
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
              autoRotate={file.type == 'image/jpeg' ? false : true}
              enableZoom={true} 
              target={[0,dist.height,0]} 
            />
            <directionalLight position={[dist.dist, dist.height, dist.dist]} />
            {renderWhat == 'image' ? 
              <DreiImage url={fileData} position={[0,dist.height,0]} rotation={[0,Math.PI/4,0]} scale={imgScale}/>
            : 
              renderWhat == 'map' ? 
              <TextureProvider>
                <AssembledProvider snap = {{assemblyMap: fileData}}>
                  <PreviewAssembled setDist={setDist} />
                </AssembledProvider>
              </TextureProvider> : null
            }
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

