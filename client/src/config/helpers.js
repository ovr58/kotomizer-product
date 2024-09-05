import { Vector3, Box3 } from "three"
import * as THREE from 'three'
import { Parts } from "./constants"

export const downloadFile = (elementName, cpiData) => {
  if (cpiData === 'getImg') {
    const element = document.querySelector(`.${elementName} canvas`)
    const dataURL = element.toDataURL()
    return dataURL
  }
  const link = document.createElement("a")
  if (elementName == 'mainCanvas') {
    const element = document.querySelector(`.${elementName} canvas`)
    const dataURL = element.toDataURL()
    link.href = dataURL
    link.download = `${elementName}.png`
  } else {
    const blob = new Blob([cpiData], { type: 'text/plain' })
    const dataURL = URL.createObjectURL(blob)
    link.href = dataURL
    link.download = `${elementName}.cpi`
  }
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const reader = (file) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => resolve(fileReader.result)
    fileReader.onerror = () => reject(error)
    if (file.type.includes('image')) {
      fileReader.readAsDataURL(file)
    } else {
      fileReader.readAsText(file)
    }
  })
  
export const getPriceAndSpecs = (assemblyMap) => {
  let tableObj = {}
  let totalPrice = 0
  assemblyMap.forEach((instruction, i) => {
    const description = `${Parts[instruction.name].description} Материал: ${instruction.material.name || 'стандарт'}`
    const detailPrice = Parts[instruction.name].price * (instruction.scale ? instruction.scale[0]*instruction.scale[1] : 1)
    tableObj[i] = [description, detailPrice.toFixed(2)]
    totalPrice += (Math.round(100*detailPrice)/100)
  })
  totalPrice = totalPrice.toFixed(2)
  return {tableObj, totalPrice}
}

export const getAllMaterials = () => {
  const materialList = []
  const files = import.meta.glob('/public/materials/**/*.*')
  const fileList = Object.keys(files).map((filename) => filename.replace('/public/materials/', ''))
  const materialsList = [...new Set(fileList.map((file) => file.split('/')[0]))]
  materialsList.forEach((materialName) => {
    const materialObj = {
      map: `materials/${materialName}/basecolor.jpg`,
      normalMap: `materials/${materialName}/normal.jpg`,
      roughnessMap: `materials/${materialName}/roughness.jpg`,
      aoMap: `materials/${materialName}/AO.jpg`
    }
    materialList.push(materialObj)
  })
  return materialList
}

export const getContrastingColor = (color) => {
  // Remove the '#' character if it exists
  const hex = color.replace("#", "");

  // Convert the hex string to RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate the brightness of the color
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black or white depending on the brightness
  return brightness > 128 ? "black" : "white";
};


// считаем дистанцию удаления камеры и поднять камеру на сколько с припуском и в зависимости от fov
export const getDistance = (parts, padding = 0, fov = 25) => {

  parts = [parts, ...parts.children.filter(part => part.name.toLowerCase().includes('details'))]

  const partSizeMax = Math.max(...parts.map((part) => Math.max(...getPartSize(part).toArray()))) + padding
  const fovToRads = fov * ( Math.PI / 180 )
  
  return {
    dist: Math.abs( (partSizeMax/2 ) / Math.tan( fovToRads / 2 )), 
    height: partSizeMax/2
  }

}

export const positions = (assemblyMap, parts) => {

  parts = parts.children.filter(part => (part.type == 'Group' && part.name.includes('details')))
  let freeCons = []
  
  if (parts.length != 0) {
    for (let instruction of assemblyMap) {
  
      let partId = Math.abs(instruction.id)
      let positionClone = []
  
      if (instruction.type != 'jumper') {
  
        let conNames = parts[partId].userData.consNames
        if (conNames.length > 0) {
          let vertexCoord = parts[partId].userData.objectCons.getAttribute('position')
          let nameIndex = 0
          for (let coordIndex = 0; coordIndex < vertexCoord.count; coordIndex+=1) {
            let vertexVector = new Vector3()
            vertexVector.fromBufferAttribute(vertexCoord, coordIndex)
            freeCons.push({
              id: instruction.id,
              conName: parts[partId].userData.consNames[nameIndex],
              position: vertexVector.toArray()
            })
            nameIndex ++ 
          }
        }
  
        if (partId === 0) {
          positionClone = [0, 0, 0]
        } else {
          for (let conToPartIndex = 0; conToPartIndex < instruction.connectedTo.length; conToPartIndex++) {
            let conToPart = instruction.connectedTo[conToPartIndex]
            let conToPartId = conToPart.id
            let fixVector = assemblyMap[conToPartId].position
            let conName = conToPart.connector.name
            let conPosition = freeCons.filter((freeCon) => (freeCon.id == conToPartId && freeCon.conName == conName))[0].position
            let xOfBase = conPosition[0]
            let yOfBase = conPosition[1]
            let zOfBase = conPosition[2]
            positionClone[0] = xOfBase + fixVector[0]
            positionClone[1] = yOfBase + fixVector[1]
            positionClone[2] = zOfBase + fixVector[2]
            if (instruction.id >= 0) {
              freeCons = freeCons.filter(
                (freeCon) => !(conToPart.id == freeCon.id &&
                conToPart.connector.name == freeCon.conName)
              )
            }
          }
        }
      } else {
        positionClone[0] = instruction.position[0]
        positionClone[1] = instruction.position[1]
        positionClone[2] = instruction.position[2]
      }
        freeCons = [...freeCons]
        assemblyMap[partId].position = positionClone
    }
  }
  return {newAssemblyMap: assemblyMap, freeCons: freeCons}
}

export const getPartSize = (part) => {

  const box = new Box3().setFromObject(part)

  const partSize = new Vector3()

  box.getSize(partSize) // взяли размеры
  
  return partSize
}
// from this greate repository https://github.com/ivee-tech/three-buffer-geometry-utils
 export const mergeBufferGeometries = ( geometries, useGroups ) => {

  const mergeBufferAttributes = ( attributes ) => {

    var TypedArray;
    var itemSize;
    var normalized;
    var arrayLength = 0;
    
    for ( var i = 0; i < attributes.length; ++ i ) {

      var attribute = attributes[ i ];

      if ( attribute.isInterleavedBufferAttribute ) return null;

      if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
      if ( TypedArray !== attribute.array.constructor ) return null;

      if ( itemSize === undefined ) itemSize = attribute.itemSize;
      if ( itemSize !== attribute.itemSize ) return null;

      if ( normalized === undefined ) normalized = attribute.normalized;
      if ( normalized !== attribute.normalized ) return null;

      arrayLength += attribute.array.length;

    }

    var array = new TypedArray( arrayLength );
    var offset = 0;

    for ( var j = 0; j < attributes.length; ++ j ) {

      array.set( attributes[ j ].array, offset );

      offset += attributes[ j ].array.length;

    }
    return new THREE.BufferAttribute( array, itemSize, normalized );

  }

  var isIndexed = geometries[ 0 ].index !== null;

  var attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
  var morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

  var attributes = {};
  var morphAttributes = {};

  var mergedGeometry = new THREE.BufferGeometry();

  var offset = 0;

  for ( var i = 0; i < geometries.length; ++ i ) {

    var geometry = geometries[ i ];

    // ensure that all geometries are indexed, or none

    if ( isIndexed !== ( geometry.index !== null ) ) return null;

    // gather attributes, exit early if they're different

    for ( var name in geometry.attributes ) {

      if ( !attributesUsed.has( name ) ) return null;

      if ( attributes[ name ] === undefined ) attributes[ name ] = [];

      attributes[ name ].push( geometry.attributes[ name ] );

    }

    // gather morph attributes, exit early if they're different

    for ( var name in geometry.morphAttributes ) {

      if ( !morphAttributesUsed.has( name ) ) return null;

      if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

      morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

    }

    // gather .userData

    mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
    mergedGeometry.userData.mergedUserData.push( geometry.userData );

    if ( useGroups ) {

      var count;

      if ( isIndexed ) {

        count = geometry.index.count;

      } else if ( geometry.attributes.position !== undefined ) {

        count = geometry.attributes.position.count;

      } else {

        return null;

      }

      mergedGeometry.addGroup( offset, count, i );

      offset += count;

    }

  }

  // merge indices

  if ( isIndexed ) {

    var indexOffset = 0;
    var indexList = [];

    for ( var i = 0; i < geometries.length; ++ i ) {

      var index = geometries[ i ].index;

      if ( indexOffset > 0 ) {

        index = index.clone();

        for ( var j = 0; j < index.count; ++ j ) {

          index.setX( j, index.getX( j ) + indexOffset );

        }

      }

      indexList.push( index );
      indexOffset += geometries[ i ].attributes.position.count;

    }

    var mergedIndex = mergeBufferAttributes( indexList );

    if ( !mergedIndex ) return null;

    mergedGeometry.index = mergedIndex;

  }

  // merge attributes

  for ( var name in attributes ) {

    var mergedAttribute = mergeBufferAttributes( attributes[ name ] );

    if ( ! mergedAttribute ) return null;
    mergedGeometry.deleteAttribute( name )
    mergedGeometry.setAttribute( name, mergedAttribute );

  }

  // merge morph attributes

  for ( var name in morphAttributes ) {

    var numMorphTargets = morphAttributes[ name ][ 0 ].length;

    if ( numMorphTargets === 0 ) break;

    mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
    mergedGeometry.morphAttributes[ name ] = [];

    for ( var i = 0; i < numMorphTargets; ++ i ) {

      var morphAttributesToMerge = [];

      for ( var j = 0; j < morphAttributes[ name ].length; ++ j ) {

        morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

      }

      var mergedMorphAttribute = mergeBufferAttributes( morphAttributesToMerge );

      if ( !mergedMorphAttribute ) return null;

      mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

    }

  }

  return mergedGeometry;

}


export const isAtPlaces = (assemblyMap, parts) => {

  parts = parts.children.filter(part => (part.type == 'Group' && part.name.includes('details')))

  const partsCopied = []

  parts.forEach((part) => {
    const partObje = {}
    partObje.type = part.type
    partObje.position = part.position.toArray()
    partObje.rotation = part.rotation.toArray()
    partsCopied.push(partObje)
  })
  
  partsCopied.forEach((part) => {
    part.rotation.includes('XYZ') && part.rotation.pop()
  })

  const print1 = assemblyMap.reduce((acum, posAndRot) => 
    acum = [...acum, ...posAndRot.position, ...posAndRot.rotation], []).filter((str) => str !== 'XYZ').toString()
  const print2 = partsCopied.reduce((acum, posAndRot) => 
    acum = [...acum, ...posAndRot.position, ...posAndRot.rotation], []).toString()
  return print1 == print2
}
