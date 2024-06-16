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
    description: 'part1 description'
  },
  {
    name: 'part2',
    type: 'perfo',
    connectors: ['con1out'],
    rotatable: false,
    filename: '/part2.glb',
    price: 5,
    description: 'part2 description'
  },
  {
    name: 'part3',
    type: 'head',
    connectors: [],
    rotatable: true,
    filename: '/part3.glb',
    price: 20,
    description: 'part3 description'
  },
  {
    name: 'part4',
    type: 'head',
    connectors: [],
    rotatable: true,
    filename: '/part4.glb',
    price: 15,
    description: 'part4 description'
  },
  {
    name: 'part5',
    type: 'head',
    connectors: [],
    rotatable: true,
    filename: '/part5.glb',
    price: 20,
    description: 'part5 description'
  },
  {
    name: 'part6',
    type: 'jumper',
    connectors: [2.122],
    rotatable: true,
    filename: '/part6.glb',
    price: 10,
    description: 'part6 description'
  }
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
