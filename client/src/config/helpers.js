import { ConstantColorFactor, Vector3 } from "three";

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


export const getHeight = (parts, assemblyMap) => {

  let assembledHeightArray = []
  
  for (let instruction of assemblyMap) {
    let partId = instruction.id
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
  
  const result = assembledHeightArray.reduce((accum, cur) => accum = accum + cur.height, 0)

  return result
}

export const getDistance = (parts, assemblyMap, padding = 0.7, fov = 25) => {

  const height = assemblyMap.length == 0 ? 
    parts[0].nodes.Detail1.scale.y
    : getHeight(parts, assemblyMap) + padding

  const width = Math.max(...parts.map(object => object.nodes.Detail1.scale.x), 
                          ...parts.map(object => object.nodes.Detail1.scale.z)) + padding

  const fovToRads = fov * ( Math.PI / 180 )
  
  return Math.abs( Math.max(height, width) / Math.tan( fovToRads / 2 ) )

}


export const positions = (assemblyMap, parts) => {
  
  let freeCons = []

  const height = getHeight(parts, assemblyMap)

  for (let instruction of assemblyMap) {
    let partId = Math.abs(instruction.id)
    let catalogId = Number(instruction.name.replace('part', '')) - 1
    let conNames = Object.keys(parts[catalogId].nodes).filter(conName => conName.includes('con'))
    if (conNames.length > 0) {
      for (let conName of conNames) {
        freeCons.push({
          id: instruction.id,
          conName: conName,
          position: parts[catalogId].nodes[conName].position
        })
      }
    }
    
    if (partId === 0) {
      assemblyMap[0].position = new Vector3(0, -height/2, 0)
    } else {
      for (let conToPart of instruction.connectedTo) {
        let partConToId = Number(assemblyMap[conToPart.id].name.replace('part', '')) - 1
        let fixVector = assemblyMap[conToPart.id].position
        let xOfBase = parts[partConToId].nodes[conToPart.connector.name].position.x 
        let yOfBase = parts[partConToId].nodes[conToPart.connector.name].position.y 
        let zOfBase = parts[partConToId].nodes[conToPart.connector.name].position.z 
        let x = xOfBase + fixVector.x
        let y = yOfBase + fixVector.y
        let z = zOfBase + fixVector.z
        let vectorPosition = new Vector3(x, y, z)
        assemblyMap[partId].position = vectorPosition
        freeCons = freeCons.filter(
          (freeCon) => !(conToPart.id == freeCon.id &&
          conToPart.connector.name == freeCon.conName)
        )
      }
    }
  }
  
  return {newAssemblyMap: assemblyMap, freeCons: freeCons}
}