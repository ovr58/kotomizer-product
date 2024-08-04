import React, { createContext, useContext, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { getAllMaterials } from '../config/helpers'

const TextureContext = createContext()

export const useTextures = () => useContext(TextureContext);

export const TextureProvider = ({ children }) => {

  console.log('TEXTURE PROVIDER')

    const textureLists = useMemo(() => getAllMaterials(), [])

    const materials = textureLists.map((list) => {
        const material = useTexture(list)
        material.name = list.map.split('/')[1]
        return material
    })

  return (
    <TextureContext.Provider value={materials}>
      {children}
    </TextureContext.Provider>
  )
}