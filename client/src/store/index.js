import { proxy } from 'valtio'

const state = proxy({
    intro: true,
    color: '#EFBD48',
    assemblyMap: [
        {id: 0,
         name: 'part1',   
         connectedTo: []
        }, 
        {id: 1,
         name: 'part2',
         connectedTo: [{id: 0,
                       connector: {name: 'con1out'}
                    }]
        }, 
        {id: 2,
         name: 'part2',
         connectedTo: [{id: 0,
                       connector: {name: 'con2out'}
                    }]
        }, 
        {id: 3,
         name: 'part4', 
         connectedTo: [{id: 1, 
                       connector: {name: 'con2out'}
                    }]
        },
        {id: 4,
         name: 'part2', 
         connectedTo: [{id: 2, 
                       connector: {name: 'con2out'}
                    }]
        },
    ],
    freeCons: [],
    parts: [], // !!! при загрузке деталей все объекты здесь
    isLogoTexture: true,
    isFullTexture: false,
    logoDecal: './threejs.png',
    fullDecal: './threejs.png',
})

export default state