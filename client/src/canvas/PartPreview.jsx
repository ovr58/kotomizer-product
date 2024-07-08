import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Float, Preload, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { CanvasLoader } from '../components'
import { Parts } from '../config/constants'

import {
  Selection,
  Select,
  EffectComposer,
  Outline,
} from '@react-three/postprocessing' // для выделения детали с которой хоти работать
import { getPartSize } from '../config/helpers' // дистанция до камеры чтобы вся деталь вмещалась в поле камеры предпросмотра
import Camerarig from './Camerarig'
import { Vector3 } from 'three'
import * as TWEEN from '@tweenjs/tween.js'


const Model = ({ nodes, setClicked, clicked, setDist, setTargetObj }) => {

  const menuParts = useRef([])

  const setClickedPart = () => {
    let clickedPart = {}
    if (menuParts.current && menuParts.current.length > 0 && clicked !='') {
      clickedPart = menuParts.current.filter((part) => part.name == clicked)[0]
      const partSize = getPartSize(clickedPart)
      setTargetObj([clickedPart.position.x, clickedPart.position.y + partSize.y/2, clickedPart.position.z])
    } else if (menuParts.current && menuParts.current.length > 0) {
      clickedPart = menuParts.current.filter((part) => part.userData.available)[0]
      if (!clickedPart) {
        clickedPart = menuParts.current[0]
      }
      const partSize = getPartSize(clickedPart)
      setTargetObj([clickedPart.position.x, clickedPart.position.y + partSize.y/2, clickedPart.position.z])
      setClicked(clickedPart.name)
    }
    if (Object.keys(clickedPart)) {
      console.log('dist')
      const maxSizeByZXofAll = Math.max(...getPartSize(clickedPart).toArray())
      const fovToRads = 25 * ( Math.PI / 180 )
      const dist = Math.abs( (maxSizeByZXofAll/2 ) / Math.tan( fovToRads / 2 ))
      setDist({dist: dist, height: 0})
    }
  }

  useFrame(() => {
    TWEEN.update()
  })

  useEffect (() => {
    if (menuParts.current && menuParts.current.length > 0) {
      const padding = 0
      const count = menuParts.current.length
      let maxSizeByZXofAll = Math.max(...menuParts.current.map((part) => Math.max(getPartSize(part).x, getPartSize(part).z)))
      const radius = ((maxSizeByZXofAll+padding)*count)/(2*Math.PI)
      for (let i = 0; i < count; i++) {
        const partSizeY = getPartSize(menuParts.current[i]).y
        const t = i / count * 2 * Math.PI
        let posX = Math.cos( t ) * radius
        let posZ = Math.sin( t ) * radius
        new TWEEN.Tween(menuParts.current[i].position).to(
          {
            x: posX,
            y:-partSizeY/2,
            z: posZ
          }, 1500
        ).easing(TWEEN.Easing.Cubic.Out).start().onComplete(() => {
          if (i == (count - 1)) {
            setClickedPart()
          }
        })
      }
    }
  }, [])

  useEffect(() => {
    setClickedPart()
  }, [clicked])

// определяем состояние наведения курсора на деталь 
  const [hovered, setHover] = useState('')
// выделение <Select> включено если одно из условий выполнено 
  return (
    <group
      name={'catalogue'}
      key={'catalogue'}
      >
      {Parts.map((part, i) => (
        <Select
          key={`${part.name}/${i}`}
          enabled={
            hovered === part.name && part.available ||
            clicked === part.name && part.available
          }
        >
        <Float speed={0.35} rotationIntensity={0.5} floatIntensity={0.1}>
          <group 
            ref = {(el) => (menuParts.current[i] = el)}
            key={`${part.name}/${i}`}
            name={part.name}
            userData={{available: part.available}}
            castShadow 
            receiveShadow 
            onPointerOver={() => setHover(part.available ? part.name : '')}
            onPointerOut={() => setHover('')}
            onPointerDown={() => setClicked(part.available ? part.name : '')}
            >
              {Object.entries(nodes[i].nodes).filter((arr) => arr[0].includes('Detail')).map((subMesh) => (
                <mesh 
                  key={`${subMesh[0]}/${i}`}
                  geometry={subMesh[1].geometry}
                >
                  <meshStandardMaterial 
                    {...subMesh[1].material} 
                    transparent={clicked != '' && !(part.name == clicked)} 
                    opacity={0.2} />
                </mesh>
              ))}
          </group>
        </Float>
        </Select>
      ))}
   </group>
  );
};

const PartPreview = ({ setClicked, clicked }) => {

  const [ dist, setDist ] = useState({})

  const objects = useMemo(() => Parts.map((part) => useGLTF(`/${part.name}.glb`)))

  const [ targetObj, setTargetObj ] = useState([0, 0, 0])

  return (
    <Canvas
      key = {dist.toString()}
      frameloop='demand'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: false }}
    >
      <Suspense fallback={<CanvasLoader />}>
      <Camerarig dist={dist} type={'menu'} targetObj={targetObj}/>
      <ambientLight intensity={1.25} />
      <directionalLight position={new Vector3(dist.dist, dist.height, dist.dist)} />
        <Selection>
          <EffectComposer multisampling={10} autoClear={false}>
            <Outline
              blur = {true}
              visibleEdgeColor="indianred"
              edgeStrength={100.5}
            />
          </EffectComposer>
          <Model 
                nodes = {objects}
                setClicked={setClicked}
                clicked = {clicked}
                setDist = {setDist}
                setTargetObj={setTargetObj} />
        </Selection>
      </Suspense>
      <Preload all />
    </Canvas>
    );
}

export default PartPreview

Parts.forEach((part) => {
  useGLTF.preload(`/${part.name}.glb`)
})
