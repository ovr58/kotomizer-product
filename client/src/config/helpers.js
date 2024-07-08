import { Vector3, Box3 } from "three";
import * as THREE from 'three'

export const downloadCanvasToImage = () => {
  const canvas = document.querySelector("canvas");
  const dataURL = canvas.toDataURL();
  const link = document.createElement("a");

  link.href = dataURL;
  link.download = "canvas.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const reader = (file) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.readAsDataURL(file);
  });

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

// считаем высоту модели в карте сборки
export const getHeight = (scene, assemblyMap) => {

  const box = new THREE.Box3()

  const objSize = new THREE.Vector3()

  box.getSize(objSize)
  let assembledHeightArray = [] //переменная для всех высот одного уровня
//идем по всем инструкциям карты сборки
  for (let instruction of assemblyMap) {
//если тип детали не jumper
    if (instruction.type != 'jumper') {
      let partId = instruction.id
      let bb = box.copy().setFromObject(parts[Number(instruction.name.replace('part', '')) - 1].nodes.Detail1) 
      console.log(bb)
      let partHeight = parts[Number(instruction.name.replace('part', '')) - 1].nodes.Detail1.scale.y
      if (partId === 0) {
        assembledHeightArray.push({id: partId, to: '', height: partHeight})
      } else {
        for (let isConncectedTo of instruction.connectedTo) {
          let objExist = assembledHeightArray.find(obj => obj.to === isConncectedTo.id)
          if (objExist) {
            assembledHeightArray[assembledHeightArray.indexOf(objExist)].height = Math.max(objExist.height, partHeight)
          } else {
            assembledHeightArray.push({id: partId, to: isConncectedTo.id, height: partHeight})
          }
          }
      }
    }
  }
  
  const result = assembledHeightArray.reduce((accum, cur) => accum = accum + cur.height, 0)

  return result
}


// считаем дистанцию удаления камеры и поднять камеру на сколько с припуском и в зависимости от fov
export const getDistance = (parts, padding = 0, fov = 25) => {

  parts = [parts, ...parts.children.filter(part => part.name.includes('details'))]

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
  
        let conNames = Object.keys(parts[partId].userData).filter(conName => conName.includes('con'))
        if (conNames.length > 0) {
          for (let conName of conNames) {
            freeCons.push({
              id: instruction.id,
              conName: conName,
              position: parts[partId].userData[conName].position
            })
          }
        }
  
        if (partId === 0) {
          positionClone = [0, 0, 0]
        } else {
          for (let conToPart of instruction.connectedTo) {
            let fixVector = []
            fixVector = assemblyMap[conToPart.id].position
            let xOfBase = parts[conToPart.id].userData[conToPart.connector.name].position.x 
            let yOfBase = parts[conToPart.id].userData[conToPart.connector.name].position.y
            let zOfBase = parts[conToPart.id].userData[conToPart.connector.name].position.z
            positionClone[0] = xOfBase + fixVector[0]
            positionClone[1] = yOfBase + fixVector[1]
            positionClone[2] = zOfBase + fixVector[2]
            freeCons = freeCons.filter(
              (freeCon) => !(conToPart.id == freeCon.id &&
              conToPart.connector.name == freeCon.conName)
            )
          }
        }
      } else {
        positionClone[0] = instruction.position[0]
        positionClone[1] = instruction.position[1]
        positionClone[2] = instruction.position[2]
      }
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

export const isAtPlaces = (assemblyMap, parts) => {

  parts = parts.children.filter(part => (part.type == 'Group' && part.name.includes('details')))

  const partsCopied = []

  parts.forEach((part) => {
    const partObje = {}
    partObje.type = part.type
    partObje.position = part.position.toArray()
    partObje.rotation = part.rotation.toArray()
    partObje.rotation.pop()
    partsCopied.push(partObje)
  })

  const print1 = assemblyMap.reduce((acum, posAndRot) => 
    acum = [...acum, ...posAndRot.position, ...posAndRot.rotation], []).toString()
  const print2 = partsCopied.reduce((acum, posAndRot) => 
    acum = [...acum, ...posAndRot.position, ...posAndRot.rotation], []).toString()
  
  return print1 == print2
}
