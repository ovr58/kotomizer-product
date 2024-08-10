import React, { createContext, useContext, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { getAllMaterials } from '../config/helpers'

const TextureContext = createContext()

export const useTextures = () => useContext(TextureContext);

export const TextureProvider = ({ children }) => {

  console.log('TEXTURE PROVIDER')

    const materials = []

    const textureLists = useMemo(() => getAllMaterials(), [])

    const material = new THREE.MeshStandardMaterial()

    textureLists.forEach((list, _i) => {
      const newMaterial = material.clone()
      const textures = useTexture(list)
      newMaterial.name = list.map.split('/')[1]
      newMaterial.map = textures.map
      newMaterial.aoMap = textures.aoMap
      newMaterial.roughnessMap = textures.roughnessMap
      newMaterial.normalMap = textures.normalMap
      materials.push(newMaterial)
    })
    console.log(materials)

  return (
    <TextureContext.Provider value={materials}>
      {children}
    </TextureContext.Provider>
  )
}