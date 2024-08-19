import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Float, Preload, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Parts } from '../config/constants'

import {
  Selection,
  Select,
  EffectComposer,
  Outline,
} from '@react-three/postprocessing' // для выделения детали с которой хоти работать
import { getPartSize } from '../config/helpers' // дистанция до камеры чтобы вся деталь вмещалась в поле камеры предпросмотра
import Camerarig from './Camerarig'
import * as TWEEN from '@tweenjs/tween.js'


const Model = ({ nodes, setClicked, clicked, setDist, setTargetObj }) => {

  const menuParts = useRef([])

  const setClickedPart = () => {
    let clickedPart = {}
    if (menuParts.current && menuParts.current.length > 0 && clicked !='') {
      console.log(menuParts.current)
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
          }, 500
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
      key={'catalogueMenu'}
      >
      {Object.keys(Parts).map((name, i) => (
        <Select
          key={`${name}/${i}`}
          enabled={
            hovered === name && Parts[name].available ||
            clicked === name && Parts[name].available
          }
        >
        <Float speed={0.35} rotationIntensity={0.5} floatIntensity={0.1}>
          <group 
            ref = {(el) => (menuParts.current[i] = el)}
            key={`${name}/${i}/group`}
            name={name}
            userData={{available: Parts[name].available}}
            castShadow 
            receiveShadow 
            onPointerOver={() => setHover(Parts[name].available ? name : '')}
            onPointerOut={() => setHover('')}
            onPointerDown={() => setClicked(Parts[name].available ? name : '')}
            >
              {Object.entries(nodes[i].nodes).filter((arr) => arr[0].includes('Detail')).map((subMesh) => (
                <mesh 
                  key={`${subMesh[0]}/${i}`}
                  geometry={subMesh[1].geometry}
                >
                  <meshStandardMaterial 
                    {...subMesh[1].material} 
                    transparent={clicked != '' && !(name == clicked)} 
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

  const objects = useMemo(() => Object.keys(Parts).map((name) => useGLTF(`/${name}.glb`)))

  const [ targetObj, setTargetObj ] = useState([0, 0, 0])

  return (
    <Canvas
      frameloop='demand'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Camerarig dist={dist} targetObj={targetObj}/>
      <ambientLight intensity={1.25} />
      <directionalLight position={[dist.dist, dist.height, dist.dist]} />
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
      <Preload all />
    </Canvas>
    );
}

export default PartPreview

Object.keys(Parts).forEach((name) => {
  useGLTF.preload(`/${name}.glb`)
})
