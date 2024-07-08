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
         rotation: [0, 0, 0]
        }, 
        {id: 1,
         name: 'part2',
         type: 'perfo',
         connectedTo: [{id: 0,
                       connector: {name: 'con1out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0]
        }, 
        {id: 2,
         name: 'part3',
         type: 'perfo',
         connectedTo: [{id: 0,
                       connector: {name: 'con2out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0]
        }, 
        {id: 3,
         name: 'part2',
         type: 'perfo', 
         connectedTo: [{id: 1, 
                       connector: {name: 'con1out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0]
        },
        {id: 4,
         name: 'part5',
         type: 'hause', 
         connectedTo: [{id: 3, 
                       connector: {name: 'con1out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0]
        },
      //   {id: 5,
      //    name: 'part4',
      //    type: 'perfo', 
      //    connectedTo: [{
      //       id:4,
      //       connector: {name: 'con1out'},
      //    }],
      //    position: [0, 0, 0],
      //    rotation: [0, 0, 0],
      //   },
      //   {id: 6,
      //    name: 'part5',
      //    type: 'perfo', 
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
    pointsToMoveAlong: [],
    intersected: [], //информация о пересечении с другими деталями
    parts: [], // !!! при загрузке деталей все объекты здесь
    camRotation: true,
    isFullTexture: false,
    logoDecal: './threejs.png',
    fullDecal: './threejs.png',
})

export default appState