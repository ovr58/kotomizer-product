import React, { Suspense, useMemo, useRef, useState } from 'react'
import { Float, OrbitControls, Preload, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CanvasLoader } from '../components';

import {
  Selection,
  Select,
  EffectComposer,
  Outline,
} from '@react-three/postprocessing';
import { getDistance } from '../config/helpers';

const CameraController = () => {

  const {camera, gl: {domElement}} = useThree();

  const controls = useRef()
  
  useFrame((_state) => {
    controls.current.update()
    })

  return <OrbitControls 
            ref={controls} 
            args={[camera, domElement]}
            enableDamping 
            dampingFactor={0.05} 
            rotateSpeed={1.5} 
            autoRotate={true}
            autoRotateSpeed={10.5} 
            enableZoom={true} 
          />
}

const Model = ({ nodes, partModel, setClicked, clicked }) => {

  const [hovered, setHover] = useState('')

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
          scale={nodes.Detail1.scale}
          position={[0, -nodes.Detail1.scale.y/2, 0]}
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

  const objects = useMemo(() => useGLTF(`/${partModel.name}.glb`))
  
  const dist = useMemo(() => getDistance([objects], [], 0.2, 45), [partModel])

  return (
    <Canvas
        frameloop='demand'
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: false }}
        camera={{
          position: [-dist, -dist, -dist],
          fov: 45,
          near: 0.1,
        }}
        
    >
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
                  nodes = {objects.nodes}
                  partModel={partModel}
                  setClicked={setClicked}
                  clicked = {clicked} />
          </Selection>
        </Suspense>
        <CameraController />

        <Preload all />
    </Canvas>
    );
}

export default PartPreview