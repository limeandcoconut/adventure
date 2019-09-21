const entities = require('./entities')
const Entity = require('./entity')
// const ResolverSystem = require('./systems/resolver-system')
// const LocatorSystem = require('./systems/locator-system')
const GetterSystem = require('./systems/getter-system')
const DroppingSystem = require('./systems/dropping-system')
const InventorySystem = require('./systems/inventory-system')
const OpenSystem = require('./systems/open-system')
// const CloseSystem = require('./systems/close-system')
const MovementSystem = require('./systems/movement-system')
const BeginSystem = require('./systems/begin-system')
const LookSystem = require('./systems/look-system')
const PutSystem = require('./systems/put-system')
const ReadSystem = require('./systems/read-system')
const CheckSystem = require('./systems/check-system')
/* eslint-disable require-jsdoc */
const GeneralInputProcess = require('./processes/general-input-process')

const {
  Descriptors,
  Container,
  Location,
  Appearance,
  Text,
  ObjectProperties,
  Area,
  Option,
  Tool,
  Actor,
  Multipart,
} = require('./components.js')

// let resolverSystem = new ResolverSystem()
// let locatorSystem = new LocatorSystem()
let getterSystem = new GetterSystem()
let droppingSystem = new DroppingSystem()
let inventorySystem = new InventorySystem()
let openSystem = new OpenSystem()
let movementSystem = new MovementSystem()
let beginSystem = new BeginSystem()
let lookSystem = new LookSystem()
let putSystem = new PutSystem()
let readSystem = new ReadSystem()
let checkSystem = new CheckSystem()

let systems = {
  // resolve: resolverSystem,
  // locate: locatorSystem,
  open: openSystem,
  get: getterSystem,
  drop: droppingSystem,
  inventory: inventorySystem,
  move: movementSystem,
  begin: beginSystem,
  look: lookSystem,
  put: putSystem,
  read: readSystem,
  check: checkSystem,
  uncheck: checkSystem,
}

const generalActionQueue = []
let generalInputProcess = new GeneralInputProcess(generalActionQueue)

let processes = [
  generalInputProcess,
]

function newId() {
  if (newId.lowestFreeId < newId.maxId) {
    let id = newId.lowestFreeId
    newId.lowestFreeId += 1
    return id
  }

  throw new RangeError('Maximum entity ids registered, approaching unsafe value')
}
newId.lowestFreeId = 10
newId.maxId = Number.MAX_SAFE_INTEGER

// Register a factory method for creating entities
function createRoom(props = {}) {
  let {
    parent,
    volume,
    maxLoad,
    freeVolume,
    contents,
    fixtures,
    open,
    surface,
    appearance,
    size,
    baseWeight,
    weight,
    fixture,
    part,
    visible,
    transparent,
    visited,
    title,
    doors,
  } = props

  let room = new Entity()
  room.id = newId()
  room.appearance = new Appearance(appearance)
  room.location = new Location(parent)
  room.descriptors = new Descriptors(['room'])
  room.container = new Container({volume, maxLoad, freeVolume, contents, fixtures, open, surface})
  room.properties = new ObjectProperties({size, baseWeight, weight, fixture, part, visible, transparent})
  room.area = new Area(title, visited, doors)

  return room
}

function createContainer(props = {}) {
  let {
    parent,
    volume,
    maxLoad,
    freeVolume,
    contents,
    fixtures,
    open,
    surface,
    labels,
    descriptors,
    appearance,
    size,
    baseWeight,
    weight,
    fixture,
    part,
    visible,
    transparent,
    text,
  } = props

  let container = new Entity()
  container.id = newId()
  container.appearance = new Appearance(appearance)
  container.location = new Location(parent)
  container.descriptors = new Descriptors(labels, descriptors)
  container.container = new Container({volume, maxLoad, freeVolume, contents, fixtures, open, surface})
  container.properties = new ObjectProperties({size, baseWeight, weight, fixture, part, visible, transparent})

  if (text) {
    container.text = new Text(text)
  }
  return container
}

function createThing(props = {}) {
  let {
    parent,
    labels,
    descriptors,
    appearance,
    size,
    baseWeight,
    weight,
    fixture,
    part,
    visible,
    transparent,
    text,
  } = props
  let thing = new Entity()
  thing.id = newId()
  thing.appearance = new Appearance(appearance)
  thing.location = new Location(parent)
  thing.descriptors = new Descriptors(labels, descriptors)
  thing.properties = new ObjectProperties({size, baseWeight, weight, fixture, part, visible, transparent})
  if (text) {
    thing.text = new Text(text)
  }
  return thing
}

function createTool(props = {}) {
  let {
    parent,
    labels,
    descriptors,
    appearance,
    size,
    baseWeight,
    weight,
    fixture,
    part,
    visible,
    transparent,
    text,
    toolType,
  } = props
  let tool = new Entity()
  tool.id = newId()
  tool.tool = new Tool(toolType)
  tool.appearance = new Appearance(appearance)
  tool.location = new Location(parent)
  tool.descriptors = new Descriptors(labels, descriptors)
  tool.properties = new ObjectProperties({size, baseWeight, weight, fixture, part, visible, transparent})
  if (text) {
    tool.text = new Text(text)
  }
  return tool
}

function createOption(props = {}) {
  let {
    parent,
    labels,
    descriptors,
    appearance,
    size = 0,
    baseWeight = 0,
    weight,
    fixture,
    part,
    visible,
    transparent,
    value,
  } = props
  let option = new Entity()
  option.id = newId()
  option.appearance = new Appearance(appearance)
  option.location = new Location(parent)
  option.descriptors = new Descriptors(labels, descriptors)
  option.properties = new ObjectProperties({size, baseWeight, weight, fixture, part, visible, transparent})
  option.option = new Option(value)
  return option
}

function createPlayer(props = {}) {
  let {
    parent,
    volume,
    maxLoad,
    freeVolume,
    contents,
    fixtures,
    open,
    surface,
    appearance,
    size,
    baseWeight,
    weight,
    fixture,
    part,
    visible,
    transparent,
    initiative,
  } = props
  let player = new Entity()
  player.id = newId()
  player.appearance = new Appearance(appearance)
  player.location = new Location(parent)
  player.descriptors = new Descriptors(['you', 'self', 'me', 'myself'], [])
  player.container = new Container({volume, maxLoad, freeVolume, contents, fixtures, open, surface})
  player.properties = new ObjectProperties({size, baseWeight, weight, fixture, part, visible, transparent})
  player.actor = new Actor(initiative)

  return player
}

let player

if (newId.lowestFreeId === 10) {
  // Great! This is where you create an entity 🤖
  let testingChamber00178 = createRoom({
    title: 'Testing Chamber 00178',
    appearance: 'A bare and [hopefully] forgettable office space.',
    volume: Number.POSITIVE_INFINITY,
    maxLoad: Number.POSITIVE_INFINITY,
    size: Number.POSITIVE_INFINITY,
    baseWeight: Number.POSITIVE_INFINITY,
  })

  let anotherRoom = createRoom({
    title: 'Another Room',
    appearance: 'This all looks unbearably banal. There\'s a rather outdated looking desk in this room. It\'s worn and uninspiring.',
    doors: {
      s: testingChamber00178,
      // w: closet,
    },
    volume: Number.POSITIVE_INFINITY,
    maxLoad: Number.POSITIVE_INFINITY,
    size: Number.POSITIVE_INFINITY,
    baseWeight: Number.POSITIVE_INFINITY,
  })

  let closet = createRoom({
    title: 'Supply Closet',
    appearance: 'You are in an empty supply closet. Beneath your feet is a stained concrete floor.',
    doors: {
      e: anotherRoom, // eslint-disable-line unicorn/prevent-abbreviations
    },
    volume: Number.POSITIVE_INFINITY,
    maxLoad: Number.POSITIVE_INFINITY,
    size: Number.POSITIVE_INFINITY,
    baseWeight: Number.POSITIVE_INFINITY,
  })

  player = createPlayer({
    parent: testingChamber00178,
    appearance: 'You.',
    volume: 10,
    freeVolume: 9,
    maxLoad: 10,
    // load: 1,
    size: 10,
    baseWeight: 10,
    weight: 11,
  })

  let thing = createThing({
    parent: player,
    labels: ['thing', 'THING', 'thign'],
    appearance: 'An amorphous blob of greyish goop.',
    size: 1,
    baseWeight: 1,
  })

  let sign = createThing({
    parent: testingChamber00178,
    labels: ['sign'],
    descriptors: ['plastic', 'laminated'],
    appearance: 'A poorly laminated 8.5" x 11" sign. It has the look of something made by a cheerful person, it has however, not been treated very well in it\'s term of service since it\'s creation. It hangs rather like something crucified: resolute, but not a happy object.',
    size: 0,
    baseWeight: 0,
    fixture: true,
    text: 'WELCOME TO THE TESTING AREA:\n' +
            'Congratulations on your new position!\n' +
            'This environment promotes fun and cooperation.',
  })

  let coin = createThing({
    parent: player,
    labels: ['coin', 'money'],
    descriptors: ['round', 'shiny', 'silver', 'cold'],
    appearance: 'A large, shiny, silver, coin. It lies cold in the hand.',
    size: 0,
    baseWeight: 0,
    visible: false,
  })

  let crate = createContainer({
    parent: testingChamber00178,
    open: true,
    labels: ['crate'],
    appearance: 'A weathered wooden crate.',
    volume: 4,
    freeVolume: 2,
    maxLoad: 6,
    size: 3,
    baseWeight: 3,
    weight: 5,
  })

  let rock = createThing({
    parent: testingChamber00178,
    labels: ['rock'],
    appearance: 'It\'s just a stone.',
    size: 1,
    baseWeight: 1,
  })

  let screw = createThing({
    parent: testingChamber00178,
    labels: ['screw', 'fixture'],
    descriptors: ['red', 'rusty'],
    appearance: 'A rusty screw with flaking red paint on the head.',
    size: 1,
    baseWeight: 1,
  })

  let bolt = createThing({
    parent: crate,
    labels: ['bolt', 'fixture'],
    descriptors: ['red'],
    appearance: 'A bolt with chpped red paint on the head.',
    size: 1,
    baseWeight: 1,
  })

  let box = createContainer({
    parent: crate,
    labels: ['box'],
    open: false,
    appearance: 'A small vaguely mildewed shoe box.',
    volume: 2,
    freeVolume: 1,
    maxLoad: 2,
    size: 2,
    baseWeight: 1,
    weight: 2,
  })

  let wrench = createThing({
    parent: box,
    labels: ['wrench'],
    appearance: 'A wrench shaped like a gibbous moon.',
    size: 1,
    baseWeight: 1,
  })

  let weight = createThing({
    parent: anotherRoom,
    labels: ['weight'],
    descriptors: ['lead', 'heavy'],
    appearance: 'A heavy lead weight.',
    size: 1,
    baseWeight: 1,
  })

  let desk = createContainer({
    parent: anotherRoom,
    labels: ['desk', 'table'],
    descriptors: ['outdated', 'seafoam', 'chipped'],
    appearance: 'A rather outdated looking desk, slightly worn around the edges. It\'s made of steel and pressboard laminated on top with chipped seafoam formica.',
    volume: 10,
    // freeVolume: 1,
    maxLoad: 100,
    size: 15,
    baseWeight: 20,
    // weight: 1,
    open: true,
    transparent: true,
    surface: true,
  })

  let paper = createContainer({
    parent: desk,
    labels: ['paper'],
    descriptors: ['sheet'],
    appearance: 'An sheet of 8.5"x11" paper.',
    text: 'Please finish this form, completely filling in the circles. \nHave you taken this test previously? \nYES: () NO: ()',
    volume: 0,
    maxLoad: 0,
    size: 0,
    baseWeight: 0,
    open: true,
    surface: true,
  })

  paper.multipart = new Multipart()

  let yes = createOption({
    parent: paper,
    labels: ['yes', 'option', 'optoin'],
    descriptors: [],
    appearance: 'A printed option reading "YES:" with a little circle beside it. The circle looks like one of those dots that is meant to be read by an automatic machine.',
    size: 0,
    baseWeight: 0,
    part: true,
    value: false,
  })

  let no = createOption({
    parent: paper,
    labels: ['no', 'option', 'optoin'],
    descriptors: [],
    appearance: 'A printed option reading "NO:" with a little circle beside it. You should probably fill in the circle completely.',
    size: 0,
    baseWeight: 0,
    part: true,
    value: false,
  })

  let pencil = createTool({
    parent: desk,
    labels: ['pencil'],
    descriptors: ['yellow', 'ticonderoga'],
    appearance: 'A standard No. 2 HB Pencil. What did you expect?',
    text: 'HB 2 TICONDEROGA',
    size: 0,
    baseWeight: 0,
    toolType: 'write',
  })

  let tray = createContainer({
    parent: desk,
    labels: ['tray', 'basket'],
    descriptors: ['wire', 'mesh'],
    appearance: 'A little wire mesh tray for filing papers in.',
    volume: 1,
    // freeVolume: 1,
    maxLoad: 2,
    size: 1,
    baseWeight: 4,
    // weight: 1,
    open: true,
    transparent: true,
    surface: true,
  })

  let sack = createContainer({
    parent: anotherRoom,
    labels: ['sack', 'bag'],
    descriptors: ['cloth', 'mesh'],
    appearance: 'Drawstring bag made from cloth mesh.',
    volume: 3,
    // freeVolume: 1,
    maxLoad: 2,
    size: 1,
    baseWeight: 1,
    // weight: 1,
    open: true,
    transparent: true,
  })

  // let testingArea = entityManager.getComponent('Area', testingChamber00178)
  testingChamber00178.area.visited = [player]
  // testingChamber00178.area.([player])
  testingChamber00178.area.doors = {
    n: anotherRoom,
  }

  anotherRoom.area.doors = {
    w: closet,
    s: testingChamber00178,
  }

  entities.store(testingChamber00178)
  entities.store(anotherRoom)
  entities.store(closet)
  entities.store(player)
  entities.store(thing)
  entities.store(sign)
  entities.store(coin)
  entities.store(crate)
  entities.store(rock)
  entities.store(screw)
  entities.store(bolt)
  entities.store(box)
  entities.store(wrench)
  entities.store(weight)
  entities.store(desk)
  entities.store(paper)
  entities.store(yes)
  entities.store(no)
  entities.store(pencil)
  entities.store(tray)
  entities.store(sack)

  player.container.contents = [thing, coin]
  crate.container.contents = [box, bolt]
  box.container.contents = [wrench]
  testingChamber00178.container.contents = [player, crate, screw, rock]
  testingChamber00178.container.fixtures = [sign]
  anotherRoom.container.contents = [weight, desk, sack]
  desk.container.contents = [tray, paper, pencil]
  paper.multipart.parts = [no, yes]

  console.log(JSON.stringify({
    testingChamber00178: testingChamber00178.id,
    anotherRoom: anotherRoom.id,
    player: player.id,
    thing: thing.id,
    rock: rock.id,
    screw: screw.id,
    bolt: bolt.id,
    box: box.id,
    crate: crate.id,
    weight: weight.id,
    coin: coin.id,
  }, null, 2))
  let padLength = 0
  const layout = entities.get().map((entity) => {
    let parent = entity.location.parent
    let parentLabel = parent ? parent.descriptors.labels[0] : 'offscreen'
    let parentId = parent ? parent.id : parentLabel
    let labelLength = entity.descriptors.labels[0].length
    if (labelLength > padLength) {
      padLength = labelLength
    }
    return [entity, parentLabel, parentId]
  })

  layout.sort((a, b) => {
    if (a[1] > b[1]) {
      return -1
    }
    if (a[1] < b[1]) {
      return 1
    }
    return 0
  })

  layout.forEach(([entity, parentLabel, parentId]) => {
    console.log(`${entity.descriptors.labels[0].padEnd(padLength)} -in-> ${parentLabel}`)
    console.log(`${String(entity.id).padEnd(padLength)} -in-> ${parentId}\n`)
  })

  // console.log(JSON.stringify({
  //     player: ['thing'],
  //     testingChamber00178: [
  //         'player',
  //         'bolt',
  //         'crate',
  //     ],
  //     anotherRoom: [
  //         'box',
  //     ],
  //     crate: [
  //         'rock',
  //         'screw,',
  //     ],
  //     box: [
  //         'wrench',
  //     ],
  //     offscreen: [
  //         'testingChamber00178',
  //         'anotherRoom',
  //     ],
  // }, null, 2))

} else {
  console.log('')
  console.log('~~       reset       ~~')
  // console.log('skipped entities')
  // console.log('player: 11')
  player = entities.get({id: 12})
  // player = 12
  // beginningProcess.setStartingPoint(10)
  //
  //     let entities = entityManager.getEntitiesWithComponent('Descriptors')
  //     console.log(entities)
  //     entities.forEach((entity) => {
  //         console.log(entityManager.getComponent('Descriptors', entity))
  //         //
  //     })

  //     entities = entityManager.getEntitiesWithComponent('Container')
  //     entities.forEach((entity) => {
  //         console.log(entityManager.getComponent('Container', entity))
  //     })

  //     entities = entityManager.getEntitiesWithComponent('Location')
  //     entities.forEach((entity) => {
  //         console.log(entityManager.getComponent('Location', entity))
  // //
  //     })
}

module.exports = {
  systems,
  player,
  // generalInputProcess,
  processes,
}
