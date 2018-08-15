const {entityFactory, entityManager} = require('./managers.js')
const ResolverSystem = require('./systems/resolver-system')
const LocatorSystem = require('./systems/locator-system')
const GetterSystem = require('./systems/getter-system')
const DroppingSystem = require('./systems/dropping-system')
const InventorySystem = require('./systems/inventory-system')
const OpenSystem = require('./systems/open-system')
const CloseSystem = require('./systems/close-system')
const MovementSystem = require('./systems/movement-system')
const BeginSystem = require('./systems/begin-system')
const LookSystem = require('./systems/look-system')
const PutSystem = require('./systems/put-system')
const ReadSystem = require('./systems/read-system')
const CheckSystem = require('./systems/check-system')

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
} = require('./components.js')

let resolverSystem = new ResolverSystem()
let locatorSystem = new LocatorSystem()
let getterSystem = new GetterSystem()
let droppingSystem = new DroppingSystem()
let inventorySystem = new InventorySystem()
let openSystem = new OpenSystem()
let closeSystem = new CloseSystem()
let movementSystem = new MovementSystem()
let beginSystem = new BeginSystem()
let lookSystem = new LookSystem()
let putSystem = new PutSystem()
let readSystem = new ReadSystem()
let checkSystem = new CheckSystem()

let systems = {
    resolve: resolverSystem,
    locate: locatorSystem,
    open: openSystem,
    close: closeSystem,
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

// Register a factory method for creating entities
entityFactory.registerConstructor('room', (props = {}) => {
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
        visible,
        transparent,
        visited,
        title,
        doors,
    } = props

    let room = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), room)
    entityManager.addComponent(new Location(parent), room)
    entityManager.addComponent(new Descriptors(['room']), room)
    entityManager.addComponent(new Container({volume, maxLoad, freeVolume, contents, fixtures, open, surface}), room)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, fixture, visible, transparent}), room)
    entityManager.addComponent(new Area(title, visited, doors), room)
    return room
})

entityFactory.registerConstructor('container', (props = {}) => {
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
        visible,
        transparent,
        text,
    } = props
    let container = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), container)
    entityManager.addComponent(new Location(parent), container)
    entityManager.addComponent(new Descriptors(labels, descriptors), container)
    entityManager.addComponent(new Container({volume, maxLoad, freeVolume, contents, fixtures, open, surface}), container)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, fixture, visible, transparent}), container)
    if (text) {
        entityManager.addComponent(new Text(text), container)
    }
    return container
})

entityFactory.registerConstructor('thing', (props = {}) => {
    let {
        parent,
        labels,
        descriptors,
        appearance,
        size,
        baseWeight,
        weight,
        fixture,
        visible,
        transparent,
        text,
    } = props
    let thing = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), thing)
    entityManager.addComponent(new Location(parent), thing)
    entityManager.addComponent(new Descriptors(labels, descriptors), thing)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, fixture, visible, transparent}), thing)
    if (text) {
        entityManager.addComponent(new Text(text), thing)
    }
    return thing
})

entityFactory.registerConstructor('tool', (props = {}) => {
    let {
        parent,
        labels,
        descriptors,
        appearance,
        size,
        baseWeight,
        weight,
        fixture,
        visible,
        transparent,
        text,
        toolType,
    } = props
    let thing = entityManager.createEntity()
    entityManager.addComponent(new Tool(toolType), thing)
    entityManager.addComponent(new Appearance(appearance), thing)
    entityManager.addComponent(new Location(parent), thing)
    entityManager.addComponent(new Descriptors(labels, descriptors), thing)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, fixture, visible, transparent}), thing)
    if (text) {
        entityManager.addComponent(new Text(text), thing)
    }
    return thing
})

entityFactory.registerConstructor('option', (props = {}) => {
    let {
        parent,
        labels,
        descriptors,
        appearance,
        size = 0,
        baseWeight = 0,
        weight,
        fixture,
        visible,
        transparent,
        value,
    } = props
    let option = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), option)
    entityManager.addComponent(new Location(parent), option)
    entityManager.addComponent(new Descriptors(labels, descriptors), option)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, fixture, visible, transparent}), option)
    entityManager.addComponent(new Option(value), option)
    return option
})

entityFactory.registerConstructor('player', (props = {}) => {
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
        visible,
        transparent,
    } = props
    let player = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), player)
    entityManager.addComponent(new Location(parent), player)
    entityManager.addComponent(new Descriptors(['you', 'self', 'me', 'myself'], []), player)
    entityManager.addComponent(new Container({volume, maxLoad, freeVolume, contents, fixtures, open, surface}), player)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, fixture, visible, transparent}), player)

    return player
})

let player

if (entityManager.lowestFreeId === 10) {
    // Great! This is where you create an entity 🤖
    let testingChamber00178 = entityFactory.createRoom({
        title: 'Testing Chamber 00178',
        appearance: 'A bare and forgettable office space.',
        volume: Number.POSITIVE_INFINITY,
        maxLoad: Number.POSITIVE_INFINITY,
        size: Number.POSITIVE_INFINITY,
        baseWeight: Number.POSITIVE_INFINITY,
    })

    let anotherRoom = entityFactory.createRoom({
        title: 'Another Room',
        appearance: 'This all looks unbearably banal. There\'s a rather outdated looking desk in this room. It\'s worn and uninspiring.',
        doors: {
            s: testingChamber00178,
        },
        volume: Number.POSITIVE_INFINITY,
        maxLoad: Number.POSITIVE_INFINITY,
        size: Number.POSITIVE_INFINITY,
        baseWeight: Number.POSITIVE_INFINITY,
    })

    player = entityFactory.createPlayer({
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

    let thing = entityFactory.createThing({
        parent: player,
        labels: ['thing', 'THING', 'thign'],
        appearance: 'An amorphous blob of greyish goop.',
        size: 1,
        baseWeight: 1,
    })

    let sign = entityFactory.createThing({
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

    let coin = entityFactory.createThing({
        parent: player,
        labels: ['coin', 'money'],
        descriptors: ['round', 'shiny', 'silver', 'cold'],
        appearance: 'A large, shiny, silver, coin. It lies cold in the hand.',
        size: 0,
        baseWeight: 0,
        visible: false,
    })

    let crate = entityFactory.createContainer({
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

    let rock = entityFactory.createThing({
        parent: testingChamber00178,
        labels: ['rock'],
        appearance: 'It\'s just a stone.',
        size: 1,
        baseWeight: 1,
    })

    let screw = entityFactory.createThing({
        parent: testingChamber00178,
        labels: ['screw', 'fixture'],
        descriptors: ['red', 'rusty'],
        appearance: 'A rusty screw with flaking red paint on the head.',
        size: 1,
        baseWeight: 1,
    })

    let bolt = entityFactory.createThing({
        parent: testingChamber00178,
        labels: ['bolt', 'fixture'],
        descriptors: ['red'],
        appearance: 'A bolt with chpped red paint on the head.',
        size: 1,
        baseWeight: 1,
    })

    let box = entityFactory.createContainer({
        parent: crate,
        labels: ['box'],
        open: true,
        appearance: 'A small vaguely mildewed shoe box.',
        volume: 2,
        freeVolume: 1,
        maxLoad: 2,
        size: 2,
        baseWeight: 1,
        weight: 2,
    })

    let wrench = entityFactory.createThing({
        parent: box,
        labels: ['wrench'],
        appearance: 'A wrench shaped like a gibbous moon.',
        size: 1,
        baseWeight: 1,
    })

    let weight = entityFactory.createThing({
        parent: anotherRoom,
        labels: ['weight'],
        descriptors: ['lead', 'heavy'],
        appearance: 'A heavy lead weight.',
        size: 1,
        baseWeight: 1,
    })

    let desk = entityFactory.createContainer({
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

    let paper = entityFactory.createContainer({
        parent: desk,
        labels: ['paper'],
        descriptors: ['sheet'],
        appearance: 'A sheet of 8.5"x11" paper.',
        text: 'Please complete this form totally filling in the circles. \nHave you taken this test previously? \nYES: () NO: ()',
        volume: 0,
        maxLoad: 0,
        size: 0,
        baseWeight: 0,
        open: true,
        surface: true,
    })

    let yes = entityFactory.createOption({
        parent: paper,
        labels: ['yes'],
        descriptors: ['option'],
        appearance: 'A printed option reading "YES:" with a little circle beside it. The circle looks like one of those dots that is meant to be read by an automatic machine.',
        size: 0,
        baseWeight: 0,
        fixture: true,
        value: false,
    })

    let no = entityFactory.createOption({
        parent: paper,
        labels: ['no'],
        descriptors: ['option'],
        appearance: 'A printed option reading "NO:" with a little circle beside it. You should probably fill in the circle completely.',
        size: 0,
        baseWeight: 0,
        fixture: true,
        value: false,
    })

    let pencil = entityFactory.createTool({
        parent: desk,
        labels: ['pencil'],
        descriptors: ['yellow', 'ticonderoga'],
        appearance: 'A standard No. 2 HP Pencil. What did you expect?',
        text: 'HB 2 TICONDEROGA',
        size: 0,
        baseWeight: 0,
        toolType: 'write',
    })

    let tray = entityFactory.createContainer({
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

    let testingArea = entityManager.getComponent('Area', testingChamber00178)
    testingArea.setVisited([player])
    testingArea.setDoors({
        n: anotherRoom,
    })

    entityManager.getComponent('Container', player).setContents([thing, coin])
    entityManager.getComponent('Container', crate).setContents([box])
    entityManager.getComponent('Container', box).setContents([wrench])
    entityManager.getComponent('Container', testingChamber00178).setContents([player, bolt, crate, screw, rock])
    entityManager.getComponent('Container', testingChamber00178).setFixtures([sign])
    entityManager.getComponent('Container', anotherRoom).setContents([weight, desk])
    entityManager.getComponent('Container', desk).setContents([tray, paper, pencil])
    entityManager.getComponent('Container', paper).setFixtures([no, yes])

    console.log(JSON.stringify({
        testingChamber00178,
        anotherRoom,
        player,
        thing,
        rock,
        screw,
        bolt,
        box,
        crate,
        weight,
        coin,
    }, null, 4))

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
    // }, null, 4))

} else {
    console.log('')
    console.log('~~       reset       ~~')
    // console.log('skipped entities')
    // console.log('player: 11')
    player = 12
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
    generalInputProcess,
    processes,
}
