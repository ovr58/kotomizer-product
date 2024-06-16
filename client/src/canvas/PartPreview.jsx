import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { Float, Preload, useGLTF } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { CanvasLoader } from '../components';

import {
  Selection,
  Select,
  EffectComposer,
  Outline,
} from '@react-three/postprocessing'; // для выделения детали с которой хоти работать
import { getDistance } from '../config/helpers'; // дистанция до камеры чтобы вся деталь вмещалась в поле камеры предпросмотра
import Camerarig from './Camerarig';

const Model = ({ nodes, partModel, setClicked, clicked, setDist }) => {

  const { scene } = useThree()

  useEffect(() => {
    const countMeshes = () => {
      let parts = []
      scene.traverse((object) => {
        if (object.type == 'Mesh') {
          parts.push(object)
      }
      })
      return parts
    }
    setDist(getDistance(countMeshes(), 0, 25))
  }, [])

// определяем состояние наведения курсора на деталь 
  const [hovered, setHover] = useState('')
// выделение <Select> включено если одно из условий выполнено 
  return (
    <Select
        key={partModel.name}
        enabled={
          hovered === partModel.name && partModel.available ||
          clicked === partModel.name && partModel.available
        }
      >
      <Float speed={1.75} rotationIntensity={1} floatIntensity={2}>
        <ambientLight intensity={1.25} />
        <directionalLight position={[0, 0, 0.05]} />
        <mesh 
          castShadow 
          receiveShadow 
          position={[0, 0, 0]}
          geometry={nodes.Detail1.geometry}
          material={nodes.Detail1.material}
          onPointerOver={() => setHover(partModel.available ? partModel.name : '')}
          onPointerOut={() => setHover('')}
          onPointerDown={() => setClicked(partModel.available ? partModel.name : '')}
        >
        </mesh>
      </Float>
    </Select>
  );
};


const PartPreview = ({ partModel, setClicked, clicked }) => {

  const [ dist, setDist ] = useState({})

  const object = useMemo(() => useGLTF(`/${partModel.name}.glb`))

  return (
    <Canvas
      key = {dist.toString()}
      frameloop='demand'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: false }}
    >
      <Camerarig dist={dist} />
      <Suspense fallback={<CanvasLoader />}>
        <Selection>
          <EffectComposer multisampling={3} autoClear={false}>
            <Outline
              blur
              visibleEdgeColor="indianred"
              edgeStrength={50}
              width={30}
            />
          </EffectComposer>
          <Model 
                nodes = {object.nodes}
                partModel={partModel}
                setClicked={setClicked}
                clicked = {clicked}
                setDist = {setDist} />
        </Selection>
      </Suspense>
      <Preload all />
    </Canvas>
    );
}

export default PartPreview