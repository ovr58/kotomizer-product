import { proxy } from 'valtio'

const appState = proxy({
    intro: true,
    color: '#EFBD48',
    assemblyMap: [
        {id: 0,
         name: 'part1',
         type: 'base',
         connectedTo: [],
         position: [0, 0, 0],
         rotation: [0, 0, 0],
         material: {}
        }, 
        {id: 1,
         name: 'part2',
         type: 'column',
         connectedTo: [{id: 0,
                       connector: {name: 'con1out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0],
         material: {}
        }, 
        {id: 2,
         name: 'part3',
         type: 'column',
         connectedTo: [{id: 0,
                       connector: {name: 'con2out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0],
         material: {}
        }, 
        {id: 3,
         name: 'part2',
         type: 'column', 
         connectedTo: [{id: 1, 
                       connector: {name: 'con1out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0],
         material: {}
        },
        {id: 4,
         name: 'part5',
         type: 'hause', 
         connectedTo: [{id: 3, 
                       connector: {name: 'con1out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0],
         material: {}
        },
      //   {id: 5,
      //    name: 'part4',
      //    type: 'column', 
      //    connectedTo: [{
      //       id:4,
      //       connector: {name: 'con1out'},
      //    }],
      //    position: [0, 0, 0],
      //    rotation: [0, 0, 0],
      //   },
      //   {id: 6,
      //    name: 'part5',
      //    type: 'column', 
      //    connectedTo: [{
      //       id:3,
      //       connector: {name: 'con1out'},
      //    }],
      //    position: [0, 0, 0],
      //    rotation: [0, 0, 0],
      //   },
      //   {id: 7,
      //    name: 'part9',
      //    type: 'head', 
      //    connectedTo: [{
      //       id:6,
      //       connector: {name: 'con1out'},
      //    }],
      //    position: [0, 0, 0],
      //    rotation: [0, 0, 0],
      //   },
    ],
    freeCons: [],
    intersected: [], //информация о пересечении с другими деталями
    camRotation: true,
    distanceToCamera: {dist: 22, height: 1},
    distanceToPreviewCamera: {dist: 22, height: 1},
    objectToChange: null,
    assembledSize: null,
    isFullTexture: false,
    logoDecal: './threejs.png',
    fullDecal: './threejs.png',
})

export default appState