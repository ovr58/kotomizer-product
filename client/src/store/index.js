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
    ],
    freeCons: [],
    intersected: [], //информация о пересечении с другими деталями
    camRotation: true,
    distanceToCamera: {dist: 22, height: 1},
    objectToChange: null,
    assembledSize: null,
    backgroundObj: {},
    userToken: null,
    shopModelData: null,
    orderImg: null
})

export default appState