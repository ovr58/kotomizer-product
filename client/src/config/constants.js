import { swatch, fileIcon, ai, positionIcon, placeIcon, rotateIcon } from "../assets";

export const EditorTabs = [
  {
    name: "colorpicker",
    icon: swatch,
  },
  {
    name: "filepicker",
    icon: fileIcon,
  },
  {
    name: "partspicker",
    icon: ai,
  },
];

export const TransformTabs = [
  {
    name: 'changePosition',
    type: 'customButton',
    icon: positionIcon,
  },
  {
    name: 'place',
    type: 'customButton',
    icon: placeIcon,
  },
  {
    name: 'rotate',
    type: 'knobControl',
    icon: rotateIcon

  }
]

export const DecalTypes = {
  logo: {
    stateProperty: "logoDecal",
    filterTab: "logoShirt",
  },
  full: {
    stateProperty: "fullDecal",
    filterTab: "stylishShirt",
  },
};

export const Parts = [
  {
    name: 'part1',
    type: 'base',
    connectors: ['con1out', 'con2out'],
    rotatable: false,
    filename: '/part1.glb',
    price: 10,
    description: 'part1 description',
    available: true
  },
  {
    name: 'part2',
    type: 'perfo',
    connectors: ['con1out'],
    rotatable: false,
    filename: '/part2.glb',
    price: 5,
    description: 'part2 description',
    available: false
  },
  {
    name: 'part3',
    type: 'perfo',
    connectors: ['con1out'],
    rotatable: false,
    filename: '/part3.glb',
    price: 10,
    description: 'part3 description',
    available: false
  },
  {
    name: 'part4',
    type: 'perfo',
    connectors: ['con1out'],
    rotatable: false,
    filename: '/part4.glb',
    price: 2,
    description: 'part4 description',
    available: false
  },
  {
    name: 'part5',
    type: 'hause',
    connectors: ['con1out'],
    rotatable: true,
    filename: '/part5.glb',
    price: 57,
    description: 'part5 description',
    available: false
  },
  {
    name: 'part6',
    type: 'jumper',
    connectors: [2.12],
    rotatable: true,
    filename: '/part6.glb',
    price: 10,
    description: 'part6 description',
    available: false
  },
  {
    name: 'part7',
    type: 'head',
    connectors: ['con1out'],
    rotatable: true,
    filename: '/part7.glb',
    price: 20,
    description: 'part7 description',
    available: false
  },
  {
    name: 'part8',
    type: 'head',
    connectors: ['con1out'],
    rotatable: true,
    filename: '/part8.glb',
    price: 15,
    description: 'part8 description',
    available: false
  },
  {
    name: 'part9',
    type: 'jut',
    connectors: ['center'],
    rotatable: false,
    filename: '/part9.glb',
    price: 48,
    description: 'part9 description',
    available: false
  },
]


export const alerts = {
  cantAdd: {
    ru: 'Нельзя добавить! Выберите деталь или закончите установку!'
  },
  cantUndo: {
    ru: 'Нельзя отменить! Добавьте деталь в сборку!'
  },
  cantDeleteLast: {
    ru: 'Нельзя удалить!'
  },
  onlyOnePositionsAvalable: {
    ru: 'Только одна позиция доступна!'
  },
  arentRotatable: {
    ru: 'Не поворачиваемая деталь!'
  },
  intersectionDetected: {
    ru: 'НЕЛЬЗЯ ПОСТАВИТЬ!'
  }
}
