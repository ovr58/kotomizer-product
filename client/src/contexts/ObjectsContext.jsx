import React, { createContext, useContext, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { getAllMaterials } from '../config/helpers'
import { Parts } from '../config/constants'

const ObjectsContext = createContext()

export const useObjects = () => useContext(ObjectsContext);

export const ObjectsProvider = ({ children }) => {
  
  console.log('OBJECTS PROVIDER')

  const objects = useMemo(() => Object.keys(Parts).map(
    (name) => useGLTF(`/${name}.glb`)
  ), [Parts.toString()])
  const textureLists = useMemo(() => getAllMaterials(), [])

  const proMaterial = objects[0].nodes.Detail1.material.clone()

  const materials = []

  textureLists.forEach((list, _i) => {
    const newMaterial = proMaterial.clone()
    const textures = useTexture(list)
    newMaterial.name = list.map.split('/')[1]
    newMaterial.map = textures.map
    newMaterial.aoMap = textures.aoMap
    newMaterial.roughnessMap = textures.roughnessMap
    newMaterial.normalMap = textures.normalMap
    materials.push(newMaterial)
  })

  objects.forEach((object) => {
    const objectNodes = object.nodes
    for (let node of Object.keys(objectNodes)) {
      if (node.includes('Detail')) {
        const findMaterial = materials.filter((material) => material.name === objectNodes[node].material.name)
        if (!findMaterial[0]) {
          materials.push(objectNodes[node].material.clone())
        }
        objectNodes[node].userData.originalMaterialName = objectNodes[node].material.name
      }
    }
  })
  return (
    <ObjectsContext.Provider value={{objects, materials}}>
      {children}
    </ObjectsContext.Provider>
  )
}