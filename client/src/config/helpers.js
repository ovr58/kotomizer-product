import { Vector3, Box3 } from "three"

export const downloadFile = (elementName, cpiData) => {
  const link = document.createElement("a")
  if (elementName == 'mainCanvas') {
    const element = document.querySelector(`.${elementName} canvas`)
    const dataURL = element.toDataURL()
    link.href = dataURL
    link.download = `${elementName}.png`
  } else {
    const blob = new Blob([cpiData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    link.href = url
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
    if (file.type == 'image/jpeg') {
      fileReader.readAsDataURL(file)
    } else {
      fileReader.readAsText(file)
    }
  })
  

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
