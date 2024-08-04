import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  Selection,
  Select,
  EffectComposer,
  Outline,
} from '@react-three/postprocessing'
import * as TWEEN from '@tweenjs/tween.js'

import appState from '../store'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

const Model = ({ name, positionCorrection, size, textureName, textureDefault, textures, setObjectState }) => {
  
  const materialSpheres = useRef([])
  const closeButton = useRef()
  // определяем состояние наведения курсора на деталь 
  const [openState, setOpenState] = useState(Boolean(name))

  const [hovered, setHover] = useState('')
  const [hoveredCloseButton, setCloseButtonHover] = useState(1)

  const [prevPosition, setPrevPosition] = useState([0,0,0])
  const [labelPosition, setLabelPosition] = useState(null)

  const [clicked, setClicked] = useState({name: null})


  useFrame(() => {
    TWEEN.update()
  })
  
  useEffect (() => {
    if (name != 'closed') {
      const padding = 0.05
      const count = materialSpheres.current.length
      const sphereSize = 0.1
      const radius = ((sphereSize+padding)*count)/(2*Math.PI)
      if (closeButton.current && materialSpheres.current[0]) {
        const count = materialSpheres.current.length
        if (openState) {
          let buttonPosX = positionCorrection[0] + radius + sphereSize/2
          let buttonPosY = positionCorrection[1] + radius + sphereSize/2
          let buttonPosZ = positionCorrection[2]+size.z/2+padding+sphereSize*1.5
          new TWEEN.Tween(closeButton.current.scale).to(
            {
              x: 1,
              y: 1,
              z: 1
            }, 1000
          ).easing(TWEEN.Easing.Cubic.Out).start()
          new TWEEN.Tween(closeButton.current.position).to(
            {
              x: buttonPosX,
              y: buttonPosY,
              z: buttonPosZ
            }, 1000
          ).easing(TWEEN.Easing.Cubic.Out).start()

          for (let i = 0; i < count; i++) {
            const t = i / count * 2 * Math.PI
            let posX = Math.cos( t ) * radius + positionCorrection[0]
            let posY = Math.sin( t ) * radius + positionCorrection[1]
            new TWEEN.Tween(materialSpheres.current[i].scale).to(
              {
                x: 1,
                y: 1,
                z: 1
              }, 1000
            ).easing(TWEEN.Easing.Cubic.Out).start()
            new TWEEN.Tween(materialSpheres.current[i].position).to(
              {
                x: posX,
                y: posY,
                z: positionCorrection[2]+size.z/2+padding+sphereSize
              }, 1000
            ).easing(TWEEN.Easing.Cubic.Out).start().onStart(() => {
              if (i == (count - 1)) {
                console.log('start prev position set to - ', [positionCorrection])
                setPrevPosition(positionCorrection)
                
              }
            }).onComplete(() => {
              if (i == (count - 1)) {
                setLabelPosition([posX, posY, positionCorrection[2]+size.z/2+padding+sphereSize])
              }
            })
          }

        } else {
          new TWEEN.Tween(closeButton.current.scale).to(
            {
              x: 0,
              y: 0,
              z: 0
            }, 1000
          ).easing(TWEEN.Easing.Cubic.Out).start()
          new TWEEN.Tween(closeButton.current.position).to(
            {
              x: prevPosition[0],
              y: prevPosition[1],
              z: prevPosition[2]
            }, 1000
          ).easing(TWEEN.Easing.Cubic.Out).start()

        for (let i = 0; i < count; i++) {
          new TWEEN.Tween(materialSpheres.current[i].scale).to(
            {
              x: 0,
              y: 0,
              z: 0
            }, 1000
          ).easing(TWEEN.Easing.Quadratic.Out).start()
          new TWEEN.Tween(materialSpheres.current[i].position).to(
            {
              x: prevPosition[0],
              y: prevPosition[1],
              z: prevPosition[2]
            }, 1000
          ).easing(TWEEN.Easing.Cubic.Out).start().onStart(() => {
            setLabelPosition(null)
          }).onComplete(() => {
            if (i == (count - 1)) {
              if (clicked.name) {
                console.log(clicked.name)
                const partIndex = name.split('/')[0]
                const groupIndex = name.split('/')[1]
                appState.assemblyMap[partIndex].material[groupIndex] = clicked.name
              }
            }
            setObjectState({
              name: 'closed',
              position: [0,0,0],
              textureCurrent: textureName,
              textureDefault: textureDefault})
            appState.camRotation = true
          })
        }
        }
      }
    }
  }, [positionCorrection, materialSpheres.current.length, openState])


// выделение <Select> включено если одно из условий выполнено 
  return (
    <group
      name={'materialsCatalogue'}
    >
      {textures && [...textures, textureDefault].map((material, i, arr) => (
        <Select
          key={`${material.name}/i`}
          enabled={
            hovered == material.name ||
            material.name == textureName 
          }
        >
          <mesh 
            ref = {(el) => (materialSpheres.current[i] = el)}
            name={`${material.name}`}
            castShadow 
            receiveShadow
            position={positionCorrection}
            scale={[0,0,0]} 
            onPointerOver={() => setHover(material.name)}
            onPointerOut={() => setHover('')}
            onClick={(e) => (e.stopPropagation(), setClicked({name: material.name}), setOpenState(false))}
            onPointerMissed={(e) => (e.stopPropagation(), setOpenState(false))}
          >
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial 
              {...material}
            />
          </mesh>
          {(i == (arr.length - 1) && materialSpheres.current[i] && labelPosition) &&
            <Html
              key={uuidv4()}
              position={labelPosition}
              distanceFactor={1.25}
            >
              <div className='annotation'>DEFAULT</div>
            </Html>
          }
        </Select>
      ))}
    <group
      name={'CloseButton'}
      ref={closeButton}
      position={positionCorrection}
      scale={[0,0,0]}
      rotation={[0,0,Math.PI/4]}
      onPointerOver={() => setCloseButtonHover(1.4)}
      onPointerOut={() => setCloseButtonHover(1)}
      onClick={(e) => (e.stopPropagation(), setOpenState(false))}
      >
      <mesh
        key={'up'}
      >
        <boxGeometry args={[0.07*hoveredCloseButton, 0.02*hoveredCloseButton, 0.02*hoveredCloseButton]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh
        key={'right'}
      >
        <boxGeometry args={[0.02*hoveredCloseButton, 0.07*hoveredCloseButton, 0.02*hoveredCloseButton]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
   </group>
  )
}


const MaterialChanger = ({ position, name, textureCurrent, textureDefault, textures, size, setObjectState }) => {

  console.log('MATERIALCHANGER')
  return (
    <Selection 
      key={uuidv4()}
    >
      <EffectComposer multisampling={10} autoClear={false}>
        <Outline
          blur = {true}
          visibleEdgeColor="indianred"
          edgeStrength={100.5}
        />  
      </EffectComposer>
      <Model 
        name = {name}
        positionCorrection = {position}
        size = {size}
        textureName = {textureCurrent}
        textureDefault = {textureDefault}
        textures = {textures}
        setObjectState = {setObjectState}
      />
    </Selection>
  )
}

export default MaterialChanger

MaterialChanger.propTypes = {
}