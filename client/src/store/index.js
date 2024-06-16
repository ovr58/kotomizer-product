import { proxy } from 'valtio'

const state = proxy({
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
         name: 'part2',
         type: 'perfo',
         connectedTo: [{id: 0,
                       connector: {name: 'con2out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0]
        }, 
        {id: 3,
         name: 'part4',
         type: 'head', 
         connectedTo: [{id: 1, 
                       connector: {name: 'con2out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0]
        },
        {id: 4,
         name: 'part2',
         type: 'perfo', 
         connectedTo: [{id: 2, 
                       connector: {name: 'con2out'}
                    }],
         position: [0, 0, 0],
         rotation: [0, 0, 0]
        },
        {id: 5,
         name: 'part6',
         type: 'jumper', 
         connectedTo: [{
            id:0,
            connector: {name: 'jumper1start'},
            position: [0, 0, 0]
         },{
            id:3,
            connector: {name: 'jumper1end'},
            position: [0, 0, 0]
         }],
         position: [0, 0, 0],
         rotation: [0, 0, 0]
        },
    ],
    freeCons: [],
    pointsToMoveAlong: [],
    intersected: [], //информация о пересечении с другими деталями
    parts: [], // !!! при загрузке деталей все объекты здесь
    isLogoTexture: true,
    isFullTexture: false,
    logoDecal: './threejs.png',
    fullDecal: './threejs.png',
})

export default state