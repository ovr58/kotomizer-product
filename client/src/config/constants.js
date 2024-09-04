import { shop, fileIcon, constructor, positionIcon, placeIcon, rotateIcon } from "../assets";

export const EditorTabs = [
  {
    name: "catpostshop",
    icon: shop,
    label: 'магазин готовых когтеточек'
  },
  {
    name: "filepicker",
    icon: fileIcon,
    label: 'скачивание/загрузка/скриншот'
  },
  {
    name: "partspicker",
    icon: constructor,
    label: 'каталог деталей'
  },
];

export const TransformTabs = [
  {
    name: 'changePosition',
    type: 'customButton',
    icon: positionIcon,
    label: 'перемещать'
  },
  {
    name: 'place',
    type: 'customButton',
    icon: placeIcon,
    label: 'прикрепить'
  },
  {
    name: 'rotate',
    type: 'knobControl',
    icon: rotateIcon,
    label: 'поворот'

  }
]

export const FileOpsTypes = {
  downloadCpi: {
    stateProperty: "Save The Cat Post",
    elementName: 'cpidata'
  },
  uploadCpi: {
    stateProperty: "Upload The Cat Post",
    stateProp: 'assembledMap'
  },
  downloadPng: {
    stateProperty: "Photo The Cat Post",
    elementName: "mainCanvas",
  },
  uploadPng: {
    stateProperty: "Set Background",
    stateProp: 'backgroundImg'
  },
};

export const Parts = {
  part1: {
    type: 'base',
    connectors: ['con1out', 'con2out'],
    rotatable: false,
    filename: '/part1.glb',
    price: 10,
    description: 'part1 description',
    available: true
  },
  part2: {
    type: 'column',
    connectors: ['con1out'],
    rotatable: false,
    filename: '/part2.glb',
    price: 5,
    description: 'part2 description',
    available: false
  },
  part3: {
    type: 'column',
    connectors: ['con1out'],
    rotatable: false,
    filename: '/part3.glb',
    price: 10,
    description: 'part3 description',
    available: false
  },
  part4: {
    type: 'column',
    connectors: ['con1out'],
    rotatable: false,
    filename: '/part4.glb',
    price: 2,
    description: 'part4 description',
    available: false
  },
  part5: {
    type: 'hause',
    connectors: ['con1out'],
    rotatable: true,
    filename: '/part5.glb',
    price: 57,
    description: 'part5 description',
    available: false
  },
  part6: {
    type: 'jumper',
    connectors: [2.12],
    rotatable: true,
    filename: '/part6.glb',
    price: 10,
    description: 'part6 description',
    available: false
  },
  part7: {
    type: 'head',
    connectors: ['con1out'],
    rotatable: true,
    filename: '/part7.glb',
    price: 20,
    description: 'part7 description',
    available: false
  },
  part8: {
    type: 'head',
    connectors: ['con1out'],
    rotatable: true,
    filename: '/part8.glb',
    price: 15,
    description: 'part8 description',
    available: false
  },
  part9: {
    type: 'jut',
    connectors: ['center'],
    rotatable: true,
    height: 0.1203,
    filename: '/part9.glb',
    price: 48,
    description: 'part9 description',
    available: false
  },
}


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
